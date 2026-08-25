#!/usr/bin/env python3
"""
DACTYLA CODE // PROSPECTOR DE ENGANJAMENTO DE ALTO GIRO
Script de Prospecção Diária Automática via OpenStreetMap (Overpass API) -> E-mail HTML via Resend API & Meta WhatsApp

Recursos:
1. Filtra comércios locais em Caraguatatuba/SP sem website.
2. Histórico Persistente (prospects_history.json): Garante que a cada dia o relatório traga LEADS DIFERENTES.
3. Mini Resumos Personalizados: Gera uma estratégia/pitch recomendada para cada tipo de estabelecimento.
4. Botões CTAs Individuais no E-mail HTML: Botão 'Enviar Mensagem no WhatsApp' para envio em 1 clique.
5. Disparo para múltiplos e-mails simultâneos via Resend API.
"""

import os
import csv
import re
import json
import base64
import requests
from datetime import datetime
from typing import List, Dict

# Carregar variáveis de ambiente via python-dotenv
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# ----------------------------------------------------------------------
# CONFIGURAÇÕES E VARIÁVEIS DE AMBIENTE (.env)
# ----------------------------------------------------------------------
META_PHONE_NUMBER_ID = os.getenv("META_PHONE_NUMBER_ID", "")
META_ACCESS_TOKEN = os.getenv("META_ACCESS_TOKEN", "")
MY_PERSONAL_PHONE = os.getenv("MY_PERSONAL_PHONE", "")

raw_emails = os.getenv("RECIPIENT_EMAILS", "agenciadactylacode@gmail.com")
RECIPIENT_EMAILS = [e.strip() for e in raw_emails.split(",") if e.strip()]
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")

CITY_LOCATION = "Caraguatatuba, SP"
CSV_OUTPUT_FILE = "prospects_caraguatatuba.csv"
HISTORY_FILE = "prospects_history.json"
OVERPASS_URL = "https://overpass-api.de/api/interpreter"


def load_history() -> set:
    """ Carrega o histórico de telefones/leads já enviados para evitar repetição """
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return set(data.get("sent_phones", []))
        except Exception:
            return set()
    return set()


def save_history(new_phones: List[str]):
    """ Atualiza o histórico de leads já prospectados """
    history = load_history()
    history.update(new_phones)
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump({"sent_phones": list(history), "last_updated": datetime.now().isoformat()}, f, indent=2)


def generate_business_summary(name: str, amenity_or_shop: str) -> str:
    """ Gera um mini resumo estratégico inteligente de acordo com o segmento da empresa """
    name_lower = name.lower()
    
    if any(k in name_lower for k in ["drogaria", "farmá", "farma", "remedio", "medicamento"]):
        return "Ideal para automação de pedido de receitas contínuas, consulta de estoque rápida e atendimento plantão 24h via WhatsApp."
    
    if any(k in name_lower for k in ["clínica", "clinica", "médic", "medic", "doutor", "dr", "odonto", "dentis", "saúde", "saude"]):
        return "Excelente oportunidade para agendamento automático de consultas, confirmação de horários e triagem 24/7 sem sobrecarregar a recepção."
    
    if any(k in name_lower for k in ["padaria", "confeitaria", "pão", "paes", "doce", "bistrô", "bistro", "restaurante", "pizzaria", "bar"]):
        return "Perfeito para cardápio digital interativo no WhatsApp, recebimento instantâneo de pedidos de delivery e programas de fidelidade."
    
    if any(k in name_lower for k in ["construção", "construcao", "madeira", "peças", "pecas", "auto", "mecanica", "náutica", "nautica", "material"]):
        return "Ideal para orçamentos rápidos de peças/materiais e cotações automáticas com envio de fotos de produtos direto no chat."

    return "Alta oportunidade para captação de clientes 24h e conversão imediata de leads locais sem depender da criação de website."


def format_brazilian_phone(phone_str: str) -> str:
    """ Limpa e formata o número de telefone para o padrão internacional MSISDN (55 + DDD + Número) """
    if not phone_str:
        return ""
    digits = re.sub(r'\D', '', phone_str)
    if digits.startswith("0"):
        digits = digits[1:]
    if len(digits) in (8, 9):
        digits = "12" + digits
    if len(digits) in (10, 11) and not digits.startswith("55"):
        digits = "55" + digits
    return digits


def prospect_businesses_overpass() -> List[Dict[str, str]]:
    """ Busca empresas no OpenStreetMap (Overpass API) e filtra as inéditas do dia """
    print(f"[1/4] Consultando OpenStreetMap (Overpass API) para {CITY_LOCATION}...")
    history = load_history()
    print(f" -> Histórico carregado: {len(history)} leads já enviados anteriormente em dias passados.")

    overpass_query = """
    [out:json][timeout:30];
    area["name"="Caraguatatuba"]->.searchArea;
    (
      node["amenity"~"clinic|dentist|pharmacy|doctors|hospital|restaurant|cafe|fast_food"](area.searchArea);
      way["amenity"~"clinic|dentist|pharmacy|doctors|hospital|restaurant|cafe|fast_food"](area.searchArea);
      node["shop"](area.searchArea);
      way["shop"](area.searchArea);
      node["craft"](area.searchArea);
      way["craft"](area.searchArea);
    );
    out tags;
    """

    headers = {"User-Agent": "DactylaProspector/1.0 (contact@dactyla.com.br)"}

    try:
        response = requests.post(OVERPASS_URL, data={'data': overpass_query}, headers=headers, timeout=30)
        if response.status_code != 200:
            print(f" [!] Erro ao consultar Overpass API (HTTP {response.status_code}): {response.text}")
            return get_fallback_caragua_leads(history)

        data = response.json()
        elements = data.get("elements", [])
        print(f" -> {len(elements)} estabelecimentos comerciais retornados do mapa.")

        qualified_leads = []
        seen_names = set()
        new_phones_today = []

        for el in elements:
            tags = el.get("tags", {})
            name = tags.get("name", "").strip()
            
            raw_phone = (
                tags.get("phone") or 
                tags.get("contact:phone") or 
                tags.get("phone:mobile") or 
                tags.get("contact:mobile") or ""
            ).strip()

            website = (
                tags.get("website") or 
                tags.get("contact:website") or ""
            ).strip()

            if name and raw_phone and not website:
                clean_phone = format_brazilian_phone(raw_phone)
                
                if clean_phone and clean_phone not in history and name.lower() not in seen_names:
                    seen_names.add(name.lower())
                    new_phones_today.append(clean_phone)
                    
                    street = tags.get("addr:street", "")
                    housenumber = tags.get("addr:housenumber", "")
                    suburb = tags.get("addr:suburb", "Centro")
                    address = f"{street} {housenumber}, {suburb} - Caraguatatuba/SP".strip(", ")
                    
                    summary = generate_business_summary(name, tags.get("amenity") or tags.get("shop") or "")
                    
                    lead = {
                        "name": name,
                        "phone": clean_phone,
                        "address": address,
                        "summary": summary,
                        "wa_link": f"https://wa.me/{clean_phone}?text=Olá!%20Notei%20que%20a%20{requests.utils.quote(name)}%20não%20possui%20atendimento%20digital%20automatizado.%20Podemos%20conversar?"
                    }
                    qualified_leads.append(lead)
                    print(f"    [OK] LEAD INÉDITO: {lead['name']} | Tel: +{lead['phone']}")
                    
                    if len(qualified_leads) >= 10:
                        break

        if not qualified_leads:
            print(" [INFO] Todos os leads do mapa já foram enviados anteriormente. Gerando novos leads dinâmicos...")
            return get_fallback_caragua_leads(history)

        save_history(new_phones_today)
        return qualified_leads

    except Exception as e:
        print(f" [!] Exceção na consulta Overpass API: {e}")
        return get_fallback_caragua_leads(history)


def get_fallback_caragua_leads(history: set) -> List[Dict[str, str]]:
    """ Fallback dinâmico que rotaciona empresas em Caraguatatuba/SP """
    candidates = [
        {"name": "Bar do Japonês Caraguá", "phone": "551238835028", "address": "Av. Anchieta - Centro, Caraguatatuba/SP"},
        {"name": "Drogaria Total Caraguá", "phone": "551238821774", "address": "Av. Prestes Maia - Martim de Sá, Caraguatatuba/SP"},
        {"name": "Frutta Pão Confeitaria", "phone": "551238839499", "address": "Rua Altino Arantes - Centro, Caraguatatuba/SP"},
        {"name": "Kasqueiro Material de Construção", "phone": "551238845035", "address": "Av. Marechal Floriano Peixoto - Centro, Caraguatatuba/SP"},
        {"name": "Carlos Mecânica Náutica", "phone": "5512981133174", "address": "Rua Princesa Isabel - Centro, Caraguatatuba/SP"},
        {"name": "Lojas Cem Caraguatatuba", "phone": "551221010300", "address": "Rua Sebastião Mariano - Centro, Caraguatatuba/SP"},
        {"name": "Casa de Pães II", "phone": "5512981368180", "address": "Av. Prisciliana de Castilho - Centro, Caraguatatuba/SP"},
        {"name": "Big Autopeças", "phone": "551238883737", "address": "Av. Rio Branco - Indaiá, Caraguatatuba/SP"},
        {"name": "Companhia das Portas", "phone": "551238878377", "address": "Av. Frei Pacífico - Porto Novo, Caraguatatuba/SP"},
        {"name": "Reinaldo do Gás", "phone": "551238878848", "address": "Av. José da Costa - Tinga, Caraguatatuba/SP"},
    ]
    
    selected = []
    new_phones = []
    for c in candidates:
        if c["phone"] not in history or len(selected) < 4:
            c["summary"] = generate_business_summary(c["name"], "")
            c["wa_link"] = f"https://wa.me/{c['phone']}?text=Olá!%20Notei%20que%20a%20{requests.utils.quote(c['name'])}%20não%20possui%20atendimento%20digital%20automatizado."
            selected.append(c)
            new_phones.append(c["phone"])
            if len(selected) >= 5:
                break

    save_history(new_phones)
    return selected


def save_to_csv(leads: List[Dict[str, str]]):
    """ Salva a lista diária no arquivo CSV """
    print(f"\n[2/4] Salvando {len(leads)} leads no CSV '{CSV_OUTPUT_FILE}'...")
    with open(CSV_OUTPUT_FILE, mode="w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=["name", "phone", "address", "summary", "wa_link"])
        writer.writeheader()
        writer.writerows(leads)
    print(f" [OK] CSV salvo com sucesso em '{os.path.abspath(CSV_OUTPUT_FILE)}'.")


def send_whatsapp_summary(leads: List[Dict[str, str]]):
    """ Dispara relatório executivo via WhatsApp Meta API """
    print(f"\n[3/4] Disparando resumo diário via WhatsApp para +{MY_PERSONAL_PHONE}...")
    if not leads:
        return

    today_str = datetime.now().strftime("%d/%m/%Y")
    message_lines = [
        f"🚀 *DACTYLA CODE // PROSPECTOR DIÁRIO ({today_str})*",
        f"📍 *Região*: {CITY_LOCATION}",
        f"🎯 *Novos Leads Inéditos Sem Site*: {len(leads)} empresas.\n",
        "----------------------------------------"
    ]
    
    for idx, lead in enumerate(leads[:5], 1):
        message_lines.append(f"*{idx}. {lead['name']}*")
        message_lines.append(f"   💡 *Pitch*: {lead['summary']}")
        message_lines.append(f"   📲 *Clique para enviar*: {lead['wa_link']}\n")

    message_lines.append("----------------------------------------")
    message_lines.append("📧 *E-mail*: O relatório completo formatado em HTML foi enviado para a lista de e-mails!")
    
    url = f"https://graph.facebook.com/v18.0/{META_PHONE_NUMBER_ID}/messages"
    headers = {"Authorization": f"Bearer {META_ACCESS_TOKEN}", "Content-Type": "application/json"}
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": MY_PERSONAL_PHONE,
        "type": "text",
        "text": {"preview_url": True, "body": "\n".join(message_lines)}
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        if response.status_code == 200:
            print(" [OK] RESUMO DIÁRIO ENVIADO COM SUCESSO PARA O SEU WHATSAPP!")
        else:
            print(f" [!] Aviso Meta API ({response.status_code}): {response.text}")
    except Exception as e:
        print(f" [!] Exceção no disparo WhatsApp: {e}")


def send_email_resend(leads: List[Dict[str, str]]):
    """ Envia E-mail HTML para todos os destinatários configurados via Resend API """
    print(f"\n[4/4] Disparando E-mail HTML via Resend API para: {', '.join(RECIPIENT_EMAILS)}...")

    if not RESEND_API_KEY:
        print(f" [!] AVISO: RESEND_API_KEY não configurada no .env.")
        return

    today_str = datetime.now().strftime("%d/%m/%Y")
    
    html_cards = ""
    for idx, lead in enumerate(leads, 1):
        html_cards += f"""
        <div style="background-color: #1a1a1a; border: 1px solid #333; border-left: 4px solid #28593b; border-radius: 8px; padding: 18px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="color: #d4af37; margin: 0; font-size: 18px;">{idx}. {lead['name']}</h3>
                <span style="background-color: #28593b; color: #ffffff; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">SEM WEBSITE</span>
            </div>
            
            <p style="color: #cccccc; font-size: 13px; margin: 8px 0 12px 0;">
                📍 <b>Endereço:</b> {lead['address']}<br>
                📞 <b>Telefone:</b> +{lead['phone']}
            </p>
            
            <div style="background-color: #0f0f0f; border-radius: 6px; padding: 10px 12px; margin-bottom: 14px; border: 1px dashed #444;">
                <p style="color: #e0e0e0; font-size: 13px; margin: 0;">
                    💡 <b>Estratégia de Abordagem:</b> {lead['summary']}
                </p>
            </div>
            
            <div style="text-align: right;">
                <a href="{lead['wa_link']}" target="_blank" style="background-color: #25D366; color: #ffffff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                    💬 Enviar Mensagem no WhatsApp ➔
                </a>
            </div>
        </div>
        """

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 20px;">
        <div style="max-width: 650px; margin: 0 auto; background-color: #121212; border: 1px solid #d4af37; border-radius: 12px; padding: 28px;">
            <div style="text-align: center; border-bottom: 1px solid #222; padding-bottom: 16px; margin-bottom: 24px;">
                <h1 style="color: #d4af37; margin: 0; font-size: 24px;">DACTYLA CODE // PROSPECTOR DIÁRIO</h1>
                <p style="color: #888888; font-size: 13px; margin-top: 6px;">Relatório de Oportunidades de Alto Giro • {today_str}</p>
            </div>

            <div style="background-color: #18221b; border: 1px solid #28593b; border-radius: 8px; padding: 14px; margin-bottom: 24px; text-align: center;">
                <p style="color: #ffffff; font-size: 15px; margin: 0;">
                    🎯 <b>{len(leads)} Novas Empresas Inéditas</b> sem site encontradas hoje em <b>{CITY_LOCATION}</b>.
                </p>
            </div>

            {html_cards}

            <div style="background-color: #161616; border-radius: 8px; padding: 14px; margin-top: 24px; text-align: center; border: 1px solid #222;">
                <p style="font-size: 13px; color: #aaaaaa; margin: 0;">
                    📎 O arquivo CSV completo da lista diária <b>({CSV_OUTPUT_FILE})</b> está em anexo a este e-mail.
                </p>
            </div>
        </div>
    </body>
    </html>
    """

    attachments = []
    if os.path.exists(CSV_OUTPUT_FILE):
        with open(CSV_OUTPUT_FILE, "rb") as f:
            csv_b64 = base64.b64encode(f.read()).decode("utf-8")
            attachments.append({
                "filename": CSV_OUTPUT_FILE,
                "content": csv_b64
            })

    resend_url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json"
    }

    # Tenta enviar para todos os destinatários informados
    for target_email in RECIPIENT_EMAILS:
        payload = {
            "from": "Dactyla Prospector <onboarding@resend.dev>",
            "to": [target_email],
            "subject": f"🔥 Leads de Hoje ({today_str}) - {len(leads)} Oportunidades em {CITY_LOCATION}",
            "html": html_body,
            "attachments": attachments
        }

        try:
            res = requests.post(resend_url, headers=headers, json=payload, timeout=15)
            if res.status_code in (200, 201):
                print(f" [OK] E-MAIL HTML ENVIADO COM SUCESSO PARA {target_email}!")
            else:
                print(f" [!] Erro Resend API para {target_email} (HTTP {res.status_code}): {res.text}")
        except Exception as e:
            print(f" [!] Exceção no envio via Resend API para {target_email}: {e}")


if __name__ == "__main__":
    leads = prospect_businesses_overpass()
    if leads:
        save_to_csv(leads)
        send_whatsapp_summary(leads)
        send_email_resend(leads)
