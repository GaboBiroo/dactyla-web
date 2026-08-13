import React from 'react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const headerFade = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const services = [
  {
    id: 'big-data',
    title: 'Mineração e Big Data',
    subtitle: 'O Caso RAIS / CAGED',
    description:
      'Algoritmos em Python para extração, limpeza e cruzamento de microdados massivos — governamentais ou privados — transformados em inteligência de mercado acessível. Décadas de registros industriais processados com precisão cirúrgica.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-8 h-8 text-[#D4AF37]">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    id: 'automation',
    title: 'Automação de Processos Críticos',
    subtitle: 'O Caso do Script Literário',
    description:
      'Scripts proprietários de alta precisão matemática para varredura e correção estrutural de grandes volumes de dados. Da revisão automatizada de obras editoriais com centenas de páginas à validação de bases inteiras em segundos.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-8 h-8 text-[#D4AF37]">
        <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
      </svg>
    ),
  },
  {
    id: 'integrations',
    title: 'Integrações via API',
    subtitle: 'O Caso n8n',
    description:
      'Conexão de sistemas legados, criação de fluxos autônomos e orquestração de dados entre plataformas que originalmente não se comunicam. Webhooks, pipelines de IA e automações que funcionam enquanto sua equipe dorme.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-8 h-8 text-[#D4AF37]">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4m0 14v4M4.22 4.22l2.83 2.83m9.9 9.9l2.83 2.83M1 12h4m14 0h4M4.22 19.78l2.83-2.83m9.9-9.9l2.83-2.83" />
      </svg>
    ),
  },
];

export default function BespokeEngineering() {
  return (
    <section id="engenharia" className="bg-[#0A140E] text-[#E8F0EA] py-32 px-6 relative overflow-hidden border-t border-[#E8F0EA]/5">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="max-w-3xl mb-24"
        >
          <motion.div variants={headerFade} className="flex items-center gap-4 mb-6">
            <span className="w-12 h-[1px] bg-[#D4AF37]" />
            <span className="text-xs uppercase tracking-[0.4em] text-[#D4AF37] font-light">
              Operações Especiais
            </span>
          </motion.div>

          <motion.h2
            variants={headerFade}
            className="text-4xl md:text-6xl font-serif font-light tracking-tight text-[#E8F0EA] leading-[1.1] mb-6"
          >
            Engenharia Sob Medida
            <br />
            <em className="text-[#D4AF37] not-italic">& Missão Crítica.</em>
          </motion.h2>

          <motion.p
            variants={headerFade}
            className="text-base md:text-lg text-[#E8F0EA]/60 font-light leading-relaxed"
          >
            Além de plataformas web, resolvemos problemas complexos de computação,
            dados e automação que exigem engenharia real — não templates.
          </motion.p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#E8F0EA]/5 rounded-sm overflow-hidden"
        >
          {services.map((service) => (
            <motion.div
              key={service.id}
              variants={fadeUp}
              className="bg-[#0A140E] p-10 md:p-12 flex flex-col justify-between group hover:bg-[#E8F0EA]/[0.02] transition-colors duration-700"
            >
              <div>
                {/* Icon */}
                <div className="mb-8 opacity-60 group-hover:opacity-100 transition-opacity duration-700">
                  {service.icon}
                </div>

                {/* Subtitle */}
                <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]/70 font-light mb-3 block">
                  {service.subtitle}
                </span>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-serif font-light tracking-tight text-[#E8F0EA] leading-snug mb-6">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-[#E8F0EA]/60 font-light leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Bottom accent line */}
              <div className="mt-10 pt-6 border-t border-[#E8F0EA]/5">
                <span className="text-xs text-[#E8F0EA]/25 font-light group-hover:text-[#D4AF37]/50 transition-colors duration-700">
                  Código proprietário — infraestrutura dedicada
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
