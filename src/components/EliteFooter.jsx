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
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

export default function EliteFooter() {
  return (
    <footer id="contato" className="bg-[#0A140E] text-[#E8F0EA] relative overflow-hidden">

      {/* ─── CTA SECTION ─── */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={stagger}
        className="border-t border-[#E8F0EA]/5 py-32 px-6"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

          {/* Left: CTA Copy */}
          <motion.div variants={fadeUp} className="lg:col-span-6 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-[1px] bg-[#D4AF37]" />
              <span className="text-xs uppercase tracking-[0.4em] text-[#D4AF37] font-light">
                Próximo Passo
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-light tracking-tight text-[#E8F0EA] leading-[1.1] mb-6">
              O próximo nível da sua infraestrutura começa com um
              <em className="text-[#D4AF37] not-italic"> diagnóstico preciso.</em>
            </h2>

            <p className="text-base text-[#E8F0EA]/55 font-light leading-relaxed max-w-lg">
              Não vendemos horas — vendemos arquitetura. O primeiro passo é uma
              auditoria técnica gratuita do seu ecossistema digital atual.
            </p>
          </motion.div>

          {/* Right: Action Buttons */}
          <motion.div
            variants={stagger}
            className="lg:col-span-6 flex flex-col justify-center space-y-5"
          >
            {/* Primary CTA */}
            <motion.a
              variants={fadeUp}
              href="https://tally.so"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-6 border border-[#D4AF37]/30 rounded-sm bg-transparent hover:bg-[#D4AF37] transition-all duration-500"
            >
              <div>
                <span className="text-lg font-medium text-[#E8F0EA] group-hover:text-[#0A140E] transition-colors duration-500">
                  Aplicar para Auditoria Técnica
                </span>
                <span className="block text-sm text-[#E8F0EA]/40 group-hover:text-[#0A140E]/60 transition-colors duration-500 mt-1 font-light">
                  Diagnóstico gratuito da sua infraestrutura atual
                </span>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-[#D4AF37] group-hover:text-[#0A140E] transition-colors duration-500 shrink-0 ml-4">
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </motion.a>

            {/* Secondary CTA */}
            <motion.a
              variants={fadeUp}
              href="https://calendly.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-6 border border-[#E8F0EA]/10 rounded-sm hover:border-[#E8F0EA]/25 transition-all duration-500"
            >
              <div className="flex items-center gap-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-[#E8F0EA]/40 group-hover:text-[#D4AF37] transition-colors duration-500 shrink-0">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                <div>
                  <span className="text-base font-medium text-[#E8F0EA]/80 group-hover:text-[#E8F0EA] transition-colors duration-500">
                    Agendar Reunião Executiva
                  </span>
                  <span className="block text-sm text-[#E8F0EA]/30 font-light mt-0.5">
                    30 minutos — apresentação da arquitetura proposta
                  </span>
                </div>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-[#E8F0EA]/20 group-hover:text-[#D4AF37] transition-colors duration-500 shrink-0 ml-4">
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </motion.a>

            {/* Tertiary: WhatsApp (discreet) */}
            <motion.a
              variants={fadeUp}
              href="https://wa.me/5512900000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-4 group"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#E8F0EA]/25 group-hover:text-[#D4AF37] transition-colors duration-500 shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="text-sm text-[#E8F0EA]/35 group-hover:text-[#D4AF37] transition-colors duration-500 font-light">
                Contato rápido via WhatsApp
              </span>
            </motion.a>
          </motion.div>

        </div>
      </motion.div>

      {/* ─── INSTITUTIONAL FOOTER ─── */}
      <div className="border-t border-[#E8F0EA]/5 py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

          {/* Brand */}
          <div>
            <span className="text-base font-serif font-light text-[#E8F0EA]/70">
              Dactyla Code
            </span>
            <p className="text-xs text-[#E8F0EA]/30 font-light mt-2 leading-relaxed">
              Engenharia de Software
              <br />
              & Ecossistemas Digitais
            </p>
          </div>

          {/* Contact Details */}
          <div className="space-y-2">
            <a
              href="mailto:hello@dactylacode.com"
              className="text-sm text-[#E8F0EA]/40 hover:text-[#D4AF37] transition-colors duration-300 font-light block"
            >
              hello@dactylacode.com
            </a>
            <p className="text-xs text-[#E8F0EA]/25 font-light leading-relaxed">
              Sede em Caraguatatuba, SP.
              <br />
              Operação global.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="flex items-center gap-6">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#E8F0EA]/30 hover:text-[#D4AF37] transition-colors duration-300 font-light"
              >
                LinkedIn
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#E8F0EA]/30 hover:text-[#D4AF37] transition-colors duration-300 font-light"
              >
                GitHub
              </a>
            </div>
            <p className="text-[11px] text-[#E8F0EA]/20 font-light mt-2">
              © 2026 Dactyla Code. Todos os direitos reservados.
            </p>
          </div>

        </div>
      </div>

    </footer>
  );
}
