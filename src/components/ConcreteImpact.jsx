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

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const impactBlocks = [
  {
    id: 'retention',
    number: '70%',
    label: 'de abandono em sites lentos',
    title: 'Velocidade de Retenção',
    scenario:
      '70% dos usuários abandonam sites de comércio local que demoram mais de 3 segundos para carregar. No litoral paulista, onde a concorrência disputa o mesmo lead sazonal, essa latência é a diferença entre faturar e ser ignorado.',
    solution:
      'SSR (Server-Side Rendering) com Next.js, entregando a primeira pintura da tela em milissegundos. A infraestrutura da Dactyla elimina o tempo de espera e maximiza a retenção do lead desde o primeiro clique.',
    solutionLabel: 'Retenção máxima do lead.',
  },
  {
    id: 'blind-window',
    number: '40%',
    label: 'de oportunidades perdidas fora do horário',
    title: 'A Janela de Atendimento Cego',
    scenario:
      'Clínicas, corretoras e varejistas perdem 40% das oportunidades porque o lead envia mensagem no WhatsApp fora do horário comercial e esfria até o dia seguinte. O silêncio digital custa caro.',
    solution:
      'Integração n8n + OpenAI. Um agente inteligente que não dorme, qualifica o lead, compreende o contexto e realiza o pré-agendamento às 3h da manhã. Quando sua equipe chega, o cliente já está confirmado.',
    solutionLabel: 'Atendimento contínuo, 24 horas por dia.',
  },
  {
    id: 'vendor-lock',
    number: '100%',
    label: 'de propriedade sobre o seu código',
    title: 'Fuga do Vendor Lock-in',
    scenario:
      'Empresas reféns de mensalidades abusivas de plataformas prontas que limitam a expansão, engessam o layout e cobram por cada funcionalidade adicional. Você paga para alugar algo que nunca será seu.',
    solution:
      'Código proprietário. Infraestrutura sob medida hospedada em Cloud otimizada. Você não aluga sua presença digital — você é dono dela. Sem taxas ocultas, sem travas, sem dependência.',
    solutionLabel: 'Independência total da sua plataforma.',
  },
];

export default function ConcreteImpact() {
  return (
    <section id="impacto" className="bg-[#0A140E] text-[#E8F0EA] py-32 px-6 relative overflow-hidden border-t border-[#E8F0EA]/5">
      <div className="max-w-7xl mx-auto">

        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '50px' }}
          variants={stagger}
          className="mb-28 max-w-3xl transform-gpu will-change-transform"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-4 mb-6">
            <span className="w-12 h-[1px] bg-[#D4AF37]" />
            <span className="text-xs uppercase tracking-[0.4em] text-[#D4AF37] font-light">
              Relatório de Impacto
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="text-4xl md:text-6xl font-serif font-light tracking-tight text-[#E8F0EA] leading-[1.1] mb-6"
          >
            O custo de
            <em className="text-[#D4AF37] not-italic"> não agir.</em>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="text-base md:text-lg text-[#E8F0EA]/70 font-light leading-relaxed"
          >
            Dados reais do mercado paulista. Cada número abaixo representa receita que 
            o comércio local está deixando evaporar por falta de infraestrutura digital adequada.
          </motion.p>
        </motion.div>

        {/* Impact Blocks */}
        <div className="space-y-28">
          {impactBlocks.map((block) => (
            <motion.div
              key={block.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '50px' }}
              variants={stagger}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start transform-gpu will-change-transform"
            >
              {/* Left Column: The Number & Problem */}
              <motion.div
                variants={fadeUp}
                className="lg:col-span-5"
              >
                <span className="text-7xl md:text-9xl font-serif font-light text-[#D4AF37]/20 leading-none block mb-2">
                  {block.number}
                </span>
                <span className="text-sm text-[#E8F0EA]/50 font-light block mb-8">
                  {block.label}
                </span>

                <h3 className="text-2xl md:text-3xl font-serif font-light tracking-tight text-[#E8F0EA] mb-6">
                  {block.title}
                </h3>

                <p className="text-base text-[#E8F0EA]/70 font-light leading-relaxed">
                  {block.scenario}
                </p>
              </motion.div>

              {/* Right Column: The Solution */}
              <motion.div
                variants={fadeUp}
                className="lg:col-span-7 lg:pt-24"
              >
                <div className="border-l border-[#D4AF37]/30 pl-8 md:pl-12">
                  <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-light mb-4 block">
                    A Resposta da Dactyla
                  </span>

                  <p className="text-base md:text-lg text-[#E8F0EA]/85 font-light leading-relaxed mb-6">
                    {block.solution}
                  </p>

                  <span className="text-sm text-[#D4AF37]/70 font-light italic">
                    Resultado: {block.solutionLabel}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
