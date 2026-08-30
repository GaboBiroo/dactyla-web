#!/usr/bin/env python3
"""
DACTYLA OMNICHANNEL PROSPECTOR // WHATSAPP HUB & CLOUD SYNC
Processa os leads minerados, gera links de 1-clique para o WhatsApp e dispara a sincronização com o Kanban Vercel.
"""

import os
import json
import csv
from typing import List, Dict, Any
from cloud_sync import sync_leads_to_cloud

MINED_LEADS_FILE = os.path.join(os.path.dirname(__file__), "mined_leads.json")
CSV_OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "leads_quentes_whatsapp.csv")


def safe_print(text: str):
    """ Imprime texto no terminal sanitizando caracteres incompatíveis com o encoding CP1252 do Windows """
    try:
        print(text)
    except UnicodeEncodeError:
        clean = text.encode('ascii', errors='ignore').decode('ascii')
        print(clean)


def process_whatsapp_hub() -> List[Dict[str, Any]]:
    """ Processa os leads minerados e exporta o relatório em CSV e Cloud Sync """
    safe_print(" [1/2] Processando relatórios do WhatsApp Hub...")

    if not os.path.exists(MINED_LEADS_FILE):
        safe_print(f" [!] Arquivo {MINED_LEADS_FILE} não encontrado.")
        return []

    with open(MINED_LEADS_FILE, "r", encoding="utf-8") as f:
        leads = json.load(f)

    processed_leads = []
    
    for l in leads:
        phone = l.get("phone", "")
        clean_phone = phone.replace("+", "").replace("-", "").replace(" ", "").strip() if phone else ""
        
        if clean_phone and not clean_phone.startswith("55"):
            clean_phone = f"55{clean_phone}"

        wa_link = f"https://wa.me/{clean_phone}?text=Ol%C3%A1!%20Vi%20sua%20empresa%20em%20Caraguatatuba." if clean_phone else ""

        lead_entry = {
          "empresa": l.get("name", "Empresa"),
          "categoria": l.get("category", "B2B"),
          "telefone": f"+{clean_phone}" if clean_phone else "N/A",
          "email": l.get("email") or "N/A",
          "website": l.get("website") or "N/A",
          "status_campanha": "MINERADO_WHATSAPP_PRONTO",
          "mensagem_pitch": f"Olá! Notei a excelente atuação da {l.get('name')} em Caraguatatuba...",
          "wa_link_1clique": wa_link,
          "stage": "novos"
        }
        processed_leads.append(lead_entry)

    # Exporta o arquivo CSV seguro
    if processed_leads:
        fieldnames = list(processed_leads[0].keys())
        with open(CSV_OUTPUT_FILE, "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(processed_leads)

        safe_print(f" [OK] Relatório CSV salvo em: {os.path.abspath(CSV_OUTPUT_FILE)}")

    # Dispara Sincronização em Tempo Real com o CRM Kanban na Vercel
    safe_print(" [2/2] Sincronizando leads com o CRM Kanban da Vercel...")
    sync_leads_to_cloud(processed_leads)

    return processed_leads


if __name__ == "__main__":
    process_whatsapp_hub()
