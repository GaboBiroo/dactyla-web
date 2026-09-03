#!/usr/bin/env python3
"""
DACTYLA OMNICHANNEL PROSPECTOR // POPULADOR DE HISTÓRICO EM NUVEM (PUSH HISTORY)
Lê arquivos locais de leads minerados (CSV/JSON) e dispara a carga inicial para o Kanban Vercel.
"""

import os
import csv
import json
import urllib.request
import urllib.parse
from typing import List, Dict, Any

PROSPECTOR_API_KEY = os.getenv("PROSPECTOR_API_KEY", "dactyla_prospector_secret_2026")
CLOUD_SYNC_URL = os.getenv("CLOUD_SYNC_URL", "https://www.dactylacode.com.br/api/leads-sync")


def safe_print(text: str):
    """ Imprime texto sanitizado no terminal do Windows """
    try:
        print(text)
    except UnicodeEncodeError:
        clean = text.encode('ascii', errors='ignore').decode('ascii')
        print(clean)


def push_historical_leads():
    base_dir = os.path.dirname(__file__)
    csv_file = os.path.join(base_dir, "leads_quentes_whatsapp.csv")
    json_file = os.path.join(base_dir, "mined_leads.json")

    leads_to_push = []

    # 1. Tentar ler do JSON
    if os.path.exists(json_file):
        try:
            with open(json_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    leads_to_push.extend(data)
                    safe_print(f" [OK] {len(data)} leads carregados de mined_leads.json")
        except Exception as e:
            safe_print(f" [!] Erro ao ler mined_leads.json: {e}")

    # 2. Tentar ler do CSV
    if os.path.exists(csv_file):
        try:
            with open(csv_file, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                csv_leads = list(reader)
                leads_to_push.extend(csv_leads)
                safe_print(f" [OK] {len(csv_leads)} leads carregados de leads_quentes_whatsapp.csv")
        except Exception as e:
            safe_print(f" [!] Erro ao ler leads_quentes_whatsapp.csv: {e}")

    if not leads_to_push:
        safe_print(" [!] Nenhum lead histórico encontrado para disparo.")
        return

    safe_print(f"\n [🚀] Disparando {len(leads_to_push)} leads históricos para a nuvem Vercel...")

    formatted_payload = []
    for item in leads_to_push:
        empresa = item.get("name") or item.get("empresa") or "Empresa B2B"
        categoria = item.get("category") or item.get("categoria") or "B2B"
        telefone = item.get("phone") or item.get("telefone") or ""
        email = item.get("email") or "N/A"
        website = item.get("website") or "N/A"
        tag = item.get("tag") or item.get("status_campanha") or "[OPORTUNIDADE B2B]"
        pitch = item.get("cold_template") or item.get("mensagem_pitch") or ""
        wa_link = item.get("wa_link") or item.get("wa_link_1clique") or f"https://wa.me/{telefone}"

        formatted_payload.append({
            "empresa": empresa,
            "categoria": f"{tag} | {categoria}",
            "telefone": telefone,
            "email": email,
            "website": website,
            "status_campanha": tag,
            "mensagem_pitch": pitch,
            "wa_link_1clique": wa_link,
            "stage": item.get("stage", "novos")
        })

    payload = {"leads": formatted_payload}

    headers = {
        "Content-Type": "application/json",
        "x-prospector-key": PROSPECTOR_API_KEY
    }

    try:
        req_data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(CLOUD_SYNC_URL, data=req_data, headers=headers, method="POST")

        with urllib.request.urlopen(req, timeout=20) as resp:
            res_body = resp.read().decode('utf-8')
            res_json = json.loads(res_body)
            safe_print(f" [🎉] CARGA HISTÓRICA CONCLUÍDA COM SUCESSO!")
            safe_print(f"     Total na Nuvem: {res_json.get('totalCloudLeads')} | Novos Adicionados: {res_json.get('added')} | Atualizados: {res_json.get('updated')}")
    except Exception as e:
        safe_print(f" [!] Erro ao enviar carga histórica para o Kanban: {e}")


if __name__ == "__main__":
    push_historical_leads()
