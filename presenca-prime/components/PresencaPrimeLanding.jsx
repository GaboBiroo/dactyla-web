import React, { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Script from 'next/script';

/**
 * ARQUITETURA DE PERFORMANCE PRESENÇA PRIME (Lighthouse Score 90+ Target)
 * 
 * 1. Lazy Loading Obrigatório (next/dynamic):
 * Componentes pesados de terceiros, como Formulários Tally, modais e componentes 3D,
 * são particionados da árvore principal para garantir LCP < 1.2s e TBT < 50ms.
 */
const TallyFormModal = dynamic(
  () => import('./TallyFormModal'),
  {
    loading: () => (
      <div className="w-full h-96 flex items-center justify-center bg-[#0A140E] text-[#28593B] rounded-xl border border-[#28593B]/30 animate-pulse">
        <span className="font-mono text-sm uppercase tracking-widest">Carregando Formulário Seguro...</span>
      </div>
    ),
    ssr: false, // Desativa SSR para iFrames de terceiros, economizando ciclo de CPU no servidor
  }
);

const InteractiveMap = dynamic(
  () => import('./InteractiveMap'),
  {
    loading: () => (
      <div className="w-full h-80 bg-[#0A140E] rounded-xl border border-[#28593B]/30 flex items-center justify-center">
        <span className="font-mono text-xs text-[#E8F0EA]/60 uppercase tracking-widest">Carregando Mapa de Alta Resolução...</span>
      </div>
    ),
    ssr: false,
  }
);

export default function PresencaPrimeLanding() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A140E] text-[#E8F0EA] font-sans antialiased selection:bg-[#D4AF37] selection:text-[#0A140E]">
      
      {/* 
        2. DADOS E SCRIPTS DIFERIDOS (FinOps & Web Vitals)
        O script da Google Maps API é injetado estritamente com `strategy="lazyOnload"`.
        Isso garante que a API externa NUNCA dispute a thread principal durante a pintura crítica da tela.
      */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'DEMO_KEY'}&libraries=places`}
        strategy="lazyOnload"
        onLoad={() => {
          setGoogleMapsLoaded(true);
          console.log('[Presença Prime] Google Maps API diferida carregada com sucesso sem impacto no LCP.');
        }}
      />

      {/* Hero Section Primária (LCP Otimizado: HTML Nativo Sem Bloqueios JS) */}
      <header className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#28593B]/20 border border-[#28593B]/40 mb-8">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] font-semibold">
            INFRAESTRUTURA PRESENÇA PRIME // SCORE 90+ LIGHTHOUSE
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#E8F0EA] leading-tight max-w-4xl">
          Presença Digital de Alta Performance com <span className="text-[#D4AF37]">Next.js</span> e Atendimento por <span className="text-[#28593B] italic">IA Nativa</span>.
        </h1>

        <p className="mt-6 text-lg md:text-xl text-[#E8F0EA]/80 font-light max-w-2xl leading-relaxed">
          Infraestrutura base Single Page Application (SPA) projetada para carregamento instantâneo, captura de leads idempotente e zero desperdício de requisições.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-8 py-4 bg-[#D4AF37] hover:bg-[#b5942d] text-[#0A140E] font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 text-center cursor-pointer"
          >
            Iniciar Diagnóstico de Infraestrutura
          </button>
          
          <a
            href="#arquitetura"
            className="px-8 py-4 bg-transparent hover:bg-[#28593B]/20 text-[#E8F0EA] font-semibold rounded-xl border border-[#28593B]/50 transition-all duration-300 text-center"
          >
            Ver Especificações Técnicas
          </a>
        </div>
      </header>

      {/* Seção de Arquitetura & Especificações */}
      <section id="arquitetura" className="py-20 bg-[#0E1B13] border-y border-[#28593B]/30 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-8 rounded-2xl bg-[#0A140E] border border-[#28593B]/30 hover:border-[#D4AF37]/40 transition-all">
            <div className="text-[#D4AF37] font-mono text-xl font-bold mb-3">01 // LATÊNCIA RÍGIDA</div>
            <h3 className="text-xl font-bold text-[#E8F0EA] mb-2">Ingestão Meta &lt; 200ms</h3>
            <p className="text-sm text-[#E8F0EA]/70 font-light leading-relaxed">
              Gateway HTTP desacoplado com resposta imediata HTTP 200 OK. Processamento pesado de mensagens isolado via filas assíncronas no Laravel Horizon.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#0A140E] border border-[#28593B]/30 hover:border-[#D4AF37]/40 transition-all">
            <div className="text-[#D4AF37] font-mono text-xl font-bold mb-3">02 // SEGURANÇA BANCÁRIA</div>
            <h3 className="text-xl font-bold text-[#E8F0EA] mb-2">HMAC SHA-256 &amp; Idempotência</h3>
            <p className="text-sm text-[#E8F0EA]/70 font-light leading-relaxed">
              Validação criptográfica obrigatória no cabeçalho X-Hub-Signature-256 e trava transacional por WAMID único contra ataques e retentativas duplicadas.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#0A140E] border border-[#28593B]/30 hover:border-[#D4AF37]/40 transition-all">
            <div className="text-[#D4AF37] font-mono text-xl font-bold mb-3">03 // FINOPS E IA</div>
            <h3 className="text-xl font-bold text-[#E8F0EA] mb-2">FSM Engine &amp; Tokencost</h3>
            <p className="text-sm text-[#E8F0EA]/70 font-light leading-relaxed">
              Máquina de estados finitos (100 a 400) que bloqueia chamadas desnecessárias à API de LLM durante fases de formulário Tally ou atendimento humano.
            </p>
          </div>

        </div>
      </section>

      {/* Seção de Carregamento Dinâmico de Mapa (Diferido via Dynamic Import) */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#E8F0EA]">
          Localização &amp; Presença Geográfica (Google Maps Deferred)
        </h2>
        
        {googleMapsLoaded ? (
          <InteractiveMap />
        ) : (
          <div className="w-full h-80 bg-[#0E1B13] rounded-xl border border-[#28593B]/30 flex items-center justify-center p-6 text-center">
            <span className="font-mono text-xs text-[#D4AF37] uppercase tracking-widest">
              Aguardando término da renderização crítica da página para inicializar o Maps (Zero TBT)...
            </span>
          </div>
        )}
      </section>

      {/* Modal Dinâmico de Formulário Tally (Lazy Loading Ativado sob Demanda) */}
      {isFormOpen && (
        <Suspense fallback={null}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-3xl bg-[#0A140E] rounded-2xl border border-[#D4AF37]/50 p-6 shadow-2xl">
              <button
                onClick={() => setIsFormOpen(false)}
                className="absolute top-4 right-4 text-[#E8F0EA]/60 hover:text-[#E8F0EA] font-bold text-xl cursor-pointer"
              >
                ✕
              </button>
              
              <h3 className="text-xl font-bold text-[#D4AF37] mb-4 font-mono">
                FORMULÁRIO DE CAPTURA TALLY // ESTADO 300 FSM
              </h3>
              
              <TallyFormModal formId="wL3v5M" />
            </div>
          </div>
        </Suspense>
      )}

      <footer className="py-10 border-t border-[#28593B]/20 text-center text-xs font-mono text-[#E8F0EA]/40">
        DACTYLA CODE // ENGENHARIA DE SOFTWARE DE ALTA DISPONIBILIDADE 2026
      </footer>

    </div>
  );
}
