<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Lead;
use App\Models\Message;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessWhatsAppMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Número máximo de tentativas de execução do Job.
     */
    public int $tries = 3;

    /**
     * Tempo de timeout em segundos para este Job.
     */
    public int $timeout = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public readonly array $payload
    ) {}

    /**
     * Processamento do Job na fila assíncrona (Laravel Horizon).
     */
    public function handle(): void
    {
        $messageData = data_get($this->payload, 'entry.0.changes.0.value.messages.0');
        $contactData = data_get($this->payload, 'entry.0.changes.0.value.contacts.0');

        if (!$messageData) {
            Log::warning('[ProcessWhatsAppMessage] Job executado sem estrutura de mensagem válida no payload.');
            return;
        }

        $wamid = (string) $messageData['id'];
        $fromPhoneNumber = (string) $messageData['from'];
        $content = data_get($messageData, 'text.body', '[Mídia / Tipo não mapeado]');
        $contactName = data_get($contactData, 'profile.name', 'Lead WhatsApp');

        DB::transaction(function () use ($wamid, $fromPhoneNumber, $content, $contactName) {
            // 1. Busca ou cria o Lead vinculando à FSM com estado padrão 100 (NEW_LEAD)
            $lead = Lead::firstOrCreate(
                ['phone_number' => $fromPhoneNumber],
                [
                    'name' => $contactName,
                    'current_state' => 100, // NEW_LEAD
                    'is_bot_active' => true,
                ]
            );

            // 2. Persiste a mensagem garantindo o registro oficial do audit log no banco
            Message::create([
                'lead_id' => $lead->id,
                'wamid' => $wamid,
                'direction' => 'inbound',
                'status' => 'processed',
                'content' => $content,
                'raw_payload' => $this->payload,
            ]);

            Log::info('[ProcessWhatsAppMessage] Mensagem processada e associada à FSM com sucesso.', [
                'lead_id' => $lead->id,
                'phone' => $fromPhoneNumber,
                'current_state' => $lead->current_state,
                'wamid' => $wamid,
            ]);

            // 3. Avaliação da FSM Engine para acionamento de orquestração n8n / RAG
            $this->evaluateFsmEngine($lead, $content);
        });
    }

    /**
     * Motor de decisão da FSM para roteamento da automação.
     */
    private function evaluateFsmEngine(Lead $lead, string $content): void
    {
        // Se a intervenção automatizada estiver desativada pelo transbordo humano (400) ou formulário (300)
        if (!$lead->is_bot_active || $lead->current_state === 400) {
            Log::info('[FSM Engine] Intervenção de IA bloqueada para este lead.', [
                'lead_id' => $lead->id,
                'current_state' => $lead->current_state,
            ]);
            return;
        }

        // Roteamento condicional para n8n / LLM Engine conforme estado atual
        switch ($lead->current_state) {
            case 100: // NEW_LEAD
                Log::info('[FSM Engine] Lead no estado 100 (NEW_LEAD). Disparando fluxo de onboarding.');
                break;

            case 200: // AI_QUALIFICATION
                Log::info('[FSM Engine] Lead no estado 200 (AI_QUALIFICATION). Encaminhando para RAG/LLM.');
                break;

            case 300: // FORM_PENDING
                Log::info('[FSM Engine] Lead no estado 300 (FORM_PENDING). Aguardando envio de Webhook Tally.');
                break;

            default:
                Log::warning('[FSM Engine] Estado desconhecido para o lead.', ['state' => $lead->current_state]);
                break;
        }
    }

    /**
     * Tratamento em caso de falha completa após o limite de retentativas.
     */
    public function failed(Exception $exception): void
    {
        Log::error('[ProcessWhatsAppMessage] Job falhou definitivamente no Horizon.', [
            'error' => $exception->getMessage(),
            'payload' => $this->payload,
        ]);
    }
}
