#!/usr/bin/env python3
"""
DACTYLA OMNICHANNEL PROSPECTOR // CLIENTE DE SINCRONIZAÇÃO EM NUVEM (CLOUD SYNC ZERO-TOUCH)
Sincroniza os leads gerados localmente no PC diretamente com a API Serverless da Vercel para exibição instantânea no CRM Kanban.
"""

import os
import json
import urllib.request
import urllib.parse
from typing import List, Dict, Any

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

PROSPECTOR_API_KEY = os.getenv("PROSPECTOR_API_KEY", "dactyla_prospector_secret_2026")
CLOUD_SYNC_URL = os.getenv("CLOUD_SYNC_URL", "https://www.dactylacode.com.br/api/leads-sync")


def safe_print(text: str):
    """ Imprime texto no terminal de forma segura para o encoding CP1252 do Windows """
    try:
        print(text)
    except UnicodeEncodeError:
        clean = text.encode('ascii', errors='ignore').decode('ascii')
        print(clean)


def sync_leads_to_cloud(leads_data: List[Dict[str, Any]], target_url: str = None) -> bool:
    """
    Dispara o payload JSON de leads minerados diretamente para a API Serverless da Vercel (Zero-Touch Sync).
    """
    url = target_url or CLOUD_SYNC_URL
    safe_print(f" [CloudSync] Transmitindo {len(leads_data)} leads via JSON para a nuvem Vercel ({url})...")

    headers = {
        "Content-Type": "application/json",
        "x-prospector-key": PROSPECTOR_API_KEY
    }

    # Formatação padronizada do payload JSON
    formatted_leads = []
    for item in leads_data:
        empresa = item.get("name") or item.get("empresa") or "Empresa B2B"
        categoria = item.get("category") or item.get("categoria") or "B2B"
        telefone = item.get("phone") or item.get("telefone") or ""
        email = item.get("email") or "N/A"
        website = item.get("website") or "N/A"
        tag = item.get("tag") or item.get("status_campanha") or "[OPORTUNIDADE B2B]"
        pitch = item.get("cold_template") or item.get("mensagem_pitch") or ""
        wa_link = item.get("wa_link") or item.get("wa_link_1clique") or f"https://wa.me/{telefone}"

        formatted_leads.append({
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

    payload = {"leads": formatted_leads}

    try:
        req_bytes = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=req_bytes, headers=headers, method="POST")

        with urllib.request.urlopen(req, timeout=15) as resp:
            res_body = resp.read().decode('utf-8')
            res_json = json.loads(res_body)
            safe_print(f" [CloudSync OK] {res_json.get('message')} | Total na Nuvem: {res_json.get('totalCloudLeads')} | Novos: {res_json.get('added')} | Atualizados: {res_json.get('updated')}")
            return True
    except Exception as e:
        safe_print(f" [!] Exceção na transmissão JSON para a nuvem: {e}")
        return False


if __name__ == "__main__":
    cache_file = os.path.join(os.path.dirname(__file__), "mined_leads.json")
    if os.path.exists(cache_file):
        with open(cache_file, "r", encoding="utf-8") as f:
            leads = json.load(f)
        sync_leads_to_cloud(leads)
    else:
        safe_print(f" [!] Arquivo {cache_file} não encontrado.")
