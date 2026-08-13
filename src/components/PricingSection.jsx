import React from 'react';
import { motion } from 'framer-motion';

export default function PricingSection() {
  const tiers = [
    {
      id: 'tier-1',
      name: 'Presença Prime',
      badge: 'INFRAESTRUTURA BASE',
      price: 'R$ 1.350',
      mrr: '+ R$ 97/mês (manutenção & cloud)',
      tagline: 'Infraestrutura web de alta velocidade para autoridade imediata.',
      highlighted: false,
      features: [
        'Single Page Application (SPA) em Next.js',
        'Integração Google Maps API',
        'Score 90+ Lighthouse (Performance Extrema)',
        'Webhook Base de Captura',
        'Infraestrutura Cloud Gerenciada',
        'SEO Técnico Semântico',
      ],
    },
    {
      id: 'tier-2',
      name: 'Ecossistema IA',
      badge: 'MÁQUINA DE AUTOMAÇÃO',
      price: 'R$ 2.497',
      mrr: '+ R$ 147/mês (atendimento & agentes)',
      tagline: 'Plataforma inteligente integrada com automação e IA nativa.',
      highlighted: true,
      features: [
        'Agente de IA OpenAI',
        'Orquestração de Dados n8n',
        'Dashboard Proprietário',
        'Pipeline de Atendimento via WhatsApp',
        'Plataforma Multi-páginas em Next.js',
        'Nó no Mapa Interativo de Caraguá',
      ],
    },
    {
      id: 'tier-3',
      name: 'Dactyla Custom',
      badge: 'ENTERPRISE',
      price: 'Sob Consulta',
      mrr: 'contrato anual dedicado',
      tagline: 'Engenharia de software sob medida para ecossistemas complexos.',
      highlighted: false,
      features: [
        'Sistemas de Alta Disponibilidade',
        'Arquitetura Multi-tenant',
        'Agentes Autônomos de IA & Prospecção',
        'Renderização 3D Interativa (@react-three/fiber)',
        'Engenharia de Missão Crítica & Suporte VIP',
      ],
    },
  ];

  return (
    <section id="pacotes" className="bg-[#E8F0EA] text-[#0A140E] py-28 px-6 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#28593B] mb-4 block font-bold">
            ARQUITETURA DE LUXO // PRECIFICAÇÃO DE IMPACTO
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#0A140E]">
            Arquiteturas Modulares por Nível de Carga
          </h2>
          <p className="mt-4 text-[#0A140E]/80 text-base md:text-lg font-light leading-relaxed">
            Elimine a dependência de plataformas lentas. Investimento cirúrgico em código proprietário e infraestrutura escalável.
          </p>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 items-center">
          {tiers.map((tier, index) => {
            const isFeatured = tier.highlighted;
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                whileHover={{ y: isFeatured ? -8 : -5 }}
                className={`bg-[#0A140E] text-[#E8F0EA] rounded-2xl p-8 md:p-10 flex flex-col justify-between transition-all duration-500 relative ${
                  isFeatured
                    ? 'md:scale-105 border-2 border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.2),inset_0_0_30px_rgba(212,175,55,0.15)] z-20'
                    : 'border border-[#28593B]/30 hover:border-[#D4AF37]/50 shadow-xl z-10'
                }`}
              >
                {/* Highlight Badge */}
                {isFeatured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-[#0A140E] font-mono text-[10px] font-extrabold px-4 py-1 rounded-full uppercase tracking-widest shadow-md">
                    RECOMENDADO PARA ALTA PERFORMANCE
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#D4AF37]">
                      NÍVEL 0{index + 1}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-md font-bold ${
                        isFeatured
                          ? 'bg-[#28593B] text-[#E8F0EA]'
                          : 'bg-[#112017] text-[#D4AF37] border border-[#D4AF37]/30'
                      }`}
                    >
                      {tier.badge}
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold text-[#E8F0EA] mb-2">
                    {tier.name}
                  </h3>
                  <p className="text-[#E8F0EA]/70 text-xs md:text-sm mb-6 min-h-[40px] leading-relaxed">
                    {tier.tagline}
                  </p>

                  {/* Price Banner */}
                  <div className="mb-8 pb-6 border-b border-[#28593B]/30">
                    <span className="text-3xl md:text-4xl font-extrabold text-[#D4AF37]">
                      {tier.price}
                    </span>
                    <span className="text-xs font-mono text-[#E8F0EA]/60 block mt-1">
                      {tier.mrr}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-3.5 mb-8">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs md:text-sm text-[#E8F0EA]/85">
                        <span className="text-[#D4AF37] font-mono font-bold shrink-0 mt-0.5">
                          ✓
                        </span>
                        <span className="font-light">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Micro-interaction Button with Lux Hover Transition */}
                <div className="pt-4 border-t border-[#28593B]/20">
                  <motion.a
                    href="#contato"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`w-full inline-block text-center py-3.5 px-6 rounded-xl font-mono text-sm uppercase tracking-wider transition-all duration-300 font-bold ${
                      isFeatured
                        ? 'bg-[#D4AF37] text-[#0A140E] shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:bg-[#E8F0EA]'
                        : 'border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A140E] hover:shadow-[0_0_20px_#D4AF37]'
                    }`}
                  >
                    Solicitar Arquitetura
                  </motion.a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
