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

    public int $tries = 3;
    public int $timeout = 60;

    public function __construct(
        public readonly array $payload
    ) {}

    public function handle(): void
    {
        $entryValue = $this->payload['entry'][0]['changes'][0]['value'] ?? null;

        if (!$entryValue || !isset($entryValue['messages'][0])) {
            Log::warning('[ProcessWhatsAppMessage] Job executado sem estrutura de mensagem válida no payload.');
            return;
        }

        $messageData = $entryValue['messages'][0];
        $contactData = $entryValue['contacts'][0] ?? [];

        $wamid = (string) $messageData['id'];
        $fromPhoneNumber = (string) $messageData['from'];
        $content = (string) ($messageData['text']['body'] ?? '[Mídia / Não Textual]');
        $contactName = (string) ($contactData['profile']['name'] ?? 'Lead WhatsApp');

        DB::transaction(function () use ($wamid, $fromPhoneNumber, $content, $contactName) {
            $lead = Lead::firstOrCreate(
                ['phone_number' => $fromPhoneNumber],
                [
                    'name' => $contactName,
                    'current_state' => 100, // NEW_LEAD
                    'is_bot_active' => true,
                ]
            );

            Message::create([
                'lead_id' => $lead->id ?? 1,
                'wamid' => $wamid,
                'direction' => 'inbound',
                'status' => 'processed',
                'content' => $content,
                'raw_payload' => $this->payload,
            ]);

            Log::info('[ProcessWhatsAppMessage] Mensagem processada e associada à FSM com sucesso.', [
                'phone' => $fromPhoneNumber,
                'name' => $contactName,
                'content' => $content,
                'wamid' => $wamid,
            ]);

            $this->evaluateFsmEngine($lead, $content);
        });
    }

    private function evaluateFsmEngine($lead, string $content): void
    {
        $active = $lead->is_bot_active ?? true;
        $state = (int) ($lead->current_state ?? 100);

        if (!$active || $state === 400) {
            Log::info('[FSM Engine] Intervenção de IA bloqueada para este lead.');
            return;
        }

        switch ($state) {
            case 100: // NEW_LEAD
                Log::info('[FSM Engine] Lead no estado 100 (NEW_LEAD). Disparando fluxo de onboarding.');
                break;
            case 200: // AI_QUALIFICATION
                Log::info('[FSM Engine] Lead no estado 200 (AI_QUALIFICATION). Encaminhando para RAG/LLM.');
                break;
            case 300: // FORM_PENDING
                Log::info('[FSM Engine] Lead no estado 300 (FORM_PENDING). Aguardando envio de Webhook Tally.');
                break;
        }
    }

    public function failed(Exception $exception): void
    {
        Log::error('[ProcessWhatsAppMessage] Job falhou definitivamente no Horizon.', [
            'error' => $exception->getMessage(),
            'payload' => $this->payload,
        ]);
    }
}
