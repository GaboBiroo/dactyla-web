<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Tabela de Mensagens com Barreira Criptográfica de Idempotência.
     * A restrição de unicidade no campo `wamid` atua como primeira linha de defesa
     * contra retentativas de envio da infraestrutura da Meta (Exponential Backoff).
     */
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('lead_id')
                ->constrained('leads')
                ->cascadeOnDelete()
                ->comment('Chave estrangeira vinculada ao Lead');
                
            $table->string('wamid')
                ->unique()
                ->comment('WhatsApp Message ID único fornecido pela Meta Cloud API');
                
            $table->enum('direction', ['inbound', 'outbound'])
                ->comment('Direcionamento do fluxo de dados: inbound=lead->bot, outbound=bot->lead');
                
            $table->string('status')
                ->default('queued_for_processing')
                ->comment('Status de processamento: queued_for_processing, processed, failed, ignored');
                
            $table->text('content')
                ->nullable()
                ->comment('Carga textual limpa extraída do payload do WhatsApp');
                
            $table->json('raw_payload')
                ->nullable()
                ->comment('Payload JSON original para auditoria e replays de desenvolvimento');
                
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
