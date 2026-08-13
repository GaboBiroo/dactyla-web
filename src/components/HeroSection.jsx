import React, { useRef, Suspense, Component, useState } from 'react';
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
    transition: { duration: 1.2, delay, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

export default function HeroSection() {
  const [activeId, setActiveId] = useState(null);

  return (
    <section id="home" className="relative w-full bg-[#0A140E] text-[#E8F0EA] pt-24 pb-20 px-6 overflow-hidden">

      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#28593B]/8 rounded-full blur-[180px] pointer-events-none z-0" />

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
              custom={0.15}
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
              custom={0.3}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-8 text-base md:text-lg text-[#E8F0EA]/75 font-light max-w-xl leading-relaxed"
            >
              O motor invisível do litoral paulista. Plataformas corporativas de alta 
              disponibilidade, engenharia de precisão e infraestrutura que escala.
            </motion.p>

            <motion.div
              custom={0.45}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-10 flex items-center gap-6"
            >
              <a
                href="#pacotes"
                className="inline-block px-8 py-3.5 bg-[#D4AF37] text-[#0A140E] text-sm font-medium tracking-wide rounded-sm hover:bg-[#E8F0EA] transition-colors duration-500"
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

          {/* 3D Mascot */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, delay: 0.4 }}
            className="lg:col-span-5 h-[380px] md:h-[480px] relative rounded-sm overflow-hidden"
          >
            <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[10, 10, 5]} intensity={1.8} color="#E8F0EA" />
              <pointLight position={[-5, -5, 5]} intensity={2.5} color="#D4AF37" />
              <Suspense fallback={<RotatingFallback />}>
                <ModelErrorBoundary>
                  <ModelLoader />
                </ModelErrorBoundary>
              </Suspense>
              <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2} autoRotate autoRotateSpeed={0.8} />
            </Canvas>
          </motion.div>
        </div>

        {/* ─── CTA / COMMERCE LIST ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
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
                className="shrink-0 inline-block px-10 py-4 bg-[#D4AF37] text-[#0A140E] text-sm font-medium tracking-wide rounded-sm hover:bg-[#E8F0EA] transition-colors duration-500"
              >
                Garantir Posição
              </a>
            </div>
          )}
        </motion.div>

        {/* ─── MAP (CLEAN — NO TECH OVERLAYS) ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.15 }}
        >
          <MapComponent activeId={activeId} setActiveId={setActiveId} />
        </motion.div>

      </div>
    </section>
  );
}
