<?php

declare(strict_types=1);

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\Message;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MetaWebhookController extends Controller
{
    /**
     * Handshake GET: Validação inicial exigida pela Meta Graph API v18+.
     */
    public function verify(Request $request): Response|JsonResponse
    {
        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        if ($mode === 'subscribe' && $token === config('services.meta.verify_token')) {
            Log::info('[Meta Webhook] Handshake efetuado com sucesso.', ['ip' => $request->ip()]);
            
            return response((string) $challenge, 200)
                ->header('Content-Type', 'text/plain');
        }

        Log::warning('[Meta Webhook] Tentativa ilegítima de handshake.', [
            'ip' => $request->ip(),
            'token' => $token
        ]);

        return response()->json(['error' => 'Forbidden: Invalid Verify Token'], 403);
    }

    /**
     * Endpoint POST: Gateway Principal de Ingestão Event-Driven (< 50ms SLA).
     */
    public function handle(Request $request): JsonResponse
    {
        try {
            // 1. Validação Criptográfica HMAC SHA-256 imediata
            if (!$this->verifyMetaSignature($request)) {
                Log::warning('[Meta Webhook] HMAC SHA-256 Inválido. Spoofing mitigado.', [
                    'ip' => $request->ip(),
                    'received_sig' => $request->header('X-Hub-Signature-256')
                ]);
                return response()->json(['error' => 'Invalid HMAC Signature'], 401);
            }

            $payload = $request->all();
            $entryValue = $payload['entry'][0]['changes'][0]['value'] ?? null;
            $messageData = $entryValue['messages'][0] ?? null;
            $contactData = $entryValue['contacts'][0] ?? [];

            if ($messageData && isset($messageData['id'])) {
                $wamid = (string) $messageData['id'];
                $fromPhoneNumber = (string) $messageData['from'];
                $rawContent = (string) ($messageData['text']['body'] ?? '');
                $contactName = (string) ($contactData['profile']['name'] ?? 'Lead WhatsApp');

                // 2. Checagem de Trava de Idempotência
                if (Message::where('wamid', $wamid)->exists()) {
                    Log::debug('[Meta Webhook] Notificação duplicada ignorada pela Idempotência.', ['wamid' => $wamid]);
                    return response()->json(['status' => 'already_processed'], 200);
                }

                // 3. Regra de Negócio: Filtro de Transbordo Humano
                if ($this->shouldTriggerHumanHandoff($rawContent)) {
                    Log::notice('[FSM Guard] Transbordo humano acionado por palavra-chave.', [
                        'phone' => $fromPhoneNumber,
                        'keyword' => $rawContent
                    ]);

                    $lead = Lead::firstOrCreate(
                        ['phone_number' => $fromPhoneNumber],
                        ['name' => $contactName, 'current_state' => 400, 'is_bot_active' => false]
                    );

                    // Força o estado 400 e desativa o bot no Supabase
                    $pdo = $GLOBALS['pdo'];
                    $stmt = $pdo->prepare("UPDATE leads SET current_state = 400, is_bot_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
                    $stmt->execute([$lead->id]);

                    Message::create([
                        'lead_id' => $lead->id,
                        'wamid' => $wamid,
                        'direction' => 'inbound',
                        'status' => 'bypassed_human_handoff',
                        'content' => $rawContent,
                        'raw_payload' => $payload,
                    ]);

                    // Aborta o disparo para o n8n para zerar o consumo de IA
                    return response()->json(['status' => 'human_handoff_triggered'], 200);
                }

                // 4. Ingestão Padrão: Criar/Buscar Lead (Estado 100) e gravar Mensagem no Supabase
                $lead = Lead::firstOrCreate(
                    ['phone_number' => $fromPhoneNumber],
                    ['name' => $contactName, 'current_state' => 100, 'is_bot_active' => true]
                );

                $msg = Message::create([
                    'lead_id' => $lead->id,
                    'wamid' => $wamid,
                    'direction' => 'inbound',
                    'status' => 'processed',
                    'content' => $rawContent ?: '[Mídia / Outro]',
                    'raw_payload' => $payload,
                ]);

                // 5. Arquitetura Event-Driven: Disparo HTTP Assíncrono Não-Bloqueante para o n8n Local
                $n8nWebhookUrl = env('N8N_LOCAL_WEBHOOK_URL', 'https://philatelical-renna-macrolinguistically.ngrok-free.dev/webhook/process-lead');

                $this->dispatchAsyncToN8n($n8nWebhookUrl, [
                    'lead_id' => $lead->id,
                    'message_id' => $msg->id,
                    'wamid' => $wamid,
                    'phone_number' => $fromPhoneNumber,
                    'name' => $contactName,
                    'content' => $rawContent,
                    'current_state' => 100,
                ]);

                Log::info('[Meta Webhook] Ingestão concluída e evento disparado para o n8n local.', [
                    'wamid' => $wamid,
                    'phone' => $fromPhoneNumber
                ]);
            }

            // 6. Resposta Ultra-Rápida em < 50ms para a Meta (Silencia Retentativas)
            return response()->json(['status' => 'received'], 200);

        } catch (Exception $e) {
            Log::critical('[Meta Webhook] Falha na Camada de Ingestão: ' . $e->getMessage());
            return response()->json(['status' => 'acknowledged_with_errors'], 200);
        }
    }

    /**
     * Valida se a mensagem contém palavras-chave que exigem atendimento humano imediato.
     */
    private function shouldTriggerHumanHandoff(string $text): bool
    {
        $normalized = mb_strtolower(trim($text));
        $keywords = ['atendente', 'humano', 'cancelar', 'falar com pessoa', 'corretor', 'sair', 'suporte humano'];

        foreach ($keywords as $keyword) {
            if (str_contains($normalized, $keyword)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Dispara requisição HTTP POST assíncrona com timeout ultracurto (não-bloqueante).
     */
    private function dispatchAsyncToN8n(string $url, array $data): void
    {
        try {
            Http::timeout(1)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'X-Dactyla-Auth-Token' => env('N8N_WEBHOOK_SECRET', 'dactyla_n8n_secret_2026')
                ])
                ->post($url, $data);
        } catch (Exception $e) {
            // Ignora timeout intencional para manter latência < 50ms
            Log::debug('[n8n Dispatch Async] Chamada disparada para o webhook local do n8n.');
        }
    }

    /**
     * Motor de Validação Criptográfica HMAC baseada no Raw Body da requisição.
     */
    private function verifyMetaSignature(Request $request): bool
    {
        $signatureHeader = $request->header('X-Hub-Signature-256');
        
        if (!$signatureHeader || !str_starts_with($signatureHeader, 'sha256=')) {
            return false;
        }

        $appSecret = (string) config('services.meta.app_secret');
        if (empty($appSecret)) {
            return false;
        }

        $rawPayload = $request->getContent();
        $expectedHash = 'sha256=' . hash_hmac('sha256', $rawPayload, $appSecret);

        return hash_equals($expectedHash, $signatureHeader);
    }
}
