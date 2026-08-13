import React, { useEffect, useState, useRef } from 'react';

// Global singleton flag guaranteeing execution strictly ONCE per application lifecycle
let hasGlobalPreloaded = false;

export default function Preloader({ onComplete }) {
  const [stage, setStage] = useState(hasGlobalPreloaded ? 'complete' : 'drawing');
  const [cyanActive, setCyanActive] = useState(false);
  const hasRunRef = useRef(false);

  useEffect(() => {
    // Check flag to ensure strictly ONE single execution
    if (hasRunRef.current || hasGlobalPreloaded) {
      setStage('complete');
      return;
    }
    hasRunRef.current = true;
    hasGlobalPreloaded = true;

    // 0.8s: Form logo (Nodes connecting into long curved snout silhouette)
    const t1 = setTimeout(() => {
      setStage('logo');
    }, 800);

    // 1.5s: Cyan node flash on snout/head
    const t2 = setTimeout(() => {
      setCyanActive(true);
      setStage('cyanFlash');
    }, 1500);

    // 2.0s: Dissolve silhouette into golden organic background particles
    const t3 = setTimeout(() => {
      setStage('dissolve');
    }, 2000);

    // 2.5s: Complete & unlock screen
    const t4 = setTimeout(() => {
      setStage('complete');
      if (onComplete) onComplete();
    }, 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []); // Strictly empty dependency array [] as requested!

  if (stage === 'complete') return null;

  return (
    <div
      className={`fixed inset-0 z-[10000] bg-[#1A1A1A] flex flex-col items-center justify-center transition-opacity duration-700 select-none ${
        stage === 'dissolve' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* Tamanduá-mirim Geometric Long Curved Snout Silhouette SVG */}
        <svg
          viewBox="0 0 300 300"
          className="w-64 h-64 drop-shadow-[0_0_30px_rgba(212,175,55,0.45)]"
        >
          {/* Distinctive Long Curved Snout Path (Focinho Longo e Curvo do Tamanduá-mirim) */}
          <path
            d="M 50 160 C 70 110, 120 90, 170 100 C 220 110, 250 140, 260 180 L 220 200 C 190 160, 160 145, 120 155 C 90 165, 70 190, 50 160 Z"
            fill="rgba(212, 175, 55, 0.08)"
            stroke="#D4AF37"
            strokeWidth="2.5"
            strokeDasharray="600"
            strokeDashoffset={stage === 'drawing' ? '600' : '0'}
            className="transition-all duration-1000 ease-out"
          />

          {/* Symmetrical Head & Claw Node Facets */}
          <polygon
            points="170,100 230,70 260,110 220,140"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1.5"
            strokeDasharray="300"
            strokeDashoffset={stage === 'drawing' ? '300' : '0'}
            className="transition-all duration-1000 ease-out delay-200"
          />

          {/* Prominent Curved Snout Tip Line */}
          <path
            d="M 50 160 Q 30 175 20 190 Q 35 200 65 180"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="2"
            strokeDasharray="200"
            strokeDashoffset={stage === 'drawing' ? '200' : '0'}
            className="transition-all duration-1000 ease-out delay-300"
          />

          {/* Golden Nodes on Key Anatomical Vertices */}
          <circle cx="20" cy="190" r="4.5" fill="#D4AF37" />
          <circle cx="50" cy="160" r="4" fill="#D4AF37" />
          <circle cx="170" cy="100" r="4" fill="#D4AF37" />
          <circle cx="230" cy="70" r="4" fill="#D4AF37" />
          <circle cx="260" cy="110" r="4" fill="#D4AF37" />
          <circle cx="220" cy="200" r="4" fill="#D4AF37" />

          {/* Central Snout/Head Node - Flashes Electric Cyan */}
          <circle
            cx="20"
            cy="190"
            r={cyanActive ? '8' : '4.5'}
            fill={cyanActive ? '#00F0FF' : '#D4AF37'}
            className={`transition-all duration-300 ${
              cyanActive ? 'shadow-[0_0_25px_#00F0FF]' : ''
            }`}
          />
          {cyanActive && (
            <circle
              cx="20"
              cy="190"
              r="16"
              fill="none"
              stroke="#00F0FF"
              strokeWidth="2"
              className="animate-ping"
            />
          )}

          {/* Connection Vines radiating */}
          <line x1="20" y1="190" x2="50" y2="160" stroke="#D4AF37" strokeWidth="1" strokeDasharray="4" />
          <line x1="170" y1="100" x2="220" y2="200" stroke="#D4AF37" strokeWidth="1" strokeDasharray="4" />
        </svg>
      </div>

      {/* Brand Name Typography reveal */}
      <div className="mt-4 flex flex-col items-center space-y-2">
        <span className="font-display font-bold tracking-[0.3em] text-2xl text-[#F8F9FA]">
          DACTYLA <span className="text-[#D4AF37]">CODE</span>
        </span>
        <span className="font-mono-code text-xs text-[#D4AF37] tracking-[0.25em] uppercase animate-pulse">
          {cyanActive ? 'SYSTEM_NODE_ONLINE [OK]' : 'TAMANDUÁ-MIRIM // SILHUETA GEOMÉTRICA'}
        </span>
      </div>
    </div>
  );
}
