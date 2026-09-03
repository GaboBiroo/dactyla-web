<div align="center">

# ⚡ DACTYLA CODE ECOSYSTEM
### *Enterprise Autonomous Prospecting Engine, High-Ticket CRM & Offline-First POS Architecture*

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vercel](https://img.shields.io/badge/Vercel-Serverless-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Go](https://img.shields.io/badge/Go-1.21+-00ADD8?style=for-the-badge&logo=go&logoColor=white)](https://go.dev/)
[![Ollama](https://img.shields.io/badge/Ollama-Llama_3.2_1B-FF6F00?style=for-the-badge&logo=meta&logoColor=white)](https://ollama.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary_Enterprise-D4AF37?style=for-the-badge)](https://www.dactylacode.com.br)

<p align="center">
  <b>Plataforma de alta performance para Engenharia de Software B2B, Automação Comercial Omnichannel e Prospecção Autônoma 24/7.</b><br>
  Projetada especificamente para o mercado corporativo do Litoral Norte de São Paulo (Caraguatatuba, São Sebastião, Ubatuba e Ilhabela).
</p>

---

</div>

## 📐 Arquitetura do Sistema (System Topology)

O **Dactyla Code Ecosystem** combina uma infraestrutura Serverless global na nuvem Vercel com um conjunto de micro-agentes autônomos locais em Python/Node.js e uma IA conversacional executiva com inferência local em menos de 1 segundo.

```mermaid
graph TD
    subgraph CLOUD_EDGE ["☁️ Vercel Cloud Infrastructure (Next.js / Serverless)"]
        A["Landing Page & Web App (React 19 / Vite)"]
        B["API /api/auth-crm (HMAC-SHA256 Auth)"]
        C["API /api/contact (Resend Email Dispatch)"]
        D["API /api/leads-sync (Kanban 2-Way REST Sync)"]
        E["CRM Kanban Hub (/dactyla-hub)"]
    end

    subgraph PROSPECTION_CORE ["🤖 Dactyla Prospector Suite (24/7 Local Engine)"]
        F["autopilot.py (2h Loop Orchestrator)"]
        G["miner.py (RastroLead Scoring Scraper)"]
        H["form_sniper.py (Headless Playwright Chromium)"]
        I["email_bot.py (Resend Cold Email Machine)"]
        J["anti_spam.py (Atomic JSON DB)"]
    end

    subgraph AI_LOCAL_CORE ["🧠 Local AI & WhatsApp Engine (Ollama / Llama 3.2)"]
        K["Ollama Daemon (http://127.0.0.1:11434)"]
        L["llama3.2:1b (1B Neural Quantized Model)"]
        M["bot.cjs (whatsapp-web.js + State Machine)"]
    end

    subgraph DACTYLA_ENGINE ["⚡ Dactyla Engine (POS & Offline-First Bridge)"]
        N["etl_firebird_migrator.py (.fdb -> UTF-8 ETL)"]
        O["web_thermal_printer.js (WebUSB Driverless ESC/POS)"]
        P["sat_nfc_bridge.go (Go REST Bridge :8080 SAT/NFC-e)"]
        Q["smart_inventory_ai.py (Preditivo & Regras SEFAZ-SP)"]
    end

    %% Conexões e Fluxos
    F -->|Ciclo a cada 2h| G
    G -->|Leads Qualificados| H
    G -->|Cold Emails| I
    G -->|POST x-prospector-key| D
    H -->|Submit Form| E
    I -->|HTML Dark Email| E
    M <-->|HTTP POST Generate| K
    K <-->|Inference <1s| L
    M -->|PATCH Lead Stage| D
    N -->|Batch Upload| D
    O -->|Raw Bytes ESC/POS| P
```

---

## 🗂️ Estrutura de Diretórios (Directory Tree)

```text
c:\Users\Usuario\Desktop\Agencia de Tecnologia\
├── api/                             # Vercel Serverless Functions
│   ├── auth-crm.js                  # Login seguro HMAC-SHA256 com timingSafeEqual
│   ├── contact.js                   # Captura de briefing do site & Resend Email
│   └── leads-sync.js                # Sincronização 2-Way do CRM Kanban Cloud
│
├── dactyla_prospector/              # Suíte de Automação & Prospecção 24/7
│   ├── autopilot.py                 # Orquestrador contínuo a cada 2h + Relatório por E-mail
│   ├── miner.py                     # Scraper B2B com Inteligência RastroLead & Scoring
│   ├── form_sniper.py               # Disparador Headless Playwright em Formulários B2B
│   ├── email_bot.py                 # Máquina de Cold E-mail via Resend SDK
│   ├── bot.cjs                      # Atendimento WhatsApp 24/7 com IA Local Llama 3.2
│   ├── anti_spam.py                 # Banco de dados anti-duplicação com gravação atômica
│   ├── whatsapp_hub.py              # Construtor de links 1-clique & Exportador CSV
│   └── .env                         # Variáveis de ambiente locais (RESEND_API_KEY, etc.)
│
├── dactyla_engine/                  # Módulo Isolado de Automação Comercial & POS
│   ├── etl_firebird_migrator.py     # Migrador ETL assíncrono de bases .fdb (Firebird)
│   ├── web_thermal_printer.js       # SDK Driverless WebUSB / Web Serial API (ESC/POS)
│   ├── sat_nfc_bridge.go            # Microsserviço REST em Go (:8080) para SAT SEFAZ-SP
│   ├── smart_inventory_ai.py        # Motor Preditivo de Estoque & Auditoria Fiscal (CFOP/NCM)
│   └── README.md                    # Documentação do módulo de engenharia comercial
│
├── src/                             # Front-End React 19 + Vite
│   ├── components/
│   │   ├── DactylaHub.jsx           # CRM Kanban Executivo com indicador Autopilot 24/7
│   │   ├── BriefingModal.jsx        # Modal High-Ticket com botão direto para WhatsApp
│   │   ├── HeroSection.jsx          # Hero com mascote 3D Tamanduá Dactyla
│   │   └── ...                      # Demais componentes estilizados com Tailwind CSS
│   └── App.jsx                      # Roteador SPA (/dactyla-hub, /privacidade, /)
│
├── vercel.json                      # Configuração de Rewrites SPA para Vercel Edge
├── vite.config.js                   # Bundler de alta performance (Build em 5.4s)
└── package.json                     # Configurações do projeto Node.js
```

---

## 🛠️ Guia de Instalação e Execução (Developer Guide)

### 1. Pré-Requisitos do Sistema
- **Node.js** v20.0+ e **npm**
- **Python** 3.11+
- **Ollama** v0.33.2+ com o modelo `llama3.2:1b` baixado (`ollama pull llama3.2:1b`)
- **PM2** instalado globalmente (`npm install -g pm2`)

### 2. Configuração de Variáveis de Ambiente
Crie ou edite o arquivo `dactyla_prospector/.env`:

```env
PROSPECTOR_API_KEY=dactyla_prospector_secret_2026
CLOUD_SYNC_URL=https://www.dactylacode.com.br/api/leads-sync
OLLAMA_URL=http://127.0.0.1:11434/api/generate
RESEND_API_KEY=re_sua_chave_resend_aqui
RESEND_SENDER_EMAIL=onboarding@resend.dev
MY_NOTIFICATION_EMAIL=agenciadactylacode@gmail.com
```

### 3. Instalação de Dependências
```bash
# Dependências do Front-End e APIs
npm install

# Dependências da Suíte de Prospecção Python
pip install requests beautifulsoup4 duckduckgo_search playwright python-dotenv resend
playwright install chromium
```

### 4. Execução dos Processos 24/7 em Segundo Plano (PM2)

```powershell
# 1. Iniciar o Servidor de IA Local (Ollama)
start C:\Users\Usuario\AppData\Local\Programs\Ollama\ollama.exe serve

# 2. Iniciar a Suíte de Prospecção Autônoma
npx pm2 start dactyla_prospector/autopilot.py --name dactyla-prospector --interpreter python

# 3. Iniciar o Bot do WhatsApp com IA Llama 3.2
npx pm2 start dactyla_prospector/bot.cjs --name dactyla-bot

# 4. Iniciar a IA Preditiva de Estoque & Auditoria Fiscal
npx pm2 start dactyla_engine/smart_inventory_ai.py --name dactyla-ai --interpreter python

# 5. Salvar estado do PM2 para reinicialização automática no Windows
npx pm2 save
```

---

## 🔒 Segurança e Conformidade
- **CORS Estrito**: Restrição de origens permitidas (`https://www.dactylacode.com.br`).
- **Sanitização de XSS**: Tratamento de caracteres no payload via `escapeHTML`.
- **Zero Hardcoded Passwords**: Credenciais e chaves isoladas em variáveis de ambiente.
- **Conformidade SEFAZ-SP**: Assinatura criptográfica A1 e contingência física via SAT.

---

<div align="center">
  <b>Dactyla Code © 2026 — Engenharia de Software & Growth B2B de Alta Performance</b>
</div>
