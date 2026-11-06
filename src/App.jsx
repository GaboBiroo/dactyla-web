import React, { useState, useEffect, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ConcreteImpact from './components/ConcreteImpact';
import PricingSection from './components/PricingSection';
import FoundersDossier from './components/FoundersDossier';
import RealImpactCases from './components/RealImpactCases';
import BespokeEngineering from './components/BespokeEngineering';
import EliteFooter from './components/EliteFooter';

// Code-Splitting de rotas secundárias para performance máxima na Vercel
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const DactylaHub = lazy(() => import('./components/DactylaHub'));
const AuditoriaDactyla = lazy(() => import('./components/AuditoriaDactyla'));
const MerchantCounterApp = lazy(() => import('./components/MerchantCounterApp'));

function RouteLoadingFallback() {
  return (
    <div className="min-h-screen bg-[#0A140E] text-[#D4AF37] flex items-center justify-center font-mono text-xs uppercase tracking-widest">
      Carregando módulo Dactyla Code...
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  useEffect(() => {
    const handlePopState = () => {
      setRoute(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      setRoute(path);
      window.scrollTo(0, 0);
    }
  };

  if (route === '/privacidade') {
    return (
      <Suspense fallback={<RouteLoadingFallback />}>
        <PrivacyPolicy onBack={() => navigateTo('/')} />
      </Suspense>
    );
  }

  if (route === '/dactyla-hub' || route === '/hub') {
    return (
      <Suspense fallback={<RouteLoadingFallback />}>
        <DactylaHub
          onBack={() => navigateTo('/')}
          onOpenMerchantApp={() => navigateTo('/balcao')}
        />
      </Suspense>
    );
  }

  if (route === '/auditoria' || route === '/diagnostico') {
    return (
      <Suspense fallback={<RouteLoadingFallback />}>
        <AuditoriaDactyla onBack={() => navigateTo('/')} />
      </Suspense>
    );
  }

  if (route === '/balcao' || route === '/painel-lojista') {
    return (
      <Suspense fallback={<RouteLoadingFallback />}>
        <MerchantCounterApp onBack={() => navigateTo('/')} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A140E] text-[#E8F0EA] selection:bg-[#D4AF37] selection:text-[#0A140E] antialiased">
      <Navbar onNavigate={navigateTo} />
      <main>
        {/* 1. A Promessa — Resgate de clientes inativos em 48h, Mascote 3D e Mapa de Caraguatatuba */}
        <HeroSection />

        {/* 2. A Matemática de Balcão — Calculadora Interativa de ROI + Dados Reais de Caraguá */}
        <ConcreteImpact />

        {/* 3. Protocolo Caixa Primeiro — Motor 48h (R$ 400 + R$ 130/mês) em destaque */}
        <PricingSection />

        {/* 4. A Autoridade — Dossiê Executivo de Gabriel Hatakeyama & Matheus Vicente */}
        <FoundersDossier />

        {/* 5. A Prova Real — Estudos de caso verificáveis */}
        <RealImpactCases />

        {/* 6. Operações Especiais — Engenharia Sob Medida & Big Data */}
        <BespokeEngineering />
      </main>

      {/* 7. Fechamento de Funil — Diagnóstico 48h, Cal.com e Rodapé Institucional */}
      <EliteFooter onOpenPrivacy={() => navigateTo('/privacidade')} />
    </div>
  );
}
