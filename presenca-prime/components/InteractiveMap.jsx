import React from 'react';

/**
 * Componente dinâmico de mapa.
 * Carregado sob demanda após o término da renderização crítica.
 */
export default function InteractiveMap() {
  return (
    <div className="w-full h-80 rounded-xl bg-[#0E1B13] border border-[#28593B]/40 p-4 flex flex-col justify-between relative overflow-hidden">
      <div className="flex items-center justify-between z-10">
        <span className="font-mono text-xs text-[#D4AF37] uppercase tracking-wider font-bold">
          HUB DE INFRAESTRUTURA DACTYLA // CARAGUATATUBA - SP
        </span>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#28593B]/40 text-[#E8F0EA]">
          GPS ACTIVE
        </span>
      </div>

      <div className="my-auto text-center z-10">
        <p className="text-sm font-mono text-[#E8F0EA]/80">
          Google Maps SDK Renderizado de Forma Assíncrona.
        </p>
        <p className="text-xs text-[#E8F0EA]/50 font-light mt-1">
          Lat/Long: -23.6226, -45.4124 | Conexão Segura SSL/TLS 1.3
        </p>
      </div>

      <div className="text-right text-[10px] font-mono text-[#28593B] z-10">
        LATENCY: 12ms // DISTRIBUTED NODE
      </div>

      {/* Grid decorativo de fundo */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#28593b15_1px,transparent_1px),linear-gradient(to_bottom,#28593b15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
    </div>
  );
}
