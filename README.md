<div align="center">

# ⚡ DACTYLA CODE // ECOSSISTEMA B2B LOCAL-FIRST
### *Engenharia de Receita, Motor de Reativação Preditiva 48h & Automação Comercial de Alta Performance*

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.2-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Docker](https://img.shields.io/badge/Docker-Local--First-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Edge_Serverless-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://www.dactylacode.com.br)

<p align="center">
  <b>Máquina B2B de Geração de Caixa Imediato ("Protocolo Caixa Primeiro em 48h") &amp; Engenharia de Software Proprietária.</b><br>
  Projetada para dominar a retenção de clientes e a automação comercial no Litoral Norte de São Paulo (Caraguatatuba, São Sebastião, Ubatuba e Ilhabela).
</p>

[🌐 Website Oficial](https://www.dactylacode.com.br) • [⚡ Simulador & Auditoria 48h](https://www.dactylacode.com.br/auditoria) • [📊 Dactyla CRM Hub](https://www.dactylacode.com.br/dactyla-hub)

---

</div>

## 🎯 Visão Executiva & Modelo Productized Service ("Protocolo Caixa Primeiro em 48h")

O monorepo da **Dactyla Code** une uma vitrine digital **Dark Luxury** de altíssima conversão (React 19 + Three.js WebGL + Leaflet Geo-Mapping) a uma infraestrutura **Local-First de Custo Marginal Zero** para reativação preditiva de clientes inativos via WhatsApp.

### Os 3 Subnichos-Alvo Homologados (Estudo Caraguatatuba/SP)

| Subnicho Local | Ticket Médio | Ciclo Ideal | Ponto de Equilíbrio (MRR R$ 130/mês) | Projeção (15 Recuperados/mês) |
| :--- | :---: | :---: | :--- | :---: |
| 🔧 **Oficinas / Centros Automotivos / Troca de Óleo** | `R$ 320,00` | `150 dias` | **1 carro recuperado/mês** já paga a mensalidade e deixa R$ 190 de lucro | **R$ 4.800/mês** |
| 🐾 **Pet Shops / Banho & Tosa / Clínicas Vet** | `R$ 85,00` | `30 dias` | **2 banhos recuperados/mês** já pagam o sistema (R$ 0/msg vs. R$ 0,50/msg SimplesVet) | **R$ 1.275/mês** |
| 💈 **Barbearias & Estética Masculina** | `R$ 75,00` | `21 dias` | **2 combos no caixa bruto** (ou 4 no lucro líquido) pagam toda a operação | **R$ 1.125/mês** |

### Escada de Produtos (Pricing Tiers)
1. **Nível 01 — Motor de Reativação 48h (Destaque Principal — Protocolo Risco Zero)**:
   - **Setup:** `R$ 400,00` *(pago somente após validação prática de 48h abordando 60 clientes inativos da loja)*.
   - **MRR:** `R$ 130,00/mês` *(sustentação técnica, hospedagem local da instância, R$ 0,00 de taxa por mensagem, aviso de serviço pronto com 1 clique e campanhas de terça/quarta-feira)*.
2. **Nível 02 — Presença Prime + Motor IA**:
   - **Setup:** `R$ 1.350,00` + `R$ 147,00/mês` *(SPA em Next.js/React Score 90+ Lighthouse + SEO Local Google Maps + Motor de Reativação 48h completo + Nó no Mapa Interativo de Caraguá)*.
3. **Nível 03 — Engenharia Custom / Big Data**:
   - **Sob Consulta** *(Sistemas Multi-Tenant, ETL de bancos legados Firebird `.fdb`, Engenharia de Dados RAIS/CAGED e renderização 3D interativa)*.

---

## 📐 Topologia da Arquitetura Híbrida (Vercel Edge + Host Local 32GB RAM)

```mermaid
flowchart TD
    subgraph EDGE ["☁️ Vercel Cloud Edge (Frontend + Serverless API)"]
        UI["Landing Page Dark Luxury (React 19 + Three.js + Leaflet)"]
        CALC["Calculadora Interativa de ROI (#impacto)"]
        AUDIT["Funil de Diagnóstico & Risco Zero (/auditoria)"]
        HUB["Dactyla CRM Kanban Hub (/dactyla-hub)"]
        API_CONTACT["POST /api/contact (Resend Transactional Email)"]
        API_SYNC["GET/POST /api/leads-sync (2-Way Cloud Kanban Sync)"]
        API_AUTH["POST /api/auth-crm (HMAC-SHA256 timingSafeEqual)"]
    end

    subgraph LOCAL_HOST ["🖥️ Servidor Host Local-First (Ryzen 5 5600G | 32GB RAM | Docker Compose)"]
        CF["Cloudflare Tunnel (cloudflared Zero-Trust)"]
        EVO["Evolution API v2.1.1 (Multi-Instance WhatsApp Engine)"]
        N8N_MAIN["n8n Main Orchestrator (Queue Mode)"]
        N8N_WORK["n8n Worker (--concurrency=10)"]
        PG[("PostgreSQL 16 Alpine (n8n + evolution + multi-tenant DB)")]
        RD[("Redis 7 Alpine (Bull Queue & Instance Cache)")]
    end

    subgraph PROSPECTOR ["🤖 Dactyla Prospector & Reactivation Suite (Node.js + Python)"]
        MINER["miner.py (Scraper & Fila 3 Subnichos Caraguá)"]
        DISPARO["disparo_massa.cjs (Outbound IA + Spintax + Jitter 45-120s)"]
        REACT_ENG["client_reactivation_engine.cjs (3 Playbooks B2B + Cap 20/dia/loja)"]
        BOT["bot.cjs (Consultor LLM Hybrid: Gemini / Groq / Ollama Llama 3.2)"]
    end

    UI --> CALC
    UI --> AUDIT
    AUDIT -->|POST Lead + Trigger #AUDITORIA_DACTYLA| API_SYNC
    AUDIT -->|Redireciona WhatsApp 5512992109408| BOT
    UI -->|Briefing Modal| API_CONTACT
    HUB <-->|Sincronização em Tempo Real| API_SYNC

    CF --> N8N_MAIN
    CF --> EVO
    N8N_MAIN <--> RD
    N8N_WORK <--> RD
    N8N_MAIN <--> PG
    EVO <--> PG
    EVO <--> RD

    MINER -->|mined_leads_unused.json| DISPARO
    MINER -->|POST x-prospector-key| API_SYNC
    BOT -->|Move Card no Kanban| API_SYNC
    REACT_ENG -->|Disparo Humanizado (Typing 4s + Jitter 45-120s)| EVO
```

---

## 🎨 Design System: Dark Luxury & Performance GPU

O frontend foi engenheirado para atingir fluidez de 60 FPS tanto em desktops quanto em dispositivos móveis de entrada:

- **Paleta Cromática Rigorosa**:
  - `#0A140E` *(Dark Moss — Background Primário)*
  - `#E8F0EA` *(Light Leaf — Tipografia Principal & Contraste Pricing)*
  - `#28593B` *(Forest Green — Bordas Estruturais & Glow Ambiental)*
  - `#D4AF37` *(Luxury Gold — Destaques, Badges de ROI e CTAs Primários)*
- **Tipografia Editorial & Técnica**:
  - Títulos: `Cormorant Garamond` (Serif Editorial)
  - Corpo e UI: `Plus Jakarta Sans` (Sans-Serif Geométrica)
  - Dados, Métricas e Badges: `JetBrains Mono` (Monospace Técnica)
- **Engenharia 3D & Prevenção de Scroll-Trap**:
  - Renderização WebGL (`@react-three/fiber` + `@react-three/drei`) do mascote oficial `Tamandua.gltf` no desktop (`window.innerWidth >= 768`) e geometria vetorial acelerada por hardware (`StandaloneRotatingGeometry`) no mobile, eliminando travamentos de rolagem (`pointer-events-none md:pointer-events-auto` e `transform-gpu will-change-transform`).

---

## 🗂️ Estrutura Completa do Monorepo

```text
Agencia de Tecnologia/
├── api/                                         # Vercel Serverless Functions (Node.js ESM)
│   ├── auth-crm.js                              # Autenticação HMAC-SHA256 com crypto.timingSafeEqual
│   ├── contact.js                               # Disparo transacional Resend (Motor 48h & Projetos Custom)
│   └── leads-sync.js                            # API REST 2-Way para o Kanban Executivo (/dactyla-hub)
│
├── docker/
│   └── postgres/
│       └── init.sql                             # Criação automática dos DBs (n8n, evolution) e tabelas multi-tenant
│
├── dactyla_prospector/                          # Motor B2B de Prospecção & Reativação de Clientes
│   ├── bot.cjs                                  # Assistente Conversacional LLM (Gemini/Groq/Ollama) + #AUDITORIA_DACTYLA
│   ├── client_reactivation_engine.cjs           # Produto B2B: Motor de Reativação com 3 Playbooks Spintax e Cap 20/dia
│   ├── disparo_massa.cjs                        # Outbound nos 3 nichos com Inbox Zero, Typing 4s e Jitter 45s-120s
│   ├── miner.py                                 # Minerador perpétuo focado em Oficinas, Pet Shops e Barbearias de Caraguá
│   ├── security_sanitizer.cjs                   # DevSecOps: Anti-Prompt Injection, Path Traversal e Validador JID
│   ├── sample_client_inactives.json             # Base de demonstração para Dry-Run dos 3 Playbooks de Reativação
│   └── package.json                             # Scripts operacionais (start, disparo, reactivate, test-ai)
│
├── dactyla_engine/                              # Engenharia de PDV Offline-First & Big Data Regional
│   ├── etl_firebird_migrator.py                 # Extrator ETL de bancos legados Firebird (.fdb) para UTF-8
│   ├── market_intelligence_rais_caged.py        # Inteligência econômica do Litoral Norte SP
│   ├── sat_nfc_bridge.go                        # Bridge REST em Go para comunicação com hardware SAT SEFAZ-SP
│   └── web_thermal_printer.js                   # Impressão térmica direta via navegador (WebUSB / Web Serial ESC/POS)
│
├── presenca-prime/                              # Micro-Framework Webhook Meta Cloud API (PHP 8.2+)
│   ├── app/Models/Lead.php                      # Persistência resiliente PostgreSQL / SQLite com path dinâmico
│   ├── app/Models/Message.php                   # Registro de WAMIDs e payloads com idempotência
│   └── public/index.php                         # Front-controller para validação HMAC-SHA256 da Meta
│
├── src/                                         # Aplicação Frontend React 19 + Vite 8 + Tailwind CSS v4
│   ├── components/
│   │   ├── HeroSection.jsx                      # Hero "Resgate os Clientes Sumidos em 48h" + Tamanduá 3D + Mapa
│   │   ├── ConcreteImpact.jsx                   # Calculadora Interativa de ROI por Subnicho + 3 Blocos de Impacto
│   │   ├── PricingSection.jsx                   # 3 Tiers (Motor 48h R$ 400 + R$ 130/mês em destaque)
│   │   ├── AuditoriaDactyla.jsx                 # Diagnóstico Interativo + Cálculo de Break-Even + Gatilho WhatsApp
│   │   ├── DactylaHub.jsx                       # CRM Kanban Cloud com Sincronização Automática
│   │   ├── BriefingModal.jsx                    # Captura rápida para o Protocolo Risco Zero
│   │   ├── EliteFooter.jsx                      # Rodapé com Integração Cal.com e WhatsApp Unificado (5512992109408)
│   │   └── MapComponent.jsx                     # Mapa Interativo Leaflet de Caraguatatuba
│   └── App.jsx                                  # Roteamento SPA + Code-Splitting com React.lazy()
│
├── docker-compose.yml                           # Stack Local-First (Postgres 16 + Redis 7 + Evolution v2 + n8n Queue + Cloudflared)
├── vercel.json                                  # Rewrites SPA e roteamento Serverless na Vercel
└── package.json                                 # Dependências e scripts de build do ecossistema web
```

---

## 🚀 Guia Rápido de Operação

### 1. Executar o Frontend e Build de Produção
```bash
# Instalar dependências na raiz
npm install

# Servidor de desenvolvimento local (http://localhost:5173)
npm run dev

# Compilar bundle otimizado de produção para a Vercel
npm run build
```

### 2. Subir a Infraestrutura Docker Local-First (32GB RAM Stack)
```bash
# Inicia PostgreSQL 16, Redis 7, Evolution API v2, n8n (Main + Worker em Queue Mode) e Cloudflare Tunnel
docker compose up -d
```

### 3. Operar o Motor de Reativação de Clientes dos Lojistas (`client_reactivation_engine.cjs`)
O motor conta com **3 Playbooks Oficiais com Spintax Nativo** (`REATIVACAO_PREDITIVA`, `SERVICO_CONCLUIDO`, `OFERTA_TERCA_QUARTA`), simulação de digitação de `4000ms`, Jitter anti-ban de `45s` a `120s` e trava estrita de `20 disparos/dia por loja`:

```bash
# Testar os 3 Playbooks em modo simulação (sem abrir o navegador)
node dactyla_prospector/client_reactivation_engine.cjs --dry-run

# Executar disparos reais para a planilha/JSON de inativos de um lojista
node dactyla_prospector/client_reactivation_engine.cjs --file dactyla_prospector/sample_client_inactives.json
```

### 4. Operar o Minerador e Prospecção B2B dos 3 Subnichos em Caraguatatuba
```bash
# 1. Minerar novos celulares válidos (DDD 12 + 9º dígito) de Oficinas, Pet Shops e Barbearias
python dactyla_prospector/miner.py

# 2. Disparar abordagem do Teste de 48h (Risco Zero) respeitando horário comercial e Jitter 45s-120s
node dactyla_prospector/disparo_massa.cjs

# 3. Iniciar o Bot Consultivo de Recepção Inbound (#AUDITORIA_DACTYLA)
node dactyla_prospector/bot.cjs
```

---

## 🛡️ Engenharia de Segurança (DevSecOps)

- **Sanitização Contra Prompt Injection ([`security_sanitizer.cjs`](file:///c:/Users/Usuario/Desktop/Agencia%20de%20Tecnologia/dactyla_prospector/security_sanitizer.cjs))**: Filtragem ativa de instruções adversárias antes do envio para os modelos LLM (Gemini / Groq / Ollama Local).
- **Prevenção de Path Traversal (CWE-22) e Prototype Pollution (CWE-1321)**: Validação estrita de caminhos resolvidos e reviver seguro de JSON.
- **Autenticação Timing-Safe ([`api/auth-crm.js`](file:///c:/Users/Usuario/Desktop/Agencia%20de%20Tecnologia/api/auth-crm.js))**: Comparação criptográfica em tempo constante via `crypto.timingSafeEqual` com assinatura HMAC-SHA256.
- **Exposição Zero-Trust**: Webhooks locais do `n8n` e `Evolution API` expostos exclusivamente via túnel criptografado outbound (`cloudflared`), sem abertura de portas NAT no roteador.

---

<div align="center">
  <b>Dactyla Code © 2026 — Engenharia de Receita &amp; Automação B2B Local-First</b><br>
  <sub>Fundada por <b>Gabriel Hatakeyama</b> (CTO) &amp; <b>Matheus Vicente</b> (Diretor Criativo &amp; UX/UI) — Caraguatatuba, SP</sub>
</div>
