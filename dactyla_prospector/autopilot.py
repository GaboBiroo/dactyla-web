#!/usr/bin/env python3
"""
DACTYLA OMNICHANNEL PROSPECTOR // AUTOPILOT ORCHESTRATOR (24/7 - A CADA 2 HORAS)
Orquestrador automático de prospecção contínua:
1. Mineração de Leads B2B (miner.py)
2. Cold E-mail Machine (email_bot.py)
3. Form Sniper via Playwright (form_sniper.py)
4. WhatsApp Hub & Cloud Sync (whatsapp_hub.py -> api/leads-sync)
"""

import os
import sys
import time
from datetime import datetime

# Intervalo entre rodadas: 2 horas = 7200 segundos
INTERVAL_SECONDS = 2 * 60 * 60

def safe_print(text: str):
    """ Imprime texto no terminal sanitizando caracteres incompatíveis com CP1252 do Windows """
    try:
        print(text)
    except UnicodeEncodeError:
        clean = text.encode('ascii', errors='ignore').decode('ascii')
        print(clean)


def run_cycle():
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    safe_print("\n" + "=" * 90)
    safe_print(f"🚀 DACTYLA AUTOPILOT // INICIANDO CICLO DE PROSPECÇÃO CONTINUA - {now_str}")
    safe_print("=" * 90 + "\n")

    current_dir = os.path.dirname(os.path.abspath(__file__))

    # FASE 1: MINERADOR B2B
    safe_print(" [ETAPA 1/4] Executando Minerador de Leads B2B (miner.py)...")
    try:
        from miner import mine_caragua_leads
        mine_caragua_leads()
    except Exception as e:
        safe_print(f" [!] Erro na mineração: {e}")

    # FASE 2: COLD E-MAIL BOT
    safe_print("\n [ETAPA 2/4] Executando Cold E-mail Bot (email_bot.py)...")
    try:
        from email_bot import run_cold_email_campaign
        run_cold_email_campaign()
    except Exception as e:
        safe_print(f" [!] Erro na campanha de e-mail: {e}")

    # FASE 3: FORM SNIPER (PLAYWRIGHT)
    safe_print("\n [ETAPA 3/4] Executando Form Sniper Playwright (form_sniper.py)...")
    try:
        from form_sniper import run_form_sniper
        run_form_sniper()
    except Exception as e:
        safe_print(f" [!] Erro no sniper de formulários: {e}")

    # FASE 4: WHATSAPP HUB & CLOUD SYNC
    safe_print("\n [ETAPA 4/4] Executando WhatsApp Hub & Cloud Sync (whatsapp_hub.py)...")
    try:
        from whatsapp_hub import process_whatsapp_hub
        process_whatsapp_hub()
    except Exception as e:
        safe_print(f" [!] Erro no WhatsApp Hub: {e}")

    next_run = datetime.fromtimestamp(time.time() + INTERVAL_SECONDS).strftime("%H:%M:%S")
    safe_print("\n" + "=" * 90)
    safe_print(f" [OK] CICLO CONCLUÍDO COM SUCESSO! PRÓXIMA RODADA ÀS: {next_run} (A CADA 2 HORAS)")
    safe_print("=" * 90 + "\n")


def main():
    safe_print("=" * 90)
    safe_print(" DACTYLA CODE // AUTOPILOT PROSPECTOR INITIALIZED (24/7 CONTINUOUS MODE)")
    safe_print(" Intervalo configurado: 2 Horas (7200s)")
    safe_print("=" * 90)

    while True:
        try:
            run_cycle()
        except Exception as e:
            safe_print(f" [!] Erro no ciclo do Autopilot: {e}")
        
        safe_print(f" 💤 Autopilot em aguardo... Próximo disparo em 2 horas.")
        time.sleep(INTERVAL_SECONDS)


if __name__ == "__main__":
    main()
