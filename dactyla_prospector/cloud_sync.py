#!/usr/bin/env python3
"""
DACTYLA OMNICHANNEL PROSPECTOR // CLIENTE DE SINCRONIZAÇÃO EM NUVEM (CLOUD SYNC)
Sincroniza os leads gerados localmente no PC diretamente com a API Serverless da Vercel para exibição instantânea no CRM Kanban.
"""

import os
import json
import requests
from typing import List, Dict, Any

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

PROSPECTOR_API_KEY = os.getenv("PROSPECTOR_API_KEY", "dactyla_prospector_secret_2026")
CLOUD_SYNC_URL = os.getenv("CLOUD_SYNC_URL", "https://www.dactylacode.com.br/api/leads-sync")
LOCAL_TEST_URL = "http://localhost:5173/api/leads-sync"


def safe_print(text: str):
    """ Imprime texto no terminal de forma segura para o encoding CP1252 do Windows """
    try:
        print(text)
    except UnicodeEncodeError:
        clean = text.encode('ascii', errors='ignore').decode('ascii')
        print(clean)


def sync_leads_to_cloud(leads_data: List[Dict[str, Any]], target_url: str = None) -> bool:
    """
    Dispara os leads minerados/estruturados para a API Serverless da Vercel.
    """
    url = target_url or CLOUD_SYNC_URL
    safe_print(f" [CloudSync] Enviando {len(leads_data)} leads para a nuvem ({url})...")

    headers = {
        "Content-Type": "application/json",
        "x-prospector-key": PROSPECTOR_API_KEY
    }

    payload = {"leads": leads_data}

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        if response.status_code == 200:
            res_json = response.json()
            safe_print(f" [CloudSync OK] {res_json.get('message')} | Novos: {res_json.get('added')} | Atualizados: {res_json.get('updated')}")
            return True
        else:
            safe_print(f" [!] Falha na sincronização cloud (Status {response.status_code}): {response.text}")
            return False
    except Exception as e:
        safe_print(f" [!] Exceção de conexão ao sincronizar com a nuvem: {e}")
        return False


if __name__ == "__main__":
    csv_file = os.path.join(os.path.dirname(__file__), "leads_quentes_whatsapp.csv")
    if os.path.exists(csv_file):
        import csv
        with open(csv_file, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            sample_leads = list(reader)
        sync_leads_to_cloud(sample_leads, target_url=LOCAL_TEST_URL)
    else:
        safe_print(f"[!] Arquivo {csv_file} não encontrado para teste de sync.")
