#!/usr/bin/env python3
"""
DACTYLA CODE // PROSPECTOR DE ENGANJAMENTO DE ALTO GIRO
Script de Prospecção Automática de Clientes com Deficiência Digital (Google Maps Places API -> Meta WhatsApp)

Funcionalidade:
1. Pesquisa empresas locais de alto giro (clínicas, imobiliárias, confeitarias, restaurantes) em Caraguatatuba, SP.
2. Filtra estabelecimentos com Telefone Cadastrado mas SEM Website (oportunidades de alta conversão para o Pacote Starter).
3. Formata os números para o padrão MSISDN (55 + DDD + Número) e gera o link wa.me para clique em 1 segundo.
4. Salva a lista de leads em um arquivo CSV de alta qualidade ('prospects_caraguatatuba.csv').
5. Dispara um relatório resumo executivo via WhatsApp Graph API v18.0 para o WhatsApp pessoal do fundador.
"""

import os
import csv
import re
import requests
from typing import List, Dict

# Tentar importar a biblioteca oficial googlemaps
try:
    import googlemaps
except ImportError:
    print("[ERRO] Biblioteca 'googlemaps' não encontrada. Instale executando: pip install googlemaps requests")
    exit(1)

# ----------------------------------------------------------------------
# CONFIGURAÇÕES E VARIÁVEIS DE AMBIENTE
# ----------------------------------------------------------------------
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "SUA_GOOGLE_MAPS_API_KEY_AQUI")
META_PHONE_NUMBER_ID = os.getenv("META_PHONE_NUMBER_ID", "1200440509826812")
META_ACCESS_TOKEN = os.getenv("META_ACCESS_TOKEN", "SEU_META_ACCESS_TOKEN_EAAG_AQUI")
MY_PERSONAL_PHONE = os.getenv("MY_PERSONAL_PHONE", "5512991879486") # +55 12 99187-9486

CITY_LOCATION = "Caraguatatuba, SP"
BUSINESS_TYPES = ["clínica", "imobiliária", "confeitaria", "consultório odontológico", "restaurante"]
CSV_OUTPUT_FILE = "prospects_caraguatatuba.csv"


def format_brazilian_phone(phone_str: str) -> str:
    """ Limpa e formata o número de telefone para o padrão internacional MSISDN (55 + DDD + Número) """
    if not phone_str:
        return ""
    
    digits = re.sub(r'\D', '', phone_str)
    
    # Remove zero inicial se presente (ex: 012...)
    if digits.startswith("0"):
        digits = digits[1:]
    
    # Se tiver 10 ou 11 dígitos (com DDD), adiciona o código do país 55
    if len(digits) in (10, 11) and not digits.startswith("55"):
        digits = "55" + digits
    
    return digits


def prospect_businesses() -> List[Dict[str, str]]:
    """ Busca empresas no Google Maps Places API e filtra aquelas sem website """
    print(f"[1/3] Iniciando busca por empresas com deficiência digital em {CITY_LOCATION}...")
    
    if GOOGLE_MAPS_API_KEY == "SUA_GOOGLE_MAPS_API_KEY_AQUI":
        print("\n[AVISO] Configure sua GOOGLE_MAPS_API_KEY nas variáveis de ambiente ou edite o script.")
        print("Executando em modo de simulação com dados de demonstração...\n")
        return [
            {
                "name": "Clínica Odontológica Caraguá",
                "phone": "5512992109408",
                "address": "Av. Anchieta, 450 - Centro, Caraguatatuba - SP",
                "wa_link": "https://wa.me/5512992109408"
            },
            {
                "name": "Confeitaria Doce Arte",
                "phone": "5512998887766",
                "address": "Rua Altino Arantes, 120 - Centro, Caraguatatuba - SP",
                "wa_link": "https://wa.me/5512998887766"
            }
        ]
    
    gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)
    qualified_leads = []
    seen_place_ids = set()

    for b_type in BUSINESS_TYPES:
        query = f"{b_type} em {CITY_LOCATION}"
        print(f" -> Buscando: '{query}'...")
        
        try:
            results = gmaps.places(query=query)
            places = results.get("results", [])
            
            for place in places:
                place_id = place.get("place_id")
                if not place_id or place_id in seen_place_ids:
                    continue
                
                seen_place_ids.add(place_id)
                
                # Detalhes aprofundados do estabelecimento
                details = gmaps.place(place_id=place_id, fields=["name", "formatted_phone_number", "website", "formatted_address"]).get("result", {})
                
                website = details.get("website", "").strip()
                raw_phone = details.get("formatted_phone_number", "").strip()
                
                # FILTRO DE OURO DA DACTYLA CODE:
                # Possui Telefone Cadastrado E NÃO possui Website (Deficiência Digital)
                if raw_phone and not website:
                    clean_phone = format_brazilian_phone(raw_phone)
                    if clean_phone:
                        lead = {
                            "name": details.get("name", "Empresa Sem Nome"),
                            "phone": clean_phone,
                            "address": details.get("formatted_address", "Endereço não informado"),
                            "wa_link": f"https://wa.me/{clean_phone}"
                        }
                        qualified_leads.append(lead)
                        print(f"    ✔ ENCONTRADO: {lead['name']} | Telefone: {lead['phone']} | SEM WEBSITE")

        except Exception as e:
            print(f" [!] Erro ao buscar {b_type}: {e}")

    return qualified_leads


def save_to_csv(leads: List[Dict[str, str]]):
    """ Salva os leads qualificados em um arquivo CSV """
    print(f"\n[2/3] Salvando {len(leads)} leads no arquivo CSV '{CSV_OUTPUT_FILE}'...")
    
    with open(CSV_OUTPUT_FILE, mode="w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=["name", "phone", "address", "wa_link"])
        writer.writeheader()
        writer.writerows(leads)
        
    print(f" ✔ Arquivo CSV salvo com sucesso em '{os.path.abspath(CSV_OUTPUT_FILE)}'.")


def send_whatsapp_summary(leads: List[Dict[str, str]]):
    """ Envia o relatório de prospecção via Meta Graph API v18.0 para o WhatsApp pessoal """
    print(f"\n[3/3] Disparando relatório resumo via WhatsApp para +{MY_PERSONAL_PHONE}...")
    
    if not leads:
        print("Nenhum lead qualificado encontrado para envio.")
        return

    # Formatação do Relatório
    message_lines = [
        "🚀 *DACTYLA CODE // RELATÓRIO DE PROSPECÇÃO*",
        f"📍 *Região*: {CITY_LOCATION}",
        f"🎯 *Leads com Deficiência Digital*: {len(leads)} empresas encontradas sem site.\n",
        "----------------------------------------"
    ]
    
    for idx, lead in enumerate(leads[:8], 1): # Envia os 8 primeiros para leitura limpa
        message_lines.append(f"*{idx}. {lead['name']}*")
        message_lines.append(f"   📞 Telefone: +{lead['phone']}")
        message_lines.append(f"   🔗 Clique para prospectar: {lead['wa_link']}\n")

    message_lines.append("----------------------------------------")
    message_lines.append("💡 *Recomendação*: Clique no link wa.me para apresentar o *Pacote Starter*!")
    
    summary_text = "\n".join(message_lines)
    
    # Envio via Meta Graph API v18.0
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
            "body": summary_text
        }
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        if response.status_code == 200:
            print(" ✔ RELATÓRIO ENVIADO COM SUCESSO PARA O SEU WHATSAPP!")
        else:
            print(f" [!] Falha ao enviar WhatsApp (HTTP {response.status_code}): {response.text}")
    except Exception as e:
        print(f" [!] Exceção no disparo HTTP da Meta API: {e}")


if __name__ == "__main__":
    leads = prospect_businesses()
    if leads:
        save_to_csv(leads)
        send_whatsapp_summary(leads)
    else:
        print("\nNenhuma empresa com deficiência digital foi encontrada na busca atual.")
