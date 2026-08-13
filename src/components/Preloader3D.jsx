import React, { useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import TamanduaModel from './TamanduaModel';
import Safe3DCanvas from './Safe3DCanvas';

let hasGlobal3DPreloaded = false;

export default function Preloader3D({ onComplete }) {
  const [stage, setStage] = useState(hasGlobal3DPreloaded ? 'complete' : 'forming');
  const [cyanActive, setCyanActive] = useState(false);
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current || hasGlobal3DPreloaded) {
      setStage('complete');
      return;
    }
    hasRunRef.current = true;
    hasGlobal3DPreloaded = true;

    // 1.0s: Rotate 3D Tamanduá model
    const t1 = setTimeout(() => setStage('logo'), 1000);

    // 1.8s: Cyan node flash on snout tip
    const t2 = setTimeout(() => {
      setCyanActive(true);
      setStage('cyanFlash');
    }, 1800);

    // 2.5s: Dissolve into 3D background
    const t3 = setTimeout(() => setStage('dissolve'), 2500);

    // 3.2s: Complete and reveal Home Page title
    const t4 = setTimeout(() => {
      setStage('complete');
      if (onComplete) onComplete();
    }, 3200);

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
      className={`fixed inset-0 z-[10000] bg-[#0A140E] flex flex-col items-center justify-center transition-opacity duration-1000 select-none ${
        stage === 'dissolve' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 3D WebGL Real Model Canvas Scene */}
      <div className="w-full h-[400px] min-h-[350px] relative flex items-center justify-center">
        <Safe3DCanvas>
          <Canvas
            camera={{ position: [0, 0, 6], fov: 50 }}
            style={{ width: '100%', height: '100%', minHeight: '350px' }}
          >
            <ambientLight intensity={0.5} />
            <spotLight position={[5, 10, 5]} intensity={4} color="#D4AF37" />
            <spotLight position={[-5, -5, -2]} intensity={3} color="#28593B" />
            <pointLight position={[0, 2, 3]} intensity={2} color="#00F0FF" />

            {/* Real GLTF 3D Tamanduá Model with PresentationControls */}
            <TamanduaModel />
          </Canvas>
        </Safe3DCanvas>

        {cyanActive && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#00F0FF] shadow-[0_0_35px_#00F0FF] animate-ping pointer-events-none" />
        )}
      </div>

      {/* Brand Typography */}
      <div className="mt-2 flex flex-col items-center space-y-2">
        <span className="font-display font-bold tracking-[0.3em] text-2xl text-[#F8F9FA]">
          DACTYLA <span className="text-[#D4AF37]">CODE</span>
        </span>
        <span className="font-mono-code text-xs text-[#28593B] tracking-[0.25em] uppercase font-bold animate-pulse">
          {cyanActive ? 'SYSTEM_NODE_ONLINE [OK]' : 'ESTRUTURA GLTF 3D // TAMANDUÁ-MIRIM'}
        </span>
      </div>
    </div>
  );
}
