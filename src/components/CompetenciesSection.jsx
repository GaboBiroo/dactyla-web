import React from 'react';
import { motion } from 'framer-motion';

export default function CompetenciesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: 'easeOut' },
    },
  };

  const gabrielCommits = [
    { hash: '8f3a91b', message: 'refactor: otimização de queries no PostgreSQL', time: 'há 2h' },
    { hash: '4e1c82d', message: 'feat: integração webhook n8n & pipeline IA', time: 'há 5h' },
    { hash: '9b0f74a', message: 'infra: containerização Docker multi-tenant', time: 'ontem' },
  ];

  const matheusVitals = [
    { metric: 'LCP (Largest Contentful Paint)', value: '0.4s', status: '99/100 SPEED' },
    { metric: 'CLS (Cumulative Layout Shift)', value: '0.00', status: 'PERFECT STABILITY' },
    { metric: 'Taxa de Retenção Visual', value: '+74%', status: 'HIGH ENGAGEMENT' },
  ];

  const gabrielStack = [
    'PHP / Laravel',
    'Python',
    'Next.js / React',
    'Engenharia de Dados',
    'Arquitetura Multi-tenant',
    'PostgreSQL / SQL',
  ];

  const matheusStack = [
    'Design Systems',
    'Framer Motion',
    'Interfaces Táteis',
    'Tailwind CSS',
    'GSAP Animation',
    'UX / UI Architecture',
  ];

  return (
    <section id="autoridade" className="bg-[#0A140E] text-[#E8F0EA] py-28 px-6 relative overflow-hidden border-t border-[#28593B]/20">
      {/* Background Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-[#28593B]/30">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
              <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#D4AF37]">
                [RADAR DE AUTORIDADE TÉCNICA & PROVA SOCIAL]
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#E8F0EA]">
              Engenharia & Liderança
            </h2>
          </div>
          <div className="mt-4 md:mt-0 text-right font-mono">
            <span className="text-xs text-[#D4AF37] block font-bold mb-1">
              // SISTEMA DE INTEGRAÇÃO... VARRENDO GITHUB & LINKEDIN
            </span>
            <span className="text-xs text-[#28593B]">
              SYSTEM_STATUS: ACTIVE (100% AUDITED)
            </span>
          </div>
        </div>

        {/* Profiles Grid with Staggered Framer Motion */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-10"
        >
          {/* Gabriel Hatakeyama (CTO) */}
          <motion.div
            variants={itemVariants}
            className="bg-[#112017]/70 border border-[#28593B]/30 rounded-2xl overflow-hidden shadow-2xl hover:border-[#D4AF37]/50 transition-colors duration-500 flex flex-col justify-between"
          >
            <div>
              {/* Terminal Header */}
              <div className="px-6 py-3 bg-[#0A140E] border-b border-[#28593B]/30 flex items-center justify-between font-mono text-xs text-[#E8F0EA]/60">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28593B]" />
                  <span>CORE_ENGINEER // CTO</span>
                </span>
                <span className="text-[#D4AF37]">[LATÊNCIA 0.2ms]</span>
              </div>

              {/* Founder Image */}
              <div className="overflow-hidden relative group">
                <img
                  src="/media_1786120579526.png"
                  alt="Gabriel Hatakeyama Rodrigues"
                  className="w-full h-80 object-cover object-center grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#112017] via-transparent to-transparent opacity-90" />
                <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] block">
                      DIRETOR DE TECNOLOGIA
                    </span>
                    <h3 className="text-2xl font-bold text-[#E8F0EA]">
                      Gabriel Hatakeyama Rodrigues
                    </h3>
                  </div>
                </div>
              </div>

              {/* Bio, Education & Leadership */}
              <div className="p-6 md:p-8 space-y-6">
                <div className="bg-[#0A140E]/80 border-l-2 border-[#D4AF37] p-4 rounded-r-lg">
                  <span className="text-[11px] font-mono text-[#D4AF37] uppercase tracking-wider block mb-1">
                    Formação & Liderança Técnica
                  </span>
                  <p className="text-xs md:text-sm text-[#E8F0EA]/90 font-light leading-relaxed">
                    Análise e Desenvolvimento de Sistemas pelo Centro Universitário Módulo. Atuação como Representante de Turma e membro ativo do Comitê Acadêmico.
                  </p>
                </div>

                <p className="text-sm text-[#E8F0EA]/80 leading-relaxed font-light">
                  Arquiteta o núcleo duro das aplicações. Responsável pela estabilidade de sistemas de missão crítica, conectando bancos de dados relacionais e APIs de alta disponibilidade.
                </p>

                {/* Sub-painel GitHub Simulation */}
                <div className="bg-[#0A140E] border border-[#28593B]/30 rounded-xl p-4 font-mono">
                  <div className="flex items-center justify-between text-[11px] text-[#D4AF37] mb-3 pb-2 border-b border-[#28593B]/20">
                    <span>// GITHUB LIVE COMMITS</span>
                    <span className="text-[#28593B]">BRANCH: MAIN</span>
                  </div>
                  <div className="space-y-2">
                    {gabrielCommits.map((c) => (
                      <div key={c.hash} className="flex items-center justify-between text-xs text-[#E8F0EA]/70">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="text-[#28593B] font-bold">[{c.hash}]</span>
                          <span className="truncate">{c.message}</span>
                        </div>
                        <span className="text-[10px] text-[#E8F0EA]/40 shrink-0">{c.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Stack Tags */}
            <div className="p-6 md:p-8 pt-0">
              <div className="pt-4 border-t border-[#28593B]/20">
                <span className="text-[10px] font-mono uppercase text-[#E8F0EA]/50 block mb-3">
                  STACK DE INFRAESTRUTURA CORE:
                </span>
                <div className="flex flex-wrap gap-2">
                  {gabrielStack.map((tech) => (
                    <span
                      key={tech}
                      className="bg-[#28593B]/20 border border-[#28593B]/40 text-[#E8F0EA] text-xs px-3 py-1 rounded-md font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Matheus Vicente (Director UX/UI) */}
          <motion.div
            variants={itemVariants}
            className="bg-[#112017]/70 border border-[#28593B]/30 rounded-2xl overflow-hidden shadow-2xl hover:border-[#D4AF37]/50 transition-colors duration-500 flex flex-col justify-between"
          >
            <div>
              {/* Terminal Header */}
              <div className="px-6 py-3 bg-[#0A140E] border-b border-[#28593B]/30 flex items-center justify-between font-mono text-xs text-[#E8F0EA]/60">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                  <span>CREATIVE_DIRECTOR // UX/UI</span>
                </span>
                <span className="text-[#D4AF37]">[FPS: 60.0]</span>
              </div>

              {/* Founder Image */}
              <div className="overflow-hidden relative group">
                <img
                  src="/media_1786120555908.png"
                  alt="Matheus Vicente"
                  className="w-full h-80 object-cover object-center grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#112017] via-transparent to-transparent opacity-90" />
                <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] block">
                      DIRETOR DE CRIAÇÃO & INTERACTIVITY
                    </span>
                    <h3 className="text-2xl font-bold text-[#E8F0EA]">
                      Matheus Vicente
                    </h3>
                  </div>
                </div>
              </div>

              {/* Bio & Philosophy */}
              <div className="p-6 md:p-8 space-y-6">
                <div className="bg-[#0A140E]/80 border-l-2 border-[#28593B] p-4 rounded-r-lg">
                  <span className="text-[11px] font-mono text-[#28593B] uppercase tracking-wider block mb-1">
                    Filosofia de Design & Impacto
                  </span>
                  <p className="text-xs md:text-sm text-[#E8F0EA]/90 font-light leading-relaxed">
                    A ponte indissociável entre a lógica do código puro e a psicologia do consumo do cliente final.
                  </p>
                </div>

                <p className="text-sm text-[#E8F0EA]/80 leading-relaxed font-light">
                  Especialista em Design Systems escaláveis, animações fluidas com Framer Motion e interfaces táteis que elevam a percepção de valor corporativa.
                </p>

                {/* Sub-painel Impact / Core Web Vitals Simulation */}
                <div className="bg-[#0A140E] border border-[#28593B]/30 rounded-xl p-4 font-mono">
                  <div className="flex items-center justify-between text-[11px] text-[#D4AF37] mb-3 pb-2 border-b border-[#28593B]/20">
                    <span>// MONITORAMENTO DE UX & PERFORMANCE</span>
                    <span className="text-[#28593B]">LIGHTHOUSE 100</span>
                  </div>
                  <div className="space-y-2">
                    {matheusVitals.map((v) => (
                      <div key={v.metric} className="flex items-center justify-between text-xs">
                        <span className="text-[#E8F0EA]/70">{v.metric}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#D4AF37] font-bold">{v.value}</span>
                          <span className="text-[9px] bg-[#28593B]/20 text-[#28593B] px-1.5 py-0.5 rounded">
                            {v.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Stack Tags */}
            <div className="p-6 md:p-8 pt-0">
              <div className="pt-4 border-t border-[#28593B]/20">
                <span className="text-[10px] font-mono uppercase text-[#E8F0EA]/50 block mb-3">
                  STACK DE INTERFACE & MOTION:
                </span>
                <div className="flex flex-wrap gap-2">
                  {matheusStack.map((tech) => (
                    <span
                      key={tech}
                      className="bg-[#28593B]/20 border border-[#28593B]/40 text-[#E8F0EA] text-xs px-3 py-1 rounded-md font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
