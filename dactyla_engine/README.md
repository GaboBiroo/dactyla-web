# DACTYLA ENGINE // ISOLATED MODULE SPECIFICATION

Módulo isolado de engenharia de automação comercial B2B, migração ETL assíncrona, impressão driverless WebUSB e contingência fiscal SAT/NFC-e para a Dactyla Code.

> [!IMPORTANT]
> Este diretório (`dactyla_engine/`) opera em modo 100% autônomo e isolado do ecossistema principal de produção (`src/`, `api/`, `dactyla_prospector/`). Nenhuma alteração realizada aqui impacta o funcionamento dos robôs 24/7 ativos na máquina.

---

## 📐 Estrutura de Arquivos

```text
dactyla_engine/
├── etl_firebird_migrator.py  # Extrator ETL Python para bases .fdb (Firebird)
├── web_thermal_printer.js    # SDK Driverless WebUSB / Web Serial API (ESC/POS)
├── sat_nfc_bridge.go         # Microsserviço REST em Go (Offline-First) em :8080
├── smart_inventory_ai.py     # Motor Preditivo de Estoque & Auditoria Fiscal (CFOP/NCM)
└── README.md                 # Documentação e instruções de compilação
```

---

## ⚡ Como Testar os Módulos Isolados

### 1. Extrator ETL Firebird (`etl_firebird_migrator.py`)
```bash
python dactyla_engine/etl_firebird_migrator.py
```
- Varre diretórios padrão em busca de ficheiros `.fdb`.
- Tenta injeção de credenciais padrão (`SYSDBA`/`masterkey`).
- Sanitiza dados para a norma UTF-8 e transmite lotes JSON para a nuvem.

### 2. Motor Preditivo e Auditoria Fiscal (`smart_inventory_ai.py`)
```bash
python dactyla_engine/smart_inventory_ai.py
```
- Realiza a checagem de divergências entre CFOP 5.102 e regras de Substituição Tributária (ICMS-ST SP).
- Calcula projeções de esgotamento de estoque com base nos multiplicadores de alta temporada do Litoral Norte.

### 3. Microsserviço Bridge SAT em Go (`sat_nfc_bridge.go`)
```bash
go run dactyla_engine/sat_nfc_bridge.go
```
- Inicia o servidor HTTP local em `http://localhost:8080`.
- Endpoints expostos: `GET /sat/status` e `POST /sat/vender`.

### 4. SDK Impressora Driverless (`web_thermal_printer.js`)
- Módulo ES6 importável em aplicações PWA.
- Suporta `connectUSB()` via WebUSB e `connectSerial()` via Web Serial API.
