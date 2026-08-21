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
     * Tabela de Leads com Máquina de Estados Finitos (FSM).
     * Estados Lógicos da FSM:
     * - 100: NEW_LEAD (Boas-vindas e aceite LGPD inicial)
     * - 200: AI_QUALIFICATION (Qualificação ativa via RAG / LLM)
     * - 300: FORM_PENDING (Aguardando preenchimento do formulário Tally - Bloqueio de IA)
     * - 400: HUMAN_HANDOFF (Transbordo humano ativado - Bloqueio de IA)
     */
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('phone_number')->unique()->comment('Identificador MSISDN sanitizado E.164');
            $table->string('name')->nullable()->comment('Nome capturado no perfil do WhatsApp ou Tally');
            
            $table->integer('current_state')
                ->default(100)
                ->index()
                ->comment('FSM State: 100=NEW_LEAD, 200=AI_QUALIFICATION, 300=FORM_PENDING, 400=HUMAN_HANDOFF');
                
            $table->boolean('is_bot_active')
                ->default(true)
                ->comment('Flag de controle global de intervenção automatizada');
                
            $table->json('metadata')
                ->nullable()
                ->comment('Carga JSON estendida (Dados de qualificação Tally, UTMS, Contexto)');
                
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
