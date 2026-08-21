<?php

declare(strict_types=1);

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessWhatsAppMessage;
use App\Models\Message;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
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
     * Endpoint POST: Gateway Principal de Ingestão Event-Driven.
     */
    public function handle(Request $request): JsonResponse
    {
        try {
            // REGRA #1: Autenticação Criptográfica HMAC SHA-256 imediata
            if (!$this->verifyMetaSignature($request)) {
                Log::warning('[Meta Webhook] HMAC SHA-256 Inválido. Spoofing mitigado.', [
                    'ip' => $request->ip(),
                    'received_sig' => $request->header('X-Hub-Signature-256')
                ]);
                return response()->json(['error' => 'Invalid HMAC Signature'], 401);
            }

            Log::info('[Meta Webhook] HMAC Autenticado com sucesso.');

            $payload = $request->all();

            // Log de auditoria da carga bruta recebida da Meta
            Log::debug('[Meta Webhook Payload Raw]', ['payload' => $payload]);

            // Busca por mensagens na estrutura padrão do payload Meta Cloud API
            $messageData = data_get($payload, 'entry.0.changes.0.value.messages.0');

            // Fallback de verificação caso a mensagem venha em estrutura de nível raiz ou variante
            if (!$messageData) {
                if (isset($payload['messages'][0])) {
                    $messageData = $payload['messages'][0];
                }
            }

            if ($messageData && isset($messageData['id'])) {
                $wamid = (string) $messageData['id'];

                Log::info('[Meta Webhook] Mensagem identificada no payload.', [
                    'wamid' => $wamid,
                    'from' => $messageData['from'] ?? 'Unknown',
                    'body' => data_get($messageData, 'text.body', '[Outro Tipo]')
                ]);

                // REGRA #2: Trava Transacional de Idempotência
                if (Message::where('wamid', $wamid)->exists()) {
                    Log::debug('[Meta Webhook] Notificação duplicada ignorada pela Idempotência.', [
                        'wamid' => $wamid
                    ]);
                    return response()->json(['status' => 'already_processed'], 200);
                }

                // REGRA #3: Desacoplamento Assíncrono via ProcessWhatsAppMessage
                ProcessWhatsAppMessage::dispatch($payload);

                Log::info('[Meta Webhook] Mensagem salva e vinculada à FSM com sucesso!', [
                    'wamid' => $wamid
                ]);
            } else {
                Log::info('[Meta Webhook] Evento de notificação/status da Meta recebido (sem texto de mensagem).', [
                    'raw_payload_structure' => array_keys($payload)
                ]);
            }

            // REGRA #4: Resposta ultra-rápida silencia o gateway externo instantaneamente (< 200ms)
            return response()->json(['status' => 'received'], 200);

        } catch (Exception $e) {
            Log::critical('[Meta Webhook] FALHA CATÁSTROFICA NA CAMADA DE INGESTÃO', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['status' => 'acknowledged_with_errors'], 200);
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
            Log::emergency('[Meta Webhook] APP_SECRET não configurado.');
            return false;
        }

        $rawPayload = $request->getContent();
        $expectedHash = 'sha256=' . hash_hmac('sha256', $rawPayload, $appSecret);

        return hash_equals($expectedHash, $signatureHeader);
    }
}
