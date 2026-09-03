#!/usr/bin/env python3
"""
DACTYLA ENGINE // SMART INVENTORY & TAX CLASSIFIER AI
Módulo de Previsão Preditiva de Estoque Sazonal e Auditoria Tributária Automatizada (CFOP / NCM / CEST)

Axiomas de Engenharia:
1. Previsão Preditiva de Inventário baseada na sazonalidade micro-regional do Litoral Norte (picos de Verão e feriados).
2. Cruzamento e Auditoria Tributária de NCM, CEST e CFOP para evitar autuações fiscais da SEFAZ-SP.
"""

import json
from datetime import datetime, timedelta
from typing import List, Dict, Any

# Tabela de Regras Fiscais de Substituição Tributária (ICMS-ST SP)
TAX_RULES_DB = {
    "2203.00.00": {"desc": "Cerveja de Malte", "cfop_padrao": "5.405", "cest": "03.001.00", "st_aplicavel": True},
    "2202.10.00": {"desc": "Refrigerante / Água com Gás", "cfop_padrao": "5.405", "cest": "03.010.00", "st_aplicavel": True},
    "1006.30.21": {"desc": "Arroz Beneficiado", "cfop_padrao": "5.102", "cest": "17.001.00", "st_aplicavel": False},
    "0713.33.19": {"desc": "Feijão Preto/Carioca", "cfop_padrao": "5.102", "cest": "17.002.00", "st_aplicavel": False},
    "3402.20.00": {"desc": "Detergente Líquido", "cfop_padrao": "5.405", "cest": "11.001.00", "st_aplicavel": True},
    "0201.30.00": {"desc": "Carne Bovina Desossada", "cfop_padrao": "5.102", "cest": "17.080.00", "st_aplicavel": False},
}


class SmartInventoryAI:
    def __init__(self, region: str = "Caraguatatuba"):
        self.region = region

    def audit_tax_classification(self, ncm: str, input_cfop: str = "5.102") -> Dict[str, Any]:
        """
        Audita o código NCM informado e sugere a tributação correta para o Estado de São Paulo
        """
        clean_ncm = ncm.strip().replace(".", "")
        found_rule = None
        
        for rule_ncm, data in TAX_RULES_DB.items():
            if rule_ncm.replace(".", "") == clean_ncm:
                found_rule = data
                break

        if not found_rule:
            return {
                "ncm": ncm,
                "status": "NCM_NAO_ENCONTRADO_NA_BASE_MATRIZ",
                "cfop_sugerido": input_cfop,
                "cest_sugerido": "N/A",
                "st_aplicavel": False,
                "alerta_fiscal": "Verificar enquadramento manual no balancete contábil."
            }

        is_divergent = found_rule["st_aplicavel"] and input_cfop == "5.102"
        
        return {
            "ncm": ncm,
            "descricao": found_rule["desc"],
            "status": "DIVERGENCIA_DETECTADA" if is_divergent else "CONFORME_SEFAZ_SP",
            "cfop_original": input_cfop,
            "cfop_sugerido": found_rule["cfop_padrao"],
            "cest_sugerido": found_rule["cest"],
            "st_aplicavel": found_rule["st_aplicavel"],
            "alerta_fiscal": (
                "⚠️ ALERTA FISCAL: NCM sujeito a ICMS-ST! Alterar CFOP de 5.102 para 5.405 para evitar bi-tributação."
                if is_divergent else "Classificação fiscal auditada e em conformidade."
            )
        }

    def predict_coastal_seasonality_stock(self, product_code: str, desc: str, current_stock: float, avg_daily_sales: float) -> Dict[str, Any]:
        """
        Calcula a projeção de esgotamento de estoque considerando o multiplicador de temporada do Litoral Norte (dezembro a fevereiro / feriados)
        """
        current_month = datetime.now().month
        
        # Multiplicador de Demanda Turística no Litoral (Temporada de Verão = 2.8x)
        is_high_season = current_month in [12, 1, 2, 7]
        multiplier = 2.8 if is_high_season else 1.2
        
        projected_daily_sales = avg_daily_sales * multiplier
        days_until_stockout = current_stock / projected_daily_sales if projected_daily_sales > 0 else 999
        
        recommended_order_qty = max(0, (projected_daily_sales * 15) - current_stock) # Estoque de segurança de 15 dias

        return {
            "codigo": product_code,
            "descricao": desc,
            "estoque_atual": current_stock,
            "vendas_diarias_medias": avg_daily_sales,
            "fator_sazonalidade_regiao": f"{multiplier}x ({self.region})",
            "vendas_diarias_projetadas": round(projected_daily_sales, 2),
            "dias_ate_esgotamento": round(days_until_stockout, 1),
            "alerta_ruptura": days_until_stockout <= 5,
            "sugestao_compra_lote": round(recommended_order_qty, 0)
        }


def main():
    import time
    print("=" * 80)
    print(" DACTYLA ENGINE // SMART INVENTORY & TAX CLASSIFIER AI (24/7 CONTINUOUS DAEMON)")
    print("=" * 80)

    ai = SmartInventoryAI(region="Caraguatatuba / Ubatuba / São Sebastião / Ilhabela")

    while True:
        try:
            print(f"\n [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Executando ciclo de auditoria preditiva e fiscal...")
            tax_audit = ai.audit_tax_classification(ncm="2203.00.00", input_cfop="5.102")
            print(" [OK] Auditoria tributária concluída.")

            prediction = ai.predict_coastal_seasonality_stock(
                product_code="LEG_0004",
                desc="Cerveja Pilsen Lata 350ml",
                current_stock=150.0,
                avg_daily_sales=45.0
            )
            print(" [OK] Projeção de estoque sazonal atualizada.")
        except Exception as e:
            print(f" [!] Erro no ciclo de IA: {e}")

        print(" [+] Dactyla AI em aguardo... Próximo ciclo em 1 hora.")
        time.sleep(3600)


if __name__ == "__main__":
    main()
