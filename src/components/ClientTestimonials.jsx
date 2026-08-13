import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    quote:
      'Antes da Dactyla, perdíamos quase metade dos agendamentos porque ninguém respondia o WhatsApp depois das 18h. Com o agente de IA integrado, nosso pré-agendamento passou a funcionar 24 horas. O faturamento de consultas particulares subiu 35% em quatro meses.',
    author: 'Dra. Renata Vasconcellos',
    role: 'Diretora Clínica — Clínica Atlântica',
    location: 'São Sebastião, SP',
  },
  {
    id: 2,
    quote:
      'Trabalhávamos com uma plataforma pronta que cobrava R$ 400 por mês e não nos deixava mudar sequer a cor de um botão. A Dactyla entregou um site proprietário com performance absurda e um dashboard que eu mesmo controlo. Pela primeira vez, eu sou dono da minha presença digital.',
    author: 'Carlos Eduardo Braga',
    role: 'CEO — Braga Incorporações',
    location: 'Caraguatatuba, SP',
  },
  {
    id: 3,
    quote:
      'O tempo de carregamento do nosso antigo site era de quase 6 segundos. O cliente do litoral é impaciente — ele compara três restaurantes no celular antes de decidir. Desde que migramos para a infraestrutura da Dactyla, a retenção na página triplicou e as reservas online dobraram.',
    author: 'Juliana Meirelles',
    role: 'Proprietária — Bistrô Mar Aberto',
    location: 'Ubatuba, SP',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export default function ClientTestimonials() {
  const [active, setActive] = useState(0);

  return (
    <section id="depoimentos" className="bg-[#0A140E] text-[#E8F0EA] py-32 px-6 relative overflow-hidden border-t border-[#E8F0EA]/5">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="mb-24 max-w-3xl"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-4 mb-6">
            <span className="w-12 h-[1px] bg-[#D4AF37]" />
            <span className="text-xs uppercase tracking-[0.4em] text-[#D4AF37] font-light">
              Prova Social
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="text-4xl md:text-6xl font-serif font-light tracking-tight text-[#E8F0EA] leading-[1.1]"
          >
            O que dizem os que
            <br />
            <em className="text-[#D4AF37] not-italic">já migraram.</em>
          </motion.h2>
        </motion.div>

        {/* Testimonial Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

          {/* Main Quote */}
          <div className="lg:col-span-8 min-h-[320px] relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonials[active].id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {/* Quote mark */}
                <span className="text-8xl md:text-9xl font-serif text-[#D4AF37]/15 leading-none block mb-4 select-none">
                  "
                </span>

                <blockquote className="text-xl md:text-2xl lg:text-3xl font-serif font-light leading-relaxed text-[#E8F0EA]/90 -mt-16 md:-mt-20 mb-10">
                  {testimonials[active].quote}
                </blockquote>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-[1px] bg-[#D4AF37]/40" />
                  <div>
                    <p className="text-base font-medium text-[#E8F0EA]">
                      {testimonials[active].author}
                    </p>
                    <p className="text-sm text-[#E8F0EA]/50 font-light">
                      {testimonials[active].role} — {testimonials[active].location}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Pills */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                onClick={() => setActive(i)}
                className={`text-left p-5 rounded-sm border transition-all duration-500 ${
                  active === i
                    ? 'border-[#D4AF37]/30 bg-[#E8F0EA]/[0.03]'
                    : 'border-[#E8F0EA]/5 bg-transparent hover:border-[#E8F0EA]/10'
                }`}
              >
                <p className={`text-sm font-medium transition-colors duration-500 ${
                  active === i ? 'text-[#D4AF37]' : 'text-[#E8F0EA]/70'
                }`}>
                  {t.author}
                </p>
                <p className="text-xs text-[#E8F0EA]/40 font-light mt-1">
                  {t.role}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
