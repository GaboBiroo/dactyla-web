-- =============================================================================
-- DACTYLA CODE // INFRAESTRUTURA LOCAL-FIRST (POSTGRESQL 16 MULTI-TENANT INIT)
-- Cria os bancos dedicados para n8n e Evolution API v2, além do schema central
-- de controle de disparos, reativação preditiva e auditoria anti-ban.
-- =============================================================================

SELECT 'CREATE DATABASE n8n'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'n8n')\gexec

SELECT 'CREATE DATABASE evolution'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'evolution')\gexec

-- Conecta ao banco padrão (dactyla_core / postgres) para criar as tabelas multi-tenant B2B
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabela de Lojistas Parceiros (Tenants de Caraguatatuba)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_name VARCHAR(150) NOT NULL,
    niche VARCHAR(50) NOT NULL CHECK (niche IN ('oficina', 'petshop', 'barbearia', 'outro')),
    owner_name VARCHAR(120),
    whatsapp_number VARCHAR(30) NOT NULL UNIQUE,
    evolution_instance VARCHAR(100) UNIQUE,
    plan_tier VARCHAR(50) NOT NULL DEFAULT 'motor_48h_130',
    setup_paid BOOLEAN NOT NULL DEFAULT FALSE,
    mrr_value NUMERIC(10, 2) NOT NULL DEFAULT 130.00,
    daily_dispatch_limit INT NOT NULL DEFAULT 20,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabela de Clientes Inativos por Loja (Motor de Reativação 48h & Preditivo)
CREATE TABLE IF NOT EXISTS inactive_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_name VARCHAR(150) NOT NULL,
    phone_jid VARCHAR(40) NOT NULL,
    item_pet_or_car VARCHAR(150) DEFAULT 'atendimento',
    days_inactive INT NOT NULL DEFAULT 60,
    last_service_date DATE,
    campaign_type VARCHAR(40) NOT NULL DEFAULT 'REATIVACAO_PREDITIVA'
        CHECK (campaign_type IN ('REATIVACAO_PREDITIVA', 'SERVICO_CONCLUIDO', 'OFERTA_TERCA_QUARTA')),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'DISPATCHED', 'REPLIED', 'BOOKED', 'OPT_OUT', 'INVALID_NUMBER')),
    last_dispatched_at TIMESTAMPTZ,
    replied_at TIMESTAMPTZ,
    recovered_revenue NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, phone_jid, campaign_type)
);

-- 3. Tabela de Logs de Disparo Anti-Ban (Controle de Jitter 45s-120s & Limite 20/dia/loja)
CREATE TABLE IF NOT EXISTS dispatch_logs (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES inactive_customers(id) ON DELETE SET NULL,
    phone_jid VARCHAR(40) NOT NULL,
    campaign_type VARCHAR(40) NOT NULL,
    message_sent TEXT NOT NULL,
    jitter_delay_ms INT NOT NULL DEFAULT 45000,
    typing_duration_ms INT NOT NULL DEFAULT 4000,
    status VARCHAR(30) NOT NULL DEFAULT 'SENT',
    error_details TEXT,
    dispatched_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inactive_customers_tenant_status
    ON inactive_customers (tenant_id, status, days_inactive DESC);

CREATE INDEX IF NOT EXISTS idx_dispatch_logs_daily_cap
    ON dispatch_logs (tenant_id, dispatched_date, status);
