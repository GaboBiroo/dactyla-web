#!/usr/bin/env python3
"""
DACTYLA OMNICHANNEL PROSPECTOR // NÚCLEO ANTI-SPAM
Gerenciador de histórico de abordagens para evitar duplicação de disparos por Telefone, E-mail ou Nome.
"""

import os
import json
from datetime import datetime
from typing import Dict, Any, Optional

DB_FILE = os.path.join(os.path.dirname(__file__), "anti_spam_db.json")


class AntiSpamDB:
    def __init__(self, db_path: str = DB_FILE):
        self.db_path = db_path
        self._ensure_db_exists()

    def _ensure_db_exists(self):
        if not os.path.exists(self.db_path):
            initial_structure = {
                "description": "DACTYLA OMNICHANNEL PROSPECTOR // BANCO DE DADOS ANTI-SPAM DE HISTÓRICO DE ABORAGEM",
                "created_at": datetime.now().isoformat(),
                "contacted_leads": []
            }
            with open(self.db_path, "w", encoding="utf-8") as f:
                json.dump(initial_structure, f, indent=2, ensure_ascii=False)

    def load_data(self) -> Dict[str, Any]:
        """ Carregamento seguro do banco de dados anti-spam """
        try:
            with open(self.db_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[!] Erro ao carregar anti_spam_db.json: {e}")
            return {"contacted_leads": []}

    def is_already_contacted(self, name: Optional[str] = None, phone: Optional[str] = None, email: Optional[str] = None) -> bool:
        """
        Verifica se a empresa já foi abordada por Nome, Telefone ou E-mail.
        Retorna True se o contato já existe no banco anti-spam.
        """
        data = self.load_data()
        leads = data.get("contacted_leads", [])

        clean_name = name.strip().lower() if name else ""
        clean_phone = phone.strip() if phone else ""
        clean_email = email.strip().lower() if email else ""

        for lead in leads:
            lead_name = lead.get("name", "").strip().lower()
            lead_phone = lead.get("phone", "").strip()
            lead_email = lead.get("email", "").strip().lower()

            if clean_phone and clean_phone == lead_phone:
                return True
            if clean_email and clean_email == lead_email:
                return True
            if clean_name and clean_name == lead_name:
                return True

        return False

    def record_contact(self, name: str, phone: str = "", email: str = "", website: str = "", channel: str = "general", notes: str = ""):
        """
        Grava uma nova abordagem no banco de dados anti-spam com data e horário.
        """
        data = self.load_data()
        
        contact_entry = {
            "name": name.strip(),
            "phone": phone.strip(),
            "email": email.strip().lower(),
            "website": website.strip(),
            "channel": channel,
            "notes": notes,
            "contacted_at": datetime.now().isoformat()
        }

        data["contacted_leads"].append(contact_entry)

        with open(self.db_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
        print(f" [AntiSpam] Lead '{name}' gravado com sucesso no histórico ({channel}).")


if __name__ == "__main__":
    db = AntiSpamDB()
    print(f" [OK] Módulo AntiSpamDB inicializado e pronto em: {os.path.abspath(DB_FILE)}")
