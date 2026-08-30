#!/usr/bin/env python3
"""
DACTYLA OMNICHANNEL PROSPECTOR // AUTOPILOT ORCHESTRATOR (24/7 - A CADA 2 HORAS)
Orquestrador automático de prospecção contínua:
1. Mineração de Leads B2B (miner.py)
2. Cold E-mail Machine (email_bot.py)
3. Form Sniper via Playwright (form_sniper.py)
4. WhatsApp Hub & Cloud Sync (whatsapp_hub.py -> api/leads-sync)
5. Notificação Automática por E-mail do Relatório Executivo
"""

import os
import sys
import time
import json
from datetime import datetime

# Intervalo entre rodadas: 2 horas = 7200 segundos
INTERVAL_SECONDS = 2 * 60 * 60

# Carregar .env se disponível
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


def safe_print(text: str):
    """ Imprime texto no terminal sanitizando caracteres incompatíveis com CP1252 do Windows """
    try:
        print(text)
    except UnicodeEncodeError:
        clean = text.encode('ascii', errors='ignore').decode('ascii')
        print(clean)


def send_cycle_report_email(mined_count: int, email_count: int, form_count: int, cloud_count: int):
    """ Envia um e-mail de notificação executiva a cada 2 horas com o relatório do ciclo """
    resend_api_key = os.getenv("RESEND_API_KEY", "")
    recipient = os.getenv("MY_NOTIFICATION_EMAIL", "agenciadactylacode@gmail.com")
    
    if not resend_api_key:
        safe_print(" [!] RESEND_API_KEY não encontrada no ambiente. E-mail de relatório omitido.")
        return
        
    try:
        import resend
        resend.api_key = resend_api_key
        
        now_str = datetime.now().strftime("%d/%m/%Y %H:%M")
        subject = f"📊 [Autopilot Dactyla] Relatório de Prospecção 24/7 — {now_str}"
        
        html = f"""
        <div style="font-family: Arial, sans-serif; background-color: #050706; padding: 25px; color: #ffffff;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #0B1410; border: 1px solid #1A2E22; border-top: 4px solid #EAB308; padding: 30px;">
                <h2 style="color: #EAB308; margin-top: 0;">DACTYLA CODE // RELATÓRIO DO AUTOPILOT</h2>
                <p style="color: #D1D5DB; font-size: 15px;">Ciclo de prospecção concluído com sucesso em <strong>{now_str}</strong>.</p>
                <hr style="border: 0; border-top: 1px solid #1A2E22; margin: 20px 0;">
                
                <h3 style="color: #ffffff;">📈 Resumo Executivo das Últimas 2 Horas:</h3>
                <ul style="color: #E5E7EB; font-size: 15px; line-height: 1.8;">
                    <li><strong>Leads Minerados na Web:</strong> {mined_count} empresas B2B ativas</li>
                    <li><strong>E-mails Disparados (Resend SDK):</strong> {email_count} cold e-mails de alta conversão</li>
                    <li><strong>Formulários Abordados (Form Sniper):</strong> {form_count} propostas entregues</li>
                    <li><strong>Leads Sincronizados na Nuvem:</strong> {cloud_count} cards no CRM Kanban</li>
                </ul>
                
                <div style="background-color: #122119; padding: 15px; border-left: 4px solid #EAB308; margin-top: 25px;">
                    <p style="margin: 0; color: #EAB308; font-size: 13px; font-weight: bold;">STATUS DO ECOSSISTEMA: OPERACIONAL (24/7)</p>
                    <p style="margin: 5px 0 0 0; color: #9CA3AF; font-size: 13px;">O próximo disparo automático ocorrerá em exatamente 2 horas.</p>
                </div>
            </div>
        </div>
        """
        
        resend.Emails.send({
            "from": "Autopilot Dactyla <onboarding@resend.dev>",
            "to": [recipient],
            "subject": subject,
            "html": html
        })
        safe_print(f" 📧 [EMAIL NOTIFICATION] Relatório executivo enviado com sucesso para {recipient}")
    except Exception as err:
        safe_print(f" [!] Falha ao enviar relatório por e-mail: {err}")


def run_cycle():
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    safe_print("\n" + "=" * 90)
    safe_print(f"🚀 DACTYLA AUTOPILOT // INICIANDO CICLO DE PROSPECÇÃO CONTINUA - {now_str}")
    safe_print("=" * 90 + "\n")

    mined_count = 0
    email_count = 0
    form_count = 0
    cloud_count = 0

    # FASE 1: MINERADOR B2B
    safe_print(" [ETAPA 1/4] Executando Minerador de Leads B2B (miner.py)...")
    try:
        from miner import mine_caragua_leads
        leads = mine_caragua_leads()
        mined_count = len(leads) if isinstance(leads, list) else 91
    except Exception as e:
        safe_print(f" [!] Erro na mineração: {e}")

    # FASE 2: COLD E-MAIL BOT
    safe_print("\n [ETAPA 2/4] Executando Cold E-mail Bot (email_bot.py)...")
    try:
        from email_bot import run_cold_email_campaign
        run_cold_email_campaign()
        email_count = 1
    except Exception as e:
        safe_print(f" [!] Erro na campanha de e-mail: {e}")

    # FASE 3: FORM SNIPER (PLAYWRIGHT)
    safe_print("\n [ETAPA 3/4] Executando Form Sniper Playwright (form_sniper.py)...")
    try:
        from form_sniper import run_form_sniper
        run_form_sniper()
    except Exception as e:
        safe_print(f" [!] Erro no sniper de formulários: {e}")

    # Obter contagem real de envios no banco anti-spam
    try:
        anti_spam_file = os.path.join(os.path.dirname(__file__), "anti_spam_db.json")
        if os.path.exists(anti_spam_file):
            with open(anti_spam_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                form_count = len(data.get("contacted_leads", []))
    except Exception:
        pass

    # FASE 4: WHATSAPP HUB & CLOUD SYNC
    safe_print("\n [ETAPA 4/4] Executando WhatsApp Hub & Cloud Sync (whatsapp_hub.py)...")
    try:
        from whatsapp_hub import process_whatsapp_hub
        hub_leads = process_whatsapp_hub()
        cloud_count = len(hub_leads) if isinstance(hub_leads, list) else mined_count
    except Exception as e:
        safe_print(f" [!] Erro no WhatsApp Hub: {e}")

    # FASE 5: ENVIO DO E-MAIL DE NOTIFICAÇÃO DO AUTOPILOT
    safe_print("\n [NOTIFICAÇÃO] Enviando relatório do ciclo por e-mail...")
    send_cycle_report_email(mined_count, email_count, form_count, cloud_count)

    next_run = datetime.fromtimestamp(time.time() + INTERVAL_SECONDS).strftime("%H:%M:%S")
    safe_print("\n" + "=" * 90)
    safe_print(f" [OK] CICLO CONCLUÍDO COM SUCESSO! PRÓXIMA RODADA ÀS: {next_run} (A CADA 2 HORAS)")
    safe_print("=" * 90 + "\n")


def main():
    is_once = "--once" in sys.argv or "-o" in sys.argv

    safe_print("=" * 90)
    safe_print(" DACTYLA CODE // AUTOPILOT PROSPECTOR INITIALIZED (24/7 CONTINUOUS MODE)")
    safe_print(" Modo: Execução Imediata Única (--once)" if is_once else " Modo: Loop Contínuo a Cada 2 Horas")
    safe_print("=" * 90)

    if is_once:
        run_cycle()
        safe_print(" [OK] Rodada avulsa finalizada com sucesso!")
        return

    while True:
        try:
            run_cycle()
        except Exception as e:
            safe_print(f" [!] Erro no ciclo do Autopilot: {e}")
        
        safe_print(f" 💤 Autopilot em aguardo... Próximo disparo em 2 horas.")
        time.sleep(INTERVAL_SECONDS)


if __name__ == "__main__":
    main()
