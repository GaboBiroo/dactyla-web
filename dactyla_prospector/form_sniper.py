#!/usr/bin/env python3
"""
DACTYLA OMNICHANNEL PROSPECTOR // FASE 4: O SNIPER DE FORMULÁRIOS
Automação avançada com Playwright para encontrar páginas de contato e enviar propostas comerciais.
"""

import os
import sys
import json
import time
from urllib.parse import urljoin, urlparse
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
from anti_spam import AntiSpamDB

LEADS_FILE = os.path.join(os.path.dirname(__file__), "mined_leads.json")

PITCH_TEMPLATE = """Olá, equipe da {company_name}! Tudo bem?

Nós somos Gabriel e Matheus, engenheiros de software e fundadores da Dactyla Code, agência de tecnologia de alta performance aqui na região.

Notamos que a {company_name} possui uma excelente presença no mercado, porém muitos clientes em potencial acabam desistindo da compra por falta de um atendimento imediato no WhatsApp fora do horário comercial ou nos picos de demanda.

Nós desenvolvemos uma Inteligência Artificial exclusiva que se conecta ao WhatsApp do seu negócio, atende em 1 segundo de forma totalmente humanizada 24/7 e qualifica o cliente antes de passar para a sua equipe comercial.

Gostaríamos de agendar uma breve demonstração de 10 minutos nesta semana para mostrar o robô operando ao vivo para vocês.

Vocês teriam disponibilidade nesta quinta ou sexta-feira?

Abraços,
Gabriel Hatakeyama (CTO) & Matheus (Co-Founder)
Dactyla Code — Artesanato Digital
WhatsApp Oficial: +55 (12) 99210-9408
Site: https://www.dactylacode.com.br
"""

CONTACT_LINK_KEYWORDS = [
    'contato', 'fale conosco', 'orcamento', 'orçamento', 
    'fale com um consultor', 'atendimento', 'fale-conosco', 'contact'
]


def safe_print(text: str):
    """ Imprime texto no terminal sanitizando caracteres incompatíveis com o encoding CP1252 do Windows """
    try:
        print(text)
    except UnicodeEncodeError:
        clean = text.encode('ascii', errors='ignore').decode('ascii')
        print(clean)


def run_form_sniper():
    anti_spam = AntiSpamDB()
    
    if not os.path.exists(LEADS_FILE):
        safe_print(f"[!] Arquivo de leads {LEADS_FILE} não encontrado. Execute miner.py primeiro.")
        return

    with open(LEADS_FILE, "r", encoding="utf-8") as f:
        leads = json.load(f)

    target_leads = [
        l for l in leads 
        if l.get("website") and not anti_spam.is_already_contacted(
            name=l.get("name"), 
            phone=l.get("phone"), 
            email=l.get("email"),
            website=l.get("website")
        )
    ]

    safe_print("=" * 80)
    safe_print(f"🎯 DACTYLA OMNICHANNEL PROSPECTOR // FASE 4: FORM SNIPER")
    safe_print(f" Total de leads no banco: {len(leads)}")
    safe_print(f" Leads qualificados para envio via Formulário: {len(target_leads)}")
    safe_print("=" * 80 + "\n")

    if not target_leads:
        safe_print(" [OK] Todos os leads elegíveis já foram abordados anteriormente. Banco Anti-Spam ativo!")
        return

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=['--disable-dev-shm-usage']
        )

        for idx, lead in enumerate(target_leads, 1):
            company_name = lead.get("name", "Empresa")
            website_url = lead.get("website")
            
            safe_print(f"\n[{idx}/{len(target_leads)}] Abordando: {company_name} ({website_url})")

            page = browser.new_page()
            page.set_default_timeout(15000)

            try:
                page.goto(website_url, wait_until="domcontentloaded")
                time.sleep(2)

                contact_page_url = None
                links = page.query_selector_all("a")
                
                for link in links:
                    href = link.get_attribute("href")
                    text = link.inner_text().lower() if link.inner_text() else ""
                    
                    if href:
                        href_lower = href.lower()
                        if any(kw in text or kw in href_lower for kw in CONTACT_LINK_KEYWORDS):
                            contact_page_url = urljoin(website_url, href)
                            break

                if contact_page_url and contact_page_url != website_url:
                    safe_print(f" -> Página de contato encontrada: {contact_page_url}")
                    page.goto(contact_page_url, wait_until="domcontentloaded")
                    time.sleep(2)

                form = page.query_selector("form")
                if not form:
                    safe_print(f" [!] Nenhum formulário HTML identificado em {company_name}.")
                    page.close()
                    continue

                filled = False
                name_input = page.query_selector("input[name*='name' i], input[name*='nome' i], input[id*='nome' i]")
                if name_input:
                    name_input.fill("Gabriel Hatakeyama")
                    filled = True

                email_input = page.query_selector("input[type='email'], input[name*='email' i], input[id*='email' i]")
                if email_input:
                    email_input.fill("contato@dactylacode.com.br")
                    filled = True

                phone_input = page.query_selector("input[type='tel'], input[name*='phone' i], input[name*='telef' i], input[name*='whats' i], input[name*='cel' i]")
                if phone_input:
                    phone_input.fill("12992109408")

                msg_textarea = page.query_selector("textarea, input[name*='message' i], input[name*='mensagem' i]")
                if msg_textarea:
                    pitch_text = PITCH_TEMPLATE.format(company_name=company_name)
                    msg_textarea.fill(pitch_text)
                    filled = True

                if filled:
                    submit_button = page.query_selector("form button[type='submit'], form input[type='submit'], form button")
                    if submit_button:
                        submit_button.click()
                        time.sleep(3)
                        safe_print(f" [SUCCESS] Formulário enviado com sucesso para {company_name}!")
                        
                        anti_spam.record_contact(
                            name=company_name,
                            phone=lead.get("phone", ""),
                            email=lead.get("email", ""),
                            website=website_url,
                            channel="form_sniper",
                            notes="Pitch comercial de automação enviado via formulário de contato"
                        )
                    else:
                        safe_print(f" [!] Botão de envio não localizado no formulário de {company_name}.")
                else:
                    safe_print(f" [!] Não foi possível mapear os campos do formulário de {company_name}.")

            except PlaywrightTimeoutError:
                safe_print(f" [TIMEOUT] Tempo limite excedido ao tentar acessar {website_url}.")
            except Exception as e:
                safe_print(f" [!] Erro inesperado em {company_name}: {e}")
            finally:
                page.close()

        browser.close()

    safe_print("\n [OK] Execução do Form Sniper concluída com sucesso!")


if __name__ == "__main__":
    run_form_sniper()
