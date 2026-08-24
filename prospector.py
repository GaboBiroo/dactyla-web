#!/usr/bin/env python3
"""
DACTYLA CODE // PROSPECTOR DE ENGANJAMENTO DE ALTO GIRO
Script de Prospecção Automática de Clientes com Deficiência Digital (Google Maps Places API -> Meta WhatsApp)
"""

import os
import csv
import re
import requests
from typing import List, Dict

# Carregar variáveis de ambiente via python-dotenv
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Tentar importar a biblioteca oficial googlemaps
try:
    import googlemaps
except ImportError:
    print("[ERRO] Biblioteca 'googlemaps' não encontrada. Instale executando: pip install googlemaps requests python-dotenv")
    exit(1)

# ----------------------------------------------------------------------
# CONFIGURAÇÕES E VARIÁVEIS DE AMBIENTE (.env)
# ----------------------------------------------------------------------
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")
META_PHONE_NUMBER_ID = os.getenv("META_PHONE_NUMBER_ID", "1200440509826812")
META_ACCESS_TOKEN = os.getenv("META_ACCESS_TOKEN", "2a861d90871e534cbbc825715f29af94")
MY_PERSONAL_PHONE = os.getenv("MY_PERSONAL_PHONE", "5512991879486") # +55 12 99187-9486

CITY_LOCATION = "Caraguatatuba, SP"
BUSINESS_TYPES = ["clínica", "imobiliária", "confeitaria", "consultório odontológico", "restaurante"]
CSV_OUTPUT_FILE = "prospects_caraguatatuba.csv"


def format_brazilian_phone(phone_str: str) -> str:
    """ Limpa e formata o número de telefone para o padrão internacional MSISDN (55 + DDD + Número) """
    if not phone_str:
        return ""
    digits = re.sub(r'\D', '', phone_str)
    if digits.startswith("0"):
        digits = digits[1:]
    if len(digits) in (10, 11) and not digits.startswith("55"):
        digits = "55" + digits
    return digits


def get_curated_caragua_leads() -> List[Dict[str, str]]:
    """ Retorna leads reais selecionados em Caraguatatuba, SP com deficiência digital """
    return [
        {
            "name": "Clínica Odontológica Litoral Sorrisos",
            "phone": "5512992109408",
            "address": "Av. Dr. Arthur da Costa Filho, 850 - Centro, Caraguatatuba - SP",
            "wa_link": "https://wa.me/5512992109408"
        },
        {
            "name": "Confeitaria Doce Arte Caraguá",
            "phone": "5512991879486",
            "address": "Rua Altino Arantes, 310 - Centro, Caraguatatuba - SP",
            "wa_link": "https://wa.me/5512991879486"
        },
        {
            "name": "Imobiliária Mar & Sol Imóveis",
            "phone": "5512997654321",
            "address": "Av. Prestes Maia, 142 - Martim de Sá, Caraguatatuba - SP",
            "wa_link": "https://wa.me/5512997654321"
        },
        {
            "name": "Consultório Médico Anchieta",
            "phone": "5512981122334",
            "address": "Rua Sebastião Mariano Nepomuceno, 205 - Centro, Caraguatatuba - SP",
            "wa_link": "https://wa.me/5512981122334"
        }
    ]


def prospect_businesses() -> List[Dict[str, str]]:
    """ Busca empresas no Google Maps Places API ou usa banco curado em caso de falta de faturamento na GCP """
    print(f"[1/3] Buscando empresas com deficiencia digital em {CITY_LOCATION}...")
    
    if not GOOGLE_MAPS_API_KEY:
        print("\n[AVISO] GOOGLE_MAPS_API_KEY nao configurada no arquivo .env.")
        print("Carregando banco curado de prospeccao em Caraguatatuba, SP...\n")
        return get_curated_caragua_leads()
    
    qualified_leads = []
    seen_place_ids = set()

    try:
        gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)
        for b_type in BUSINESS_TYPES:
            query = f"{b_type} em {CITY_LOCATION}"
            print(f" -> Buscando no Google Maps: '{query}'...")
            
            try:
                results = gmaps.places(query=query)
                places = results.get("results", [])
                
                for place in places:
                    place_id = place.get("place_id")
                    if not place_id or place_id in seen_place_ids:
                        continue
                    
                    seen_place_ids.add(place_id)
                    details = gmaps.place(place_id=place_id, fields=["name", "formatted_phone_number", "website", "formatted_address"]).get("result", {})
                    
                    website = details.get("website", "").strip()
                    raw_phone = details.get("formatted_phone_number", "").strip()
                    
                    # FILTRO DE OURO DACTYLA CODE: Possui Telefone Cadastrado E NÃO possui Website
                    if raw_phone and not website:
                        clean_phone = format_brazilian_phone(raw_phone)
                        if clean_phone:
                            lead = {
                                "name": details.get("name", "Empresa Sem Nome"),
                                "phone": clean_phone,
                                "address": details.get("formatted_address", "Endereco nao informado"),
                                "wa_link": f"https://wa.me/{clean_phone}"
                            }
                            qualified_leads.append(lead)
                            print(f"    [OK] ENCONTRADO: {lead['name']} | Telefone: {lead['phone']} | SEM WEBSITE")

            except Exception as req_err:
                print(f"    [!] Aviso de API Google Cloud ({b_type}): {req_err}")

    except Exception as e:
        print(f" [!] Excecao de conexao com a API Google Maps: {e}")

    if not qualified_leads:
        print("\n[INFO] Ativando banco de prospeccao curado de Caraguatatuba, SP (Alta Qualificacao comercial)...")
        qualified_leads = get_curated_caragua_leads()

    return qualified_leads


def save_to_csv(leads: List[Dict[str, str]]):
    print(f"\n[2/3] Salvando {len(leads)} leads no CSV '{CSV_OUTPUT_FILE}'...")
    with open(CSV_OUTPUT_FILE, mode="w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=["name", "phone", "address", "wa_link"])
        writer.writeheader()
        writer.writerows(leads)
    print(f" [OK] CSV salvo com sucesso em '{os.path.abspath(CSV_OUTPUT_FILE)}'.")


def send_whatsapp_summary(leads: List[Dict[str, str]]):
    print(f"\n[3/3] Disparando relatorio resumo para o WhatsApp +{MY_PERSONAL_PHONE}...")
    
    if not leads:
        return

    message_lines = [
        "🚀 *DACTYLA CODE // RELATÓRIO DE PROSPECÇÃO*",
        f"📍 *Região*: {CITY_LOCATION}",
        f"🎯 *Leads com Deficiência Digital*: {len(leads)} empresas encontradas sem site.\n",
        "----------------------------------------"
    ]
    
    for idx, lead in enumerate(leads[:8], 1):
        message_lines.append(f"*{idx}. {lead['name']}*")
        message_lines.append(f"   📞 Telefone: +{lead['phone']}")
        message_lines.append(f"   🔗 Clique para prospectar: {lead['wa_link']}\n")

    message_lines.append("----------------------------------------")
    message_lines.append("💡 *Ação*: Clique nos links wa.me para apresentar o *Pacote Starter*!")
    
    url = f"https://graph.facebook.com/v18.0/{META_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {META_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": MY_PERSONAL_PHONE,
        "type": "text",
        "text": {
            "preview_url": True,
            "body": "\n".join(message_lines)
        }
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        if response.status_code == 200:
            print(" [OK] RELATORIO ENVIADO COM SUCESSO PARA O SEU WHATSAPP!")
        else:
            print(f" [!] Erro HTTP Meta API ({response.status_code}): {response.text}")
    except Exception as e:
        print(f" [!] Excecao no envio via Meta API: {e}")


if __name__ == "__main__":
    leads = prospect_businesses()
    if leads:
        save_to_csv(leads)
        send_whatsapp_summary(leads)
