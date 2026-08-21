import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCalApi } from '@calcom/embed-react';

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

export default function EliteFooter({ onOpenPrivacy }) {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      cal("ui", {
        styles: { branding: { brandColor: "#0A140E" } },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

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
            {/* Primary CTA: Auditoria Técnica (Tally) */}
            <motion.a
              variants={fadeUp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="https://tally.so/r/2Edppj"
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

            {/* Secondary CTA: Reunião Executiva (Cal.com Embed Modal) */}
            <motion.button
              variants={fadeUp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              data-cal-namespace=""
              data-cal-link="dactyla/diagnostico"
              data-cal-config='{"layout":"month_view"}'
              className="group flex items-center justify-between p-6 border border-[#28593B]/40 rounded-sm bg-[#0E1B13] hover:border-[#D4AF37]/50 transition-all duration-500 cursor-pointer"
            >
              <div>
                <span className="text-lg font-medium text-[#E8F0EA] transition-colors duration-500">
                  Agendar Reunião Executiva
                </span>
                <span className="block text-sm text-[#E8F0EA]/40 transition-colors duration-500 mt-1 font-light">
                  30 minutos diretamente com a engenharia principal
                </span>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-[#E8F0EA]/50 group-hover:text-[#D4AF37] transition-colors duration-500 shrink-0 ml-4">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </motion.button>
          </motion.div>

        </div>
      </motion.div>

      {/* ─── FOOTER BOTTOM BAR ─── */}
      <div className="border-t border-[#E8F0EA]/5 py-12 px-6 bg-[#070E0A]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">

          {/* Brand */}
          <div>
            <span className="text-base font-serif font-light text-[#E8F0EA]/70">
              Dactyla Code
            </span>
            <p className="text-xs text-[#E8F0EA]/30 font-light mt-2 leading-relaxed">
              Engenharia de Software
              <br />
              &amp; Ecossistemas Digitais
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

          {/* Social Links & Legal */}
          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="flex items-center gap-6">
              <a
                href="/privacidade"
                onClick={(e) => {
                  if (onOpenPrivacy) {
                    e.preventDefault();
                    onOpenPrivacy();
                  }
                }}
                className="text-xs text-[#E8F0EA]/60 hover:text-[#D4AF37] transition-colors duration-300 font-light underline cursor-pointer"
              >
                Política de Privacidade
              </a>
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
