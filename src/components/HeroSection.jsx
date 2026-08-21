import React, { useRef, Suspense, Component, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Center } from '@react-three/drei';
import { motion } from 'framer-motion';
import MapComponent from './MapComponent';
import { comercios } from '../data/comercios';

// --- 3D MASCOT (TAMANDUÁ) ---
function ModelLoader() {
  const { scene } = useGLTF('/models/Tamandua.gltf');
  return (
    <Center>
      <primitive object={scene} scale={2.5} />
    </Center>
  );
}

// Fallback inside WebGL Canvas
function RotatingFallback() {
  const meshRef = useRef(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.4;
      meshRef.current.rotation.y += delta * 0.6;
    }
  });
  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[1.5, 0]} />
      <meshStandardMaterial color="#D4AF37" wireframe />
    </mesh>
  );
}

// Ultra-lightweight standalone GPU wireframe for Mobile (Zero WebGL CPU/GPU overhead)
function StandaloneRotatingGeometry() {
  return (
    <div className="w-full h-full flex items-center justify-center relative transform-gpu will-change-transform pointer-events-none">
      <div className="relative w-44 h-44 md:w-56 md:h-56 flex items-center justify-center animate-[spin_16s_linear_infinite]">
        <svg viewBox="0 0 200 200" className="w-full h-full text-[#D4AF37] opacity-80 drop-shadow-[0_0_20px_rgba(212,175,55,0.35)]">
          <polygon points="100,20 175,70 175,140 100,180 25,140 25,70" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" />
          <line x1="100" y1="20" x2="100" y2="180" stroke="currentColor" strokeWidth="1.5" />
          <line x1="25" y1="70" x2="175" y2="70" stroke="currentColor" strokeWidth="1" opacity="0.6" />
          <line x1="25" y1="140" x2="175" y2="140" stroke="currentColor" strokeWidth="1" opacity="0.6" />
          <line x1="100" y1="20" x2="175" y2="140" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <line x1="100" y1="20" x2="25" y2="140" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <circle cx="100" cy="100" r="5" fill="#D4AF37" />
        </svg>
      </div>
      <div className="absolute inset-0 bg-radial from-[#D4AF37]/10 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return <RotatingFallback />;
    return this.props.children;
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

export default function HeroSection() {
  const [activeId, setActiveId] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop, { passive: true });
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  return (
    <section id="home" className="relative w-full bg-[#0A140E] text-[#E8F0EA] pt-24 pb-20 px-6 overflow-hidden">

      {/* Ambient glow with GPU compositing */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#28593B]/8 rounded-full blur-[180px] pointer-events-none z-0 transform-gpu will-change-transform" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-20">

        {/* ─── TOP: HERO COPY + 3D MASCOT ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Copy */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="flex items-center gap-4 mb-8"
            >
              <span className="w-12 h-[1px] bg-[#D4AF37]" />
              <span className="text-xs uppercase tracking-[0.4em] text-[#D4AF37] font-light">
                Engenharia de Software — Litoral Paulista
              </span>
            </motion.div>

            <motion.h1
              custom={0.1}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="text-4xl md:text-6xl lg:text-7xl font-serif font-light tracking-tight text-[#E8F0EA] leading-[1.08]"
            >
              Arquitetura Digital
              <br />
              <em className="text-[#D4AF37] not-italic">de Elite.</em>
            </motion.h1>

            <motion.p
              custom={0.2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-8 text-base md:text-lg text-[#E8F0EA]/75 font-light max-w-xl leading-relaxed"
            >
              O motor invisível do litoral paulista. Plataformas corporativas de alta 
              disponibilidade, engenharia de precisão e infraestrutura que escala.
            </motion.p>

            <motion.div
              custom={0.3}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-10 flex items-center gap-6"
            >
              <a
                href="#pacotes"
                className="inline-block px-8 py-3.5 bg-[#D4AF37] text-[#0A140E] text-sm font-medium tracking-wide rounded-sm hover:bg-[#E8F0EA] transition-colors duration-500 transform-gpu"
              >
                Ver Pacotes
              </a>
              <a
                href="#diretoria"
                className="text-sm text-[#E8F0EA]/60 hover:text-[#D4AF37] transition-colors duration-300 font-light"
              >
                Conheça a equipe →
              </a>
            </motion.div>
          </div>

          {/* 3D Mascot / Lightweight Mobile Fallback Container with Scroll Trap Prevention */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-5 h-[340px] md:h-[480px] relative rounded-sm overflow-hidden pointer-events-none md:pointer-events-auto transform-gpu will-change-transform"
          >
            {isDesktop ? (
              <Suspense fallback={<StandaloneRotatingGeometry />}>
                <Canvas
                  camera={{ position: [0, 0, 7], fov: 45 }}
                  dpr={[1, 1.5]}
                  gl={{ antialias: false, powerPreference: 'high-performance' }}
                >
                  <ambientLight intensity={0.7} />
                  <directionalLight position={[10, 10, 5]} intensity={1.8} color="#E8F0EA" />
                  <pointLight position={[-5, -5, 5]} intensity={2.5} color="#D4AF37" />
                  <ModelErrorBoundary>
                    <ModelLoader />
                  </ModelErrorBoundary>
                  <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2} autoRotate autoRotateSpeed={0.8} />
                </Canvas>
              </Suspense>
            ) : (
              <StandaloneRotatingGeometry />
            )}
          </motion.div>
        </div>

        {/* ─── CTA / COMMERCE LIST ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '50px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="transform-gpu will-change-transform"
        >
          {comercios.length > 0 ? (
            <div className="border border-[#E8F0EA]/5 rounded-sm p-8 md:p-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-[#E8F0EA]/5 gap-4">
                <div>
                  <h3 className="text-lg font-serif font-light text-[#E8F0EA] mb-1">
                    Rede de Parceiros — Caraguatatuba
                  </h3>
                  <p className="text-sm text-[#E8F0EA]/50 font-light">
                    Selecione um comércio para localizar no mapa
                  </p>
                </div>
                {activeId && (
                  <button
                    onClick={() => setActiveId(null)}
                    className="text-xs text-[#D4AF37] hover:text-[#E8F0EA] transition-colors font-light self-start md:self-auto"
                  >
                    Resetar visão geral
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comercios.map((comercio) => {
                  const isSelected = activeId === comercio.id;
                  return (
                    <div
                      key={comercio.id}
                      onClick={() => setActiveId(comercio.id)}
                      className={`p-5 rounded-sm cursor-pointer transition-all duration-500 border ${
                        isSelected
                          ? 'bg-[#E8F0EA]/5 border-[#D4AF37]/40'
                          : 'bg-transparent border-[#E8F0EA]/5 hover:border-[#E8F0EA]/15'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-[#E8F0EA]">{comercio.nome}</h4>
                        <span className="text-xs text-[#D4AF37]/70">{comercio.nicho}</span>
                      </div>
                      <span className="text-xs text-[#E8F0EA]/40 font-light">{comercio.status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="border border-[#E8F0EA]/5 rounded-sm p-10 md:p-14 flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="max-w-2xl text-center lg:text-left">
                <span className="text-xs uppercase tracking-[0.35em] text-[#D4AF37] font-light mb-4 block">
                  Primeiro Parceiro
                </span>
                <h3 className="text-2xl md:text-4xl font-serif font-light text-[#E8F0EA] leading-tight mb-4">
                  Sua empresa pode ser a primeira no mapa.
                </h3>
                <p className="text-base text-[#E8F0EA]/60 font-light leading-relaxed">
                  Posição exclusiva de destaque no mapa interativo de Caraguatatuba, 
                  com atendimento automatizado por IA e infraestrutura dedicada.
                </p>
              </div>
              <a
                href="#pacotes"
                className="shrink-0 inline-block px-10 py-4 bg-[#D4AF37] text-[#0A140E] text-sm font-medium tracking-wide rounded-sm hover:bg-[#E8F0EA] transition-colors duration-500 transform-gpu"
              >
                Garantir Posição
              </a>
            </div>
          )}
        </motion.div>

        {/* ─── MAP CONTAINER WITH SCROLL TRAP PREVENTION & GPU ACCELERATION ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '50px' }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="pointer-events-none md:pointer-events-auto transform-gpu will-change-transform"
        >
          <MapComponent activeId={activeId} setActiveId={setActiveId} />
        </motion.div>

      </div>
    </section>
  );
}
