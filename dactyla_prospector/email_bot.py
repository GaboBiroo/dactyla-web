#!/usr/bin/env python3
"""
DACTYLA OMNICHANNEL PROSPECTOR // FASE 3: MÁQUINA DE COLD E-MAIL (RESEND SDK) - BACKGROUND BANNER & DUO AVATARS
Dispara cold e-mails B2B com fundo de imagem no Header (rede neural + tamanduá), texto HTML em tempo real e avatares duo na assinatura.
"""

import os
import json
import time
import resend
from typing import List, Dict, Any
from anti_spam import AntiSpamDB

# Carregar variáveis de ambiente via python-dotenv
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# ----------------------------------------------------------------------
# CONFIGURAÇÕES DA MÁQUINA DE E-MAIL
# ----------------------------------------------------------------------
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
resend.api_key = RESEND_API_KEY

SENDER_EMAIL = os.getenv("RESEND_SENDER_EMAIL", "onboarding@resend.dev")
TEST_RECIPIENT = os.getenv("MY_NOTIFICATION_EMAIL", "agenciadactylacode@gmail.com")

# TRAVA DE SEGURANÇA: True = Envia apenas 1 e-mail de teste | False = Percorre a lista B2B ao vivo
IS_TEST_MODE = True

LEADS_CACHE_FILE = os.path.join(os.path.dirname(__file__), "mined_leads.json")


def safe_print(text: str):
    """ Imprime texto no terminal de forma segura para o encoding CP1252 do Windows """
    try:
        print(text)
    except UnicodeEncodeError:
        clean = text.encode('ascii', errors='ignore').decode('ascii')
        print(clean)


def build_email_copy(company_name: str) -> Dict[str, str]:
    """ Gera o assunto e o corpo HTML definitivo com Header de imagem de fundo e Duo Avatars """
    subject = f"Uma sugestão rápida para o atendimento da {company_name}"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 20px; background-color: #050706;">
        <div style="font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0B1410; border: 1px solid #1A2E22; overflow: hidden; color: #E5E7EB;">
            
            <!-- Header com Fundo de Imagem e Texto em HTML Real -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #0B1410; background-image: url('https://i.imgur.com/DbgsyaE.png'); background-size: cover; background-position: center; border-top: 4px solid #EAB308;">
                <tr>
                    <td style="padding: 45px 35px 40px 35px;">
                        <p style="color: #EAB308; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 15px 0;">Dactyla Code — Artesanato Digital</p>
                        <h1 style="font-family: Georgia, 'Times New Roman', serif; color: #FFFFFF; margin: 0; font-size: 26px; font-weight: normal; line-height: 1.3; text-shadow: 0 2px 6px rgba(0,0,0,0.9);">
                            A sua empresa pode ser<br>
                            <span style="color: #EAB308;">a primeira no mapa.</span>
                        </h1>
                    </td>
                </tr>
            </table>

            <!-- Body -->
            <div style="padding: 30px 35px 40px 35px; background-color: #090B0A;">
                <p style="font-size: 16px; color: #D1D5DB; line-height: 1.7; margin-top: 0;">Olá, equipe da <strong>{company_name}</strong>, tudo bem?</p>
                
                <p style="font-size: 16px; color: #D1D5DB; line-height: 1.7;">Nós somos <strong>Gabriel e Matheus</strong>, engenheiros de software e fundadores da Dactyla Code, aqui na região.</p>
                
                <p style="font-size: 16px; color: #D1D5DB; line-height: 1.7;">Analisando o mercado local, notamos que negócios excelentes estão deixando faturamento na mesa por um único motivo: <strong>a demora no primeiro contato digital</strong>. Quando o cliente não é respondido na hora, ele fecha com a concorrência.</p>
                
                <p style="font-size: 16px; color: #D1D5DB; line-height: 1.7;">Nós resolvemos isso com Arquitetura Digital de Elite. Desenvolvemos uma Inteligência Artificial exclusiva que se conecta ao seu WhatsApp, atende o seu cliente em 1 segundo de forma humanizada, 24 horas por dia, e entrega o lead pronto para a sua equipe comercial fechar a venda.</p>
                
                <!-- CTA Button -->
                <div style="text-align: left; margin: 40px 0 30px 0;">
                    <a href="https://www.dactylacode.com.br/" target="_blank" style="background-color: #EAB308; color: #000000; padding: 16px 32px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block; border-radius: 4px; box-shadow: 0 4px 14px rgba(234, 179, 8, 0.25);">Quero ver a IA operando</a>
                </div>
                
                <p style="font-size: 15px; color: #9CA3AF; line-height: 1.6;">Vocês teriam 10 minutos nesta semana para receberem um link e testarem nossa tecnologia funcionando na prática?</p>
            </div>
            
            <!-- Footer / Signature (Duo Avatars: Gabriel & Matheus) -->
            <div style="background-color: #050706; padding: 30px 35px; border-top: 1px solid #1A1F1C;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="width: 110px; vertical-align: middle; white-space: nowrap;">
                            <!-- Foto Gabriel -->
                            <img src="https://i.imgur.com/AHeyhvZ.png" alt="Gabriel" style="width: 55px; height: 55px; border-radius: 50%; display: inline-block; object-fit: cover; border: 2px solid #EAB308; vertical-align: middle;">
                            <!-- Foto Matheus -->
                            <img src="https://i.imgur.com/DD3Yijw.jpeg" alt="Matheus" style="width: 55px; height: 55px; border-radius: 50%; display: inline-block; object-fit: cover; border: 2px solid #EAB308; vertical-align: middle; margin-left: -15px;">
                        </td>
                        <td style="vertical-align: middle; padding-left: 10px;">
                            <h3 style="margin: 0; font-size: 16px; color: #FFFFFF; font-family: Georgia, 'Times New Roman', serif;">Gabriel & Matheus</h3>
                            <p style="margin: 4px 0 0; font-size: 13px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px;">Fundadores | <strong>Dactyla Code</strong></p>
                            <p style="margin: 4px 0 0; font-size: 13px;"><a href="https://www.dactylacode.com.br/" target="_blank" style="color: #EAB308; text-decoration: none; font-weight: 500;">www.dactylacode.com.br</a></p>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </body>
    </html>
    """
    
    return {"subject": subject, "html": html_body}


def run_email_prospector():
    """ Executa o fluxo da máquina de Cold E-mail """
    safe_print(f" [1/3] Iniciando Dactyla Email Bot Background Banner (Modo de Teste: {IS_TEST_MODE})...")
    
    if not os.path.exists(LEADS_CACHE_FILE):
        safe_print(f" [!] Erro: Arquivo {LEADS_CACHE_FILE} não encontrado. Execute miner.py primeiro.")
        return

    with open(LEADS_CACHE_FILE, "r", encoding="utf-8") as f:
        leads = json.load(f)

    email_leads = [l for l in leads if l.get("email")]
    safe_print(f" -> {len(email_leads)} leads com e-mail identificados no cache de mineração.")

    if not email_leads:
        safe_print(" [!] Nenhum lead com e-mail disponível para disparo.")
        return

    anti_spam = AntiSpamDB()
    dispatched_count = 0

    safe_print(f"\n [2/3] Iniciando disparos via Resend SDK (Remetente: {SENDER_EMAIL})...\n")

    for lead in email_leads:
        company_name = lead.get("name", "Empresa")
        lead_email = lead.get("email", "").strip()

        # Checagem no banco Anti-Spam
        if anti_spam.is_already_contacted(name=company_name, email=lead_email):
            safe_print(f" [AntiSpam] Lead '{company_name}' ({lead_email}) já abordado anteriormente. Pulando...")
            continue

        target_email = TEST_RECIPIENT if IS_TEST_MODE else lead_email
        copy = build_email_copy(company_name)

        safe_print(f" -> Disparando cold e-mail Background Banner para: '{company_name}' ({target_email})...")

        params: resend.Emails.SendParams = {
            "from": f"Gabriel | Dactyla Code <{SENDER_EMAIL}>",
            "to": [target_email],
            "subject": copy["subject"],
            "html": copy["html"]
        }

        try:
            email_response = resend.Emails.send(params)
            resend_id = email_response.get("id", "N/A")
            safe_print(f"    [OK] E-mail enviado com sucesso via Resend SDK! ID: {resend_id}")
            dispatched_count += 1

            if not IS_TEST_MODE:
                anti_spam.record_contact(
                    name=company_name,
                    email=lead_email,
                    phone=lead.get("phone", ""),
                    website=lead.get("website", ""),
                    channel="resend_cold_email",
                    notes=f"Resend ID: {resend_id}"
                )

            if IS_TEST_MODE:
                safe_print(f"\n [MODO DE TESTE ATIVO] 1 e-mail de validação foi disparado para {TEST_RECIPIENT}.")
                safe_print(" Altere a variável IS_TEST_MODE = False no email_bot.py quando quiser disparar a lista completa!")
                break

            safe_print(" ⏳ Aguardando 15 segundos de intervalo de segurança anti-spam...")
            time.sleep(15)

        except Exception as e:
            safe_print(f" [!] Falha ao enviar e-mail via Resend API ({company_name}): {e}")

    safe_print(f"\n [3/3] Processo do Email Bot finalizado. Total disparado nesta sessão: {dispatched_count}")


if __name__ == "__main__":
    run_email_prospector()
