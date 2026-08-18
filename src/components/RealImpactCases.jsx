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

const headerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const cases = [
  {
    id: 'big-data',
    index: '01',
    sector: 'Engenharia de Dados',
    title: 'Processamento de Décadas de Dados Governamentais',
    client: 'Rafael — Pesquisa & Inteligência de Dados',
    context:
      'O projeto exigia o tratamento de bases massivas de microdados da RAIS e do CAGED — décadas de registros industriais acumulados em planilhas complexas e formatos heterogêneos que nenhuma ferramenta convencional conseguia processar de forma confiável.',
    impact:
      'Gabriel arquitetou um pipeline de extração, limpeza e estruturação de dados em Python e Pandas, transformando o que seria meses de trabalho braçal em inteligência acessível e instantânea. O resultado foi a conversão de informação bruta governamental em análises setoriais prontas para tomada de decisão.',
    highlight: 'Processamento de Décadas de Dados',
  },
  {
    id: 'almeida',
    index: '02',
    sector: 'Posicionamento Corporativo',
    title: 'Autoridade Digital para Advocacia de Alto Padrão',
    client: 'Almeida Advocacia — Direito Empresarial',
    context:
      'O escritório precisava de uma presença digital que refletisse o mesmo nível de sofisticação e credibilidade que entrega pessoalmente aos seus clientes. O site anterior era genérico, lento e invisível nos mecanismos de busca.',
    impact:
      'A Dactyla construiu uma infraestrutura digital focada em credibilidade e conversão: tipografia editorial, velocidade de carregamento inferior a dois segundos e arquitetura de conteúdo otimizada para SEO técnico. O escritório se consolidou como autoridade indiscutível em sua região de atuação.',
    highlight: 'Autoridade Regional Consolidada',
  },
  {
    id: 'editorial',
    index: '03',
    sector: 'Automação de Precisão',
    title: 'Revisão Automatizada de Obra Literária',
    client: 'Projeto Editorial — 160 Páginas',
    context:
      'Uma obra literária de 160 páginas precisava de revisão estrutural completa — ortografia, concordância, formatação e consistência estilística. O prazo era curto e a revisão manual, inviável para o nível de precisão exigido.',
    impact:
      'Em vez do caminho tradicional, Gabriel desenvolveu um script proprietário de automação que varreu a obra inteira com precisão matemática, identificando e corrigindo inconsistências que escapariam ao olho humano. A qualidade do trabalho garantiu seu nome nos créditos oficiais do livro publicado.',
    highlight: 'Precisão Automatizada e Crédito Editorial',
  },
];

export default function RealImpactCases() {
  return (
    <section id="casos" className="bg-[#0A140E] text-[#E8F0EA] py-32 px-6 relative overflow-hidden border-t border-[#E8F0EA]/5">
      <div className="max-w-7xl mx-auto">

        {/* ─── HEADER: Left-aligned editorial intro ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 mb-28">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '50px' }}
            variants={stagger}
            className="lg:col-span-5 transform-gpu will-change-transform"
          >
            <motion.div variants={headerVariants} className="flex items-center gap-4 mb-6">
              <span className="w-12 h-[1px] bg-[#D4AF37]" />
              <span className="text-xs uppercase tracking-[0.4em] text-[#D4AF37] font-light">
                Estudos de Caso
              </span>
            </motion.div>

            <motion.h2
              variants={headerVariants}
              className="text-4xl md:text-6xl font-serif font-light tracking-tight text-[#E8F0EA] leading-[1.1] mb-6"
            >
              O impacto da nossa
              <br />
              <em className="text-[#D4AF37] not-italic">engenharia.</em>
            </motion.h2>

            <motion.p
              variants={headerVariants}
              className="text-base text-[#E8F0EA]/60 font-light leading-relaxed"
            >
              Não trabalhamos com depoimentos fictícios. Cada caso abaixo
              representa um problema real, resolvido com código proprietário
              e engenharia de precisão.
            </motion.p>
          </motion.div>
        </div>

        {/* ─── CASES: Staggered cascade on scroll ─── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '50px' }}
          variants={stagger}
          className="space-y-0 transform-gpu will-change-transform"
        >
          {cases.map((c) => (
            <motion.article
              key={c.id}
              variants={fadeUp}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 py-16 first:pt-0 border-b border-[#E8F0EA]/5 last:border-b-0 transform-gpu"
            >
              {/* Left: Index + Sector + Title */}
              <div className="lg:col-span-4 flex flex-col justify-start">
                <span className="text-6xl md:text-7xl font-serif font-light text-[#D4AF37]/15 leading-none mb-6">
                  {c.index}
                </span>

                <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-light mb-3 block">
                  {c.sector}
                </span>

                <h3 className="text-2xl md:text-3xl font-serif font-light tracking-tight text-[#E8F0EA] leading-snug mb-4">
                  {c.title}
                </h3>

                <span className="text-sm text-[#E8F0EA]/40 font-light">
                  {c.client}
                </span>
              </div>

              {/* Right: Context + Impact */}
              <div className="lg:col-span-8 flex flex-col justify-center space-y-8">
                <div>
                  <span className="text-xs uppercase tracking-[0.25em] text-[#E8F0EA]/35 font-light mb-3 block">
                    O Contexto
                  </span>
                  <p className="text-base md:text-lg text-[#E8F0EA]/75 font-light leading-relaxed">
                    {c.context}
                  </p>
                </div>

                <div className="border-l border-[#D4AF37]/30 pl-8">
                  <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-light mb-3 block">
                    O Impacto
                  </span>
                  <p className="text-base md:text-lg text-[#E8F0EA]/85 font-light leading-relaxed mb-4">
                    {c.impact}
                  </p>
                  <span className="text-sm text-[#D4AF37]/70 font-light italic">
                    Resultado: {c.highlight}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
