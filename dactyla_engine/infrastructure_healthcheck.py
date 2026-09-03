#!/usr/bin/env python3
"""
DACTYLA ENGINE // 1-HOUR AUTOMATED INFRASTRUCTURE HEALTH CHECK & SELF-HEALER
Checa o status dos robôs no PM2, do servidor Ollama (IA Local) e da nuvem Vercel a cada 1 hora.
Em caso de queda de algum componente, tenta auto-recuperação imediata.
"""

import os
import sys
import time
import json
import subprocess
import urllib.request
import urllib.parse
from datetime import datetime

CHECK_INTERVAL_SECONDS = 3600  # 1 hora


def safe_print(text: str):
    """ Imprime texto no terminal sanitizando caracteres de terminal no Windows """
    try:
        print(text)
    except UnicodeEncodeError:
        clean = text.encode('ascii', errors='ignore').decode('ascii')
        print(clean)


def check_ollama_health() -> bool:
    """ Checa se o daemon do Ollama está respondendo na porta 11434 """
    try:
        req = urllib.request.Request("http://127.0.0.1:11434/api/tags", method="GET")
        with urllib.request.urlopen(req, timeout=5) as resp:
            if resp.status == 200:
                safe_print(" [✅] Ollama Daemon (IA Local Llama 3.2): ONLINE (Porta 11434)")
                return True
    except Exception as e:
        safe_print(f" [⚠️] Ollama Daemon (IA Local) INDISPONÍVEL: {e}")
    return False


def check_vercel_cloud_health() -> bool:
    """ Checa se a API REST na Vercel está respondendo com sucesso """
    try:
        req = urllib.request.Request("https://www.dactylacode.com.br/api/leads-sync", method="GET")
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status == 200:
                safe_print(" [✅] Vercel Cloud API (/api/leads-sync): ONLINE")
                return True
    except Exception as e:
        safe_print(f" [⚠️] Vercel Cloud API INDISPONÍVEL: {e}")
    return False


def check_pm2_processes() -> dict:
    """ Checa o status de todos os processos gerenciados pelo PM2 """
    result = {"prospector": False, "bot": False, "ai": False}
    try:
        output = subprocess.check_output("npx pm2 jlist", shell=True).decode('utf-8', errors='ignore')
        processes = json.loads(output)
        
        for proc in processes:
            name = proc.get("name", "")
            status = proc.get("pm2_env", {}).get("status", "")
            
            if name == "dactyla-prospector" and status == "online":
                result["prospector"] = True
            elif name == "dactyla-bot" and status == "online":
                result["bot"] = True
            elif name == "dactyla-ai" and status == "online":
                result["ai"] = True
                
        safe_print(f" [📊] PM2 Process Status: Prospector={'ONLINE' if result['prospector'] else 'OFFLINE'} | Bot={'ONLINE' if result['bot'] else 'OFFLINE'} | AI={'ONLINE' if result['ai'] else 'OFFLINE'}")
    except Exception as e:
        safe_print(f" [!] Erro ao checar status do PM2: {e}")
        
    return result


def auto_heal_failed_services(pm2_status: dict, ollama_online: bool):
    """ Tenta auto-recuperar qualquer serviço que esteja indisponível """
    if not ollama_online:
        safe_print(" [🔧] Tentando reiniciar o Ollama Daemon...")
        try:
            subprocess.Popen(["cmd.exe", "/c", "start", "", "C:\\Users\\Usuario\\AppData\\Local\\Programs\\Ollama\\ollama.exe", "serve"], shell=True)
        except Exception as e:
            safe_print(f" [!] Falha ao reiniciar Ollama: {e}")

    for proc_name, is_online in [("dactyla-prospector", pm2_status["prospector"]), ("dactyla-bot", pm2_status["bot"]), ("dactyla-ai", pm2_status["ai"])]:
        if not is_online:
            safe_print(f" [🔧] Reiniciando serviço indisponível: {proc_name}...")
            try:
                subprocess.call(f"npx pm2 restart {proc_name}", shell=True)
            except Exception as e:
                safe_print(f" [!] Falha ao reiniciar {proc_name}: {e}")

    # Salvar estado atualizado do PM2
    try:
        subprocess.call("npx pm2 save", shell=True)
    except Exception:
        pass


def run_health_check_loop():
    safe_print("=" * 80)
    safe_print(" DACTYLA ENGINE // 1-HOUR AUTOMATED INFRASTRUCTURE HEALTH CHECKER")
    safe_print(" Intervalo de Checagem: 1 Hora (3600s)")
    safe_print("=" * 80)

    while True:
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        safe_print(f"\n ------------------------------------------------------------------------")
        safe_print(f" 🔍 [HEALTHCHECK] Executando auditoria da infraestrutura - {now_str}")
        safe_print(f" ------------------------------------------------------------------------")

        ollama_ok = check_ollama_health()
        vercel_ok = check_vercel_cloud_health()
        pm2_status = check_pm2_processes()

        all_ok = ollama_ok and vercel_ok and all(pm2_status.values())

        if all_ok:
            safe_print(" 🏆 [EXCELENTE] Todos os componentes da infraestrutura estão 100% OPERACIONAIS!")
        else:
            safe_print(" ⚠️ [ATENÇÃO] Instabilidade detectada! Disparando protocolo de auto-recuperação...")
            auto_heal_failed_services(pm2_status, ollama_ok)

        safe_print(f"\n [+] Healthchecker em repouso... Próxima auditoria em 1 hora.")
        time.sleep(CHECK_INTERVAL_SECONDS)


if __name__ == "__main__":
    run_health_check_loop()
