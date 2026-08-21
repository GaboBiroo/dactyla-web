<?php

use App\Http\Controllers\Webhook\MetaWebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Webhook Routes da Meta Graph API v18+
|--------------------------------------------------------------------------
|
| Rota pública protegida por validação criptográfica HMAC SHA-256 no POST
| e handshake de verificação no GET.
|
*/

Route::prefix('webhook')->group(function () {
    // Handshake inicial da Meta (GET)
    Route::get('/meta', [MetaWebhookController::class, 'verify']);

    // Ingestão Event-Driven de Mensagens e Status (POST)
    Route::post('/meta', [MetaWebhookController::class, 'handle']);
});
