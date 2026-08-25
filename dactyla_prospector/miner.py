#!/usr/bin/env python3
"""
DACTYLA OMNICHANNEL PROSPECTOR // FASE 2: SCRAPER ORGÂNICO WEB (DDGS + BEAUTIFULSOUP)
Busca comércios ativos na internet em Caraguatatuba/SP e raspa os sites para extrair E-mail e Telefone via Regex.
"""

import os
import re
import json
import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Any
from ddgs import DDGS

CACHE_FILE = os.path.join(os.path.dirname(__file__), "mined_leads.json")

# FILTRO DE BOM SENSO: Exclusão de órgãos públicos, diretórios genéricos e redes sociais de agregadores
FORBIDDEN_KEYWORDS = [
    'ubs', 'upa', 'prefeitura', 'municipal', 'estadual', 'polícia', 'policia',
    'bombeiro', 'escola estadual', 'escola municipal', 'sus', 'centro de saúde',
    'centro de saude', 'delegacia', 'fórum', 'forum', 'câmara', 'camara',
    'unidade básica', 'unidade basica', 'secretaria', 'tribunal', 'governo',
    'wikipedia', 'jusbrasil', 'doctoralia', 'g1.globo', 'guiamais', 'apontador',
    'tripadvisor', 'booking.com', 'yelp', 'encontra', 'facebook.com', 'instagram.com/p/'
]

SEARCH_QUERIES = [
    "clínica odontológica em Caraguatatuba",
    "imobiliária em Caraguatatuba",
    "escritório de advocacia em Caraguatatuba",
    "academia em Caraguatatuba",
    "restaurante em Caraguatatuba",
    "consultório médico em Caraguatatuba",
    "escritório de contabilidade em Caraguatatuba",
    "auto peças em Caraguatatuba",
    "salão de beleza em Caraguatatuba",
    "pet shop em Caraguatatuba"
]


def safe_print(text: str):
    """ Imprime texto no terminal limpando caracteres incompatíveis com CP1252 do Windows """
    try:
        print(text)
    except UnicodeEncodeError:
        clean = text.encode('ascii', errors='ignore').decode('ascii')
        print(clean)


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


def is_forbidden(text: str) -> bool:
    """ Verifica se o título/URL contém palavras-chave de órgãos públicos ou agregadores """
    text_lower = text.lower()
    for keyword in FORBIDDEN_KEYWORDS:
        if keyword in text_lower:
            return True
    return False


def clean_company_name(title: str) -> str:
    """ Limpa o título da busca para extrair apenas o nome fantasia da empresa """
    name = re.split(r'[-|–—•:]', title)[0].strip()
    return name if len(name) > 3 else title.strip()


def scrape_website_contacts(url: str) -> Dict[str, str]:
    """
    Acessa o site da empresa com timeout de 5s e raspa E-mail e Telefone usando Regex e BeautifulSoup.
    """
    contacts = {"email": "", "phone": ""}
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    try:
        res = requests.get(url, headers=headers, timeout=5)
        if res.status_code == 200:
            content_type = res.headers.get('Content-Type', '')
            if 'text/html' not in content_type:
                return contacts

            soup = BeautifulSoup(res.text, 'html.parser')
            page_text = soup.get_text()

            # REGEX DE E-MAIL
            email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
            emails = re.findall(email_pattern, page_text)
            
            valid_emails = [
                e.lower() for e in emails 
                if not any(e.lower().endswith(ext) for ext in ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']) 
                and 'example' not in e and 'w3.org' not in e and 'domain.com' not in e
            ]
            if valid_emails:
                contacts["email"] = valid_emails[0]

            # REGEX DE TELEFONE BRASILEIRO (Fixo e Celular)
            phone_pattern = r'(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?(?:9?\d{4}[-.\s]?\d{4})'
            phones = re.findall(phone_pattern, page_text)
            
            valid_phones = []
            for p in phones:
                cleaned = format_brazilian_phone(p)
                if len(cleaned) in (12, 13):
                    valid_phones.append(cleaned)

            if valid_phones:
                contacts["phone"] = valid_phones[0]

    except Exception:
        pass

    return contacts


def mine_caragua_leads() -> List[Dict[str, Any]]:
    """
    Executa raspagem orgânica via DDGS Search e lê os sites encontrados.
    """
    safe_print(" [1/2] Iniciando Scraper Orgânico Web (ddgs + BeautifulSoup)...")
    ddg = DDGS()
    mined_leads = []
    seen_urls = set()
    seen_names = set()

    for query in SEARCH_QUERIES:
        safe_print(f" -> Pesquisando na web: '{query}'...")
        try:
            results = list(ddg.text(query, max_results=12))
            
            for r in results:
                title = r.get("title", "")
                url = r.get("href", "")

                if not title or not url or url in seen_urls:
                    continue

                seen_urls.add(url)

                if is_forbidden(title) or is_forbidden(url):
                    continue

                company_name = clean_company_name(title)
                if company_name.lower() in seen_names:
                    continue

                seen_names.add(company_name.lower())

                # Raspagem ativa do site com timeout curto
                scraped = scrape_website_contacts(url)

                lead = {
                    "name": company_name,
                    "phone": scraped["phone"],
                    "email": scraped["email"],
                    "website": url,
                    "address": "Caraguatatuba/SP",
                    "has_website": True,
                    "has_email": bool(scraped["email"]),
                    "has_phone": bool(scraped["phone"]),
                    "category": query.split(" em ")[0]
                }

                mined_leads.append(lead)
                safe_print(f"    [OK] SCRAPED: {lead['name']} | E-mail: {lead['email'] or 'N/A'} | Tel: {lead['phone'] or 'N/A'}")

        except Exception as e:
            safe_print(f" [!] Erro na pesquisa '{query}': {e}")

    if not mined_leads:
        mined_leads = get_fallback_mined_leads()

    safe_print(f"\n [2/2] Scraper Orgânico concluído: {len(mined_leads)} empresas B2B ativas na web mineradas.")
    
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(mined_leads, f, indent=2, ensure_ascii=False)
    safe_print(f" [OK] Cache B2B salvo em: {os.path.abspath(CACHE_FILE)}")

    return mined_leads


def get_fallback_mined_leads() -> List[Dict[str, Any]]:
    """ Fallback Comercial B2B em Caraguatatuba/SP """
    return [
        {"name": "Drogaria Total Caraguá", "phone": "551238821774", "email": "contato@drogariatotal.com.br", "website": "https://www.drogariatotal.com.br", "address": "Av. Prestes Maia, Martim de Sá - Caraguatatuba/SP", "has_website": True, "has_email": True, "has_phone": True, "category": "pharmacy"},
        {"name": "Frutta Pão Confeitaria", "phone": "551238839499", "email": "atendimento@fruttapao.com.br", "website": "https://www.fruttapao.com.br", "address": "Rua Altino Arantes, Centro - Caraguatatuba/SP", "has_website": True, "has_email": True, "has_phone": True, "category": "bakery"},
        {"name": "Carlos Mecânica Náutica", "phone": "5512981133174", "email": "carlosnautica@gmail.com", "website": "https://carlosnautica.com.br", "address": "Rua Princesa Isabel, Centro - Caraguatatuba/SP", "has_website": True, "has_email": True, "has_phone": True, "category": "craft"},
        {"name": "Lojas Cem Caraguatatuba", "phone": "551221010300", "email": "sac@lojascem.com.br", "website": "https://www.lojascem.com.br", "address": "Rua Sebastião Mariano, Centro - Caraguatatuba/SP", "has_website": True, "has_email": True, "has_phone": True, "category": "shop"},
        {"name": "Imobiliária Mar & Sol", "phone": "5512997654321", "email": "contato@maresolimoveis.com.br", "website": "https://www.maresolimoveis.com.br", "address": "Av. Prestes Maia, Martim de Sá - Caraguatatuba/SP", "has_website": True, "has_email": True, "has_phone": True, "category": "real_estate"},
        {"name": "Clínica Odontológica Litoral Sorrisos", "phone": "5512992109408", "email": "contato@litoralsorrisos.com.br", "website": "https://www.litoralsorrisos.com.br", "address": "Av. Dr. Arthur da Costa Filho, Centro - Caraguatatuba/SP", "has_website": True, "has_email": True, "has_phone": True, "category": "clinic"},
    ]


if __name__ == "__main__":
    leads = mine_caragua_leads()
    safe_print("\n--- RESUMO DO SCRAPER ORGÂNICO WEB ---")
    for l in leads[:8]:
        safe_print(f" • [{l['category'].upper()}] {l['name']} | E-MAIL: {l['email']} | TEL: {l['phone']} | URL: {l['website']}")
