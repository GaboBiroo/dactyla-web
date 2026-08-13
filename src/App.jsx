import React from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ConcreteImpact from './components/ConcreteImpact';
import PricingSection from './components/PricingSection';
import FoundersDossier from './components/FoundersDossier';
import RealImpactCases from './components/RealImpactCases';
import BespokeEngineering from './components/BespokeEngineering';
import EliteFooter from './components/EliteFooter';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0A140E] text-[#E8F0EA] selection:bg-[#D4AF37] selection:text-[#0A140E] antialiased">
      <Navbar />
      <main>
        {/* 1. A Promessa — Mapa 3D, tipografia de poder, retenção em 3 segundos */}
        <HeroSection />

        {/* 2. A Dor — Dados estatísticos que criam a ferida antes de mostrar o remédio */}
        <ConcreteImpact />

        {/* 3. O Remédio — Pacotes modulares apresentados como investimento, não custo */}
        <PricingSection />

        {/* 4. A Autoridade — Dossiê dos fundadores chancela a decisão de compra */}
        <FoundersDossier />

        {/* 5. A Prova Real — Estudos de caso com impacto verificável */}
        <RealImpactCases />

        {/* 6. Operações Especiais — Engenharia Sob Medida & Big Data */}
        <BespokeEngineering />
      </main>

      {/* 7. Fechamento de Funil — Diagnóstico, CTA Executivo e Rodapé Institucional */}
      <EliteFooter />
    </div>
  );
}
