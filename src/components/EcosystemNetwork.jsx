import React from 'react';
import { motion } from 'framer-motion';

export default function EcosystemNetwork() {
  const sectors = [
    { name: 'Clínicas Médicas & Saúde', node: 'NODE_01 // MED' },
    { name: 'Imobiliárias & Construtoras', node: 'NODE_02 // RE' },
    { name: 'Gastronomia & Horeca Premium', node: 'NODE_03 // GASTRO' },
    { name: 'Hubs de Tecnologia & Inovação', node: 'NODE_04 // TECH' },
    { name: 'Logística & Infraestrutura Marítima', node: 'NODE_05 // LOG' },
    { name: 'Serviços Financeiros & Corporate', node: 'NODE_06 // FIN' },
  ];

  return (
    <section id="rede" className="bg-[#0A140E] text-[#E8F0EA] py-24 px-6 relative overflow-hidden border-t border-[#28593B]/20">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-[#28593B]/10 rounded-full blur-[160px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mb-16"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#D4AF37]">
              [REDE DE INTERCONEXÃO DE MERCADO]
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#E8F0EA] leading-tight">
            Ecossistemas Interligados
          </h2>
          <p className="mt-4 text-base md:text-lg text-[#E8F0EA]/80 font-light leading-relaxed border-l-2 border-[#28593B] pl-6">
            A Dactyla não cria apenas softwares, cria ecossistemas interligados. Nossos nós de rede trocam valor e inteligência em tempo real.
          </p>
        </motion.div>

        {/* Sectors Grid / Marquee Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectors.map((sector, index) => (
            <motion.div
              key={sector.node}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-[#112017]/60 border border-[#28593B]/30 hover:border-[#D4AF37]/60 rounded-xl p-6 backdrop-blur-xl transition-all duration-300 shadow-lg flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded-md border border-[#D4AF37]/20">
                    {sector.node}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#28593B] group-hover:bg-[#D4AF37] transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-[#E8F0EA] group-hover:text-[#D4AF37] transition-colors">
                  {sector.name}
                </h3>
              </div>

              <div className="mt-6 pt-4 border-t border-[#28593B]/20 flex justify-between items-center text-xs font-mono text-[#E8F0EA]/50">
                <span>STATUS: CONECTADO</span>
                <span className="text-[#28593B] font-bold group-hover:text-[#D4AF37] transition-colors">
                  SYNC OK →
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
