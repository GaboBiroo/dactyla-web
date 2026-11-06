# 🏪 DACTYLA STORE APPLIANCE // MANUAL PLUG-AND-PLAY DE IMPLANTAÇÃO NO COMÉRCIO
### *Standard Operating Procedure (SOP) — Padrão Engenharia de Software Poli-USP & Harvard Business School*

Este diretório (`dactyla_store_appliance/`) contém o **Kit Plug-and-Play de Implantação nas Dependências do Comércio** para entregar o **Protocolo Caixa Primeiro em 48h (Setup R$ 400 + R$ 130/mês)** em qualquer **Oficina Mecânica / Troca de Óleo**, **Pet Shop / Banho & Tosa** ou **Barbearia** de Caraguatatuba em **menos de 10 minutos**.

---

## 🧭 Arquitetura de Implantação (2 Modos de Operação)

Você pode operar cada lojista fechado em qualquer um dos dois modos abaixo, sem alterar uma linha de código:

| Modo de Operação | Como Funciona | Quando Usar |
| :--- | :--- | :--- |
| **Modo A: 100% Remoto / Cloud + Servidor do CTO (Zero Instalação na Loja)** | O lojista acessa `https://www.dactylacode.com.br/balcao` no celular ou PC do caixa, cola/importa os 60 inativos (ou manda a foto/planilha para você), escaneia o QR Code uma única vez e a instância roda no seu servidor Ryzen 5 5600G (32GB RAM). | **Recomendado para 85% das lojas** (Barbearias, Pet Shops e Oficinas com planilha ou caderno). Implantação em **2 minutos**. |
| **Modo B: On-Premise Plug-and-Play no PC do Comércio (`dactyla_store_appliance`)** | Você executa o instalador `install_store_agent.ps1` no PC Windows do balcão da loja. Ele varre bancos locais (`.fdb`, `.sqlite`, `.csv`), extrai automaticamente os 60 clientes inativos e sobe o daemon local `:4848`. | Ideal para **Centros Automotivos e Pet Shops maiores** que usam sistemas antigos instalados no PC do caixa. Implantação em **10 minutos**. |

---

## ⚡ Passo a Passo de Implantação em 10 Minutos (SOP de Campo)

### Etapa 1: Extração Instantânea dos 60 Clientes Inativos (Minuto 0 ao 3)
No computador da loja (ou no seu servidor com a planilha enviada pelo lojista), execute o **Instalador Plug-and-Play 1-Clique**:

```powershell
# Exemplo para Oficina / Centro Automotivo (Ciclo 150 dias)
powershell -ExecutionPolicy Bypass -File .\dactyla_store_appliance\install_store_agent.ps1 `
  -StoreName "Centro Automotivo Litoral" `
  -Niche "oficina" `
  -InputFile "C:\caminho\opcional\clientes_oficina.csv"
```

Ou diretamente via Python com o **Extrator Universal**:
```bash
python dactyla_store_appliance/universal_inactives_extractor.py \
  --niche petshop \
  --store "Pet Shop Caiçara" \
  --limit 60
```
- O script gera automaticamente o arquivo `dactyla_store_appliance/store_inactives_queue.json` higienizado (apenas celulares válidos `55129xxxxxxxx` que ultrapassaram o ciclo do nicho).

---

### Etapa 2: Validação Dry-Run dos 3 Playbooks Spintax (Minuto 3 ao 5)
Antes de disparar no WhatsApp da loja, valide no terminal as mensagens exatas geradas com Spintax:

```bash
node dactyla_prospector/client_reactivation_engine.cjs \
  --file dactyla_store_appliance/store_inactives_queue.json \
  --dry-run
```

---

### Etapa 3: Pareamento QR Code e Disparo do Teste de 48h (Minuto 5 ao 8)
Inicie o motor em modo de produção para exibir o QR Code na tela:

```bash
node dactyla_prospector/client_reactivation_engine.cjs \
  --file dactyla_store_appliance/store_inactives_queue.json
```
1. Peça para o dono da loja abrir o WhatsApp Business da loja ➔ **Aparelhos Conectados** ➔ **Conectar um aparelho** e ler o QR Code.
2. O motor iniciará os disparos aplicando:
   - **Simulação de digitação humana (`sendStateTyping`) por 4 segundos**.
   - **Jitter randômico de 45s a 120s** entre cada cliente.
   - **Trava rígida de 20 disparos/dia por loja** salva em `reactivation_ledger.json` (os 60 clientes do teste são disparados ao longo de 48h/72h com segurança máxima para o chip da loja).

---

### Etapa 4: Entrega do Painel de Balcão 1-Clique para o Dia a Dia (Minuto 8 ao 10)
1. Deixe aberto nos favoritos do navegador do caixa da loja o endereço:
   👉 **`https://www.dactylacode.com.br/balcao`**
2. Mostre ao atendente da oficina/pet shop como usar a **Aba 1 (Aviso Serviço Pronto com 1 Clique)**:
   - Sempre que um carro sair do elevador ou um pet sair do banho, basta digitar o nome, celular e carro/pet e clicar em **Avisar Cliente**.
   - O sistema envia o aviso imediato para liberar espaço físico na loja e **já agenda automaticamente o retorno preditivo** para daqui a `150 dias` (Oficina), `30 dias` (Pet Shop) ou `21 dias` (Barbearia).

---

## 🧪 Como Executar a Suíte de Testes Automatizados (Padrão USP / Harvard)

Para auditar matematicamente todos os módulos antes de qualquer deploy ou instalação em cliente:

```bash
node dactyla_store_appliance/tests/test_suite.cjs
```
A suíte verifica 11 asserções críticas de engenharia (DevSecOps CWE-22/CWE-1321, normalização de JIDs, parser `#AUDITORIA_DACTYLA`, motor Spintax, Playbooks dos 3 nichos, limites de Jitter e integração HTTP com o daemon `:4848`).
