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

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1, ease: 'easeOut' },
  },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export default function FoundersDossier() {
  return (
    <section id="diretoria" className="bg-[#0A140E] text-[#E8F0EA] py-32 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Section Eyebrow */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '50px' }}
          variants={fadeUp}
          className="mb-24 transform-gpu will-change-transform"
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="w-12 h-[1px] bg-[#D4AF37]" />
            <span className="text-xs uppercase tracking-[0.4em] text-[#D4AF37] font-light">
              Diretoria Executiva
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-serif font-light tracking-tight text-[#E8F0EA] leading-[1.1] max-w-3xl">
            As mentes por trás da
            <br />
            <em className="text-[#D4AF37] not-italic">infraestrutura.</em>
          </h2>
        </motion.div>

        {/* ═══════════════════════════════════════════════════ */}
        {/* BLOCO 1: GABRIEL HATAKEYAMA — Foto Esquerda, Texto Direita */}
        {/* ═══════════════════════════════════════════════════ */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '50px' }}
          variants={stagger}
          className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-stretch mb-32 lg:mb-40 transform-gpu will-change-transform"
        >
          {/* Foto Editorial com Otimização Assíncrona e Aceleração GPU */}
          <motion.div variants={fadeIn} className="w-full lg:w-1/2">
            <div className="overflow-hidden rounded-sm bg-[#112017]">
              <img
                src="/media_1786120579526.png"
                alt="Gabriel Hatakeyama Rodrigues — CTO da Dactyla Code"
                loading="lazy"
                decoding="async"
                fetchPriority="high"
                width={600}
                height={800}
                className="w-full aspect-[3/4] object-cover object-center grayscale hover:grayscale-[30%] transition-all duration-[1500ms] ease-out scale-100 hover:scale-[1.03] transform-gpu will-change-transform"
              />
            </div>
          </motion.div>

          {/* Conteúdo Textual */}
          <motion.div
            variants={stagger}
            className="w-full lg:w-1/2 flex flex-col justify-center"
          >
            <motion.span
              variants={fadeUp}
              className="text-xs uppercase tracking-[0.35em] text-[#D4AF37] font-light mb-4 block"
            >
              Chief Technology Officer
            </motion.span>

            <motion.h3
              variants={fadeUp}
              className="text-3xl md:text-5xl font-serif font-light tracking-tight text-[#E8F0EA] leading-[1.15] mb-8"
            >
              Gabriel Hatakeyama
              <br />
              Rodrigues
            </motion.h3>

            <motion.div
              variants={fadeUp}
              className="w-16 h-[1px] bg-[#D4AF37]/40 mb-8"
            />

            <motion.div variants={stagger} className="space-y-6">
              <motion.p
                variants={fadeUp}
                className="text-base md:text-lg text-[#E8F0EA]/85 font-light leading-relaxed"
              >
                Formado em Análise e Desenvolvimento de Sistemas pelo Centro Universitário Módulo, 
                Gabriel construiu sua autoridade técnica dentro e fora da sala de aula. Como 
                Representante de Turma e membro ativo do Comitê Acadêmico, liderou a estruturação 
                estratégica de eventos de grande porte — incluindo o projeto Mochilão — demonstrando 
                desde cedo a capacidade de orquestrar pessoas e processos com a mesma precisão que 
                aplica ao código.
              </motion.p>

              <motion.p
                variants={fadeUp}
                className="text-base md:text-lg text-[#E8F0EA]/85 font-light leading-relaxed"
              >
                Na prática, sua experiência transcende o desenvolvimento web convencional. Atuando 
                como freelancer em projetos de escala governamental, Gabriel dominou a extração, 
                limpeza e isolamento de microdados massivos da RAIS e do CAGED, utilizando 
                Python e Pandas para mapear setores industriais específicos. Esse repertório em 
                Big Data e Engenharia de Dados é o que diferencia a Dactyla de qualquer agência 
                convencional do litoral.
              </motion.p>

              <motion.p
                variants={fadeUp}
                className="text-sm text-[#E8F0EA]/60 font-light leading-relaxed italic"
              >
                PHP/Laravel · Python · Next.js · PostgreSQL · Infraestrutura Cloud
              </motion.p>

              <motion.p
                variants={fadeUp}
                className="text-sm text-[#D4AF37]/80 font-light pt-2"
              >
                "Ele constrói as fundações invisíveis que nunca caem."
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════ */}
        {/* BLOCO 2: MATHEUS VICENTE — Texto Esquerda, Foto Direita */}
        {/* ═══════════════════════════════════════════════════ */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '50px' }}
          variants={stagger}
          className="flex flex-col lg:flex-row-reverse gap-12 lg:gap-24 items-stretch transform-gpu will-change-transform"
        >
          {/* Foto Editorial com Otimização Assíncrona e Aceleração GPU */}
          <motion.div variants={fadeIn} className="w-full lg:w-1/2">
            <div className="overflow-hidden rounded-sm bg-[#112017]">
              <img
                src="/media_1786120555908.png"
                alt="Matheus Vicente — Diretor Criativo da Dactyla Code"
                loading="lazy"
                decoding="async"
                width={600}
                height={800}
                className="w-full aspect-[3/4] object-cover object-center grayscale hover:grayscale-[30%] transition-all duration-[1500ms] ease-out scale-100 hover:scale-[1.03] transform-gpu will-change-transform"
              />
            </div>
          </motion.div>

          {/* Conteúdo Textual */}
          <motion.div
            variants={stagger}
            className="w-full lg:w-1/2 flex flex-col justify-center"
          >
            <motion.span
              variants={fadeUp}
              className="text-xs uppercase tracking-[0.35em] text-[#D4AF37] font-light mb-4 block"
            >
              Diretor Criativo & UX/UI
            </motion.span>

            <motion.h3
              variants={fadeUp}
              className="text-3xl md:text-5xl font-serif font-light tracking-tight text-[#E8F0EA] leading-[1.15] mb-8"
            >
              Matheus
              <br />
              Vicente
            </motion.h3>

            <motion.div
              variants={fadeUp}
              className="w-16 h-[1px] bg-[#D4AF37]/40 mb-8"
            />

            <motion.div variants={stagger} className="space-y-6">
              <motion.p
                variants={fadeUp}
                className="text-base md:text-lg text-[#E8F0EA]/85 font-light leading-relaxed"
              >
                Para Matheus, a estética não é decoração — é engenharia psicológica aplicada à 
                jornada do usuário. Cada pixel, cada curva de animação e cada micro-interação 
                existe com um único propósito: conduzir o visitante da curiosidade ao fechamento, 
                sem atrito e sem dúvida.
              </motion.p>

              <motion.p
                variants={fadeUp}
                className="text-base md:text-lg text-[#E8F0EA]/85 font-light leading-relaxed"
              >
                Sua experiência em Design Systems corporativos garante que cada interface construída 
                pela Dactyla não seja apenas bonita, mas escalável e consistente em qualquer 
                dispositivo. As micro-interações fluidas e a arquitetura visual que ele projeta 
                não apenas retêm a atenção — elas criam percepção de valor antes mesmo do 
                primeiro contato comercial.
              </motion.p>

              <motion.p
                variants={fadeUp}
                className="text-sm text-[#E8F0EA]/60 font-light leading-relaxed italic"
              >
                Design Systems · Framer Motion · GSAP · Interfaces Táteis · Arquitetura Visual
              </motion.p>

              <motion.p
                variants={fadeUp}
                className="text-sm text-[#D4AF37]/80 font-light pt-2"
              >
                "O design é a primeira impressão que seu cliente não sabe que está absorvendo."
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
