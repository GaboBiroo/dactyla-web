'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function EliteFooter() {
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      cal("ui", {
        theme: "dark",
        styles: { branding: { brandColor: "#D4AF37" } },
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
              data-cal-link="agenciadactylacode-ddyia5/30min"
              data-cal-config='{"layout":"month_view"}'
              className="w-full text-left group flex items-center justify-between p-6 border border-[#E8F0EA]/10 rounded-sm hover:border-[#E8F0EA]/25 transition-all duration-500 cursor-pointer"
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
            </motion.button>

            {/* Tertiary CTA: WhatsApp (Direct Meta API link) */}
            <motion.a
              variants={fadeUp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="https://wa.me/5512991879486?text=Ol%C3%A1%2C%20acabo%20de%20visitar%20o%20site%20da%20Dactyla%20Code%20e%20gostaria%20de%20solicitar%20uma%20an%C3%A1lise%20t%C3%A9cnica%20do%20meu%20ecossistema%20digital"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-4 group cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#E8F0EA]/25 group-hover:text-[#D4AF37] transition-colors duration-500 shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="text-sm text-[#E8F0EA]/35 group-hover:text-[#D4AF37] transition-colors duration-500 font-light">
                Contato rápido via WhatsApp: (12) 99187-9486
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
              href="mailto:agenciadactylacode@gmail.com"
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

          {/* Social Links (Interactive Executive Modals) */}
          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="flex items-center gap-6">

              {/* LinkedIn Interactive Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setOpenDropdown('linkedin')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'linkedin' ? null : 'linkedin')}
                  className="flex items-center gap-1.5 text-xs text-[#E8F0EA]/40 hover:text-[#D4AF37] transition-colors duration-300 font-light cursor-pointer group py-1"
                >
                  <svg className="w-4 h-4 fill-current opacity-60 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6 1.6 1.6 0 0 0 1.6-1.6 1.6 1.6 0 0 0-1.6-1.6Z" />
                  </svg>
                  <span>LinkedIn</span>
                </button>

                <AnimatePresence>
                  {openDropdown === 'linkedin' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.96 }}
                      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                      className="absolute bottom-full mb-3 left-0 md:left-auto md:right-0 bg-[#0A140E] border border-[#D4AF37]/30 rounded-md shadow-2xl p-3 z-30 min-w-[240px] backdrop-blur-xl"
                    >
                      <div className="space-y-1">
                        <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-[#D4AF37]/70 border-b border-[#E8F0EA]/5 mb-1.5 pb-1">
                          Diretoria Executiva
                        </div>
                        <a
                          href="https://www.linkedin.com/in/gabriel-hatakeyama-rodrigues-343513274/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between px-2.5 py-2 rounded-sm text-xs text-[#E8F0EA]/70 hover:text-[#D4AF37] hover:bg-[#E8F0EA]/5 transition-all duration-300 group/link"
                        >
                          <div className="flex flex-col text-left">
                            <span className="font-medium text-[#E8F0EA] group-hover/link:text-[#D4AF37] transition-colors">
                              Gabriel Hatakeyama
                            </span>
                            <span className="text-[10px] text-[#E8F0EA]/40 font-light">
                              Chief Technology Officer
                            </span>
                          </div>
                          <span className="text-xs text-[#E8F0EA]/30 group-hover/link:text-[#D4AF37] group-hover/link:translate-x-0.5 transition-all">
                            ↗
                          </span>
                        </a>
                        <a
                          href="https://www.linkedin.com/in/matheus-vicente-dos-santos-pinto/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between px-2.5 py-2 rounded-sm text-xs text-[#E8F0EA]/70 hover:text-[#D4AF37] hover:bg-[#E8F0EA]/5 transition-all duration-300 group/link"
                        >
                          <div className="flex flex-col text-left">
                            <span className="font-medium text-[#E8F0EA] group-hover/link:text-[#D4AF37] transition-colors">
                              Matheus Vicente
                            </span>
                            <span className="text-[10px] text-[#E8F0EA]/40 font-light">
                              Diretor Criativo & UX/UI
                            </span>
                          </div>
                          <span className="text-xs text-[#E8F0EA]/30 group-hover/link:text-[#D4AF37] group-hover/link:translate-x-0.5 transition-all">
                            ↗
                          </span>
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* GitHub Interactive Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setOpenDropdown('github')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'github' ? null : 'github')}
                  className="flex items-center gap-1.5 text-xs text-[#E8F0EA]/40 hover:text-[#D4AF37] transition-colors duration-300 font-light cursor-pointer group py-1"
                >
                  <svg className="w-4 h-4 fill-current opacity-60 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2Z" />
                  </svg>
                  <span>GitHub</span>
                </button>

                <AnimatePresence>
                  {openDropdown === 'github' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.96 }}
                      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                      className="absolute bottom-full mb-3 left-0 md:left-auto md:right-0 bg-[#0A140E] border border-[#D4AF37]/30 rounded-md shadow-2xl p-3 z-30 min-w-[240px] backdrop-blur-xl"
                    >
                      <div className="space-y-1">
                        <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-[#D4AF37]/70 border-b border-[#E8F0EA]/5 mb-1.5 pb-1">
                          Repositórios & Engenharia
                        </div>
                        <a
                          href="https://github.com/GaboBiroo"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between px-2.5 py-2 rounded-sm text-xs text-[#E8F0EA]/70 hover:text-[#D4AF37] hover:bg-[#E8F0EA]/5 transition-all duration-300 group/link"
                        >
                          <div className="flex flex-col text-left">
                            <span className="font-medium text-[#E8F0EA] group-hover/link:text-[#D4AF37] transition-colors">
                              Gabriel Hatakeyama
                            </span>
                            <span className="text-[10px] text-[#E8F0EA]/40 font-mono">
                              @GaboBiroo
                            </span>
                          </div>
                          <span className="text-xs text-[#E8F0EA]/30 group-hover/link:text-[#D4AF37] group-hover/link:translate-x-0.5 transition-all">
                            ↗
                          </span>
                        </a>
                        <a
                          href="https://github.com/matheusvicente-dev"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between px-2.5 py-2 rounded-sm text-xs text-[#E8F0EA]/70 hover:text-[#D4AF37] hover:bg-[#E8F0EA]/5 transition-all duration-300 group/link"
                        >
                          <div className="flex flex-col text-left">
                            <span className="font-medium text-[#E8F0EA] group-hover/link:text-[#D4AF37] transition-colors">
                              Matheus Vicente
                            </span>
                            <span className="text-[10px] text-[#E8F0EA]/40 font-mono">
                              @matheusvicente-dev
                            </span>
                          </div>
                          <span className="text-xs text-[#E8F0EA]/30 group-hover/link:text-[#D4AF37] group-hover/link:translate-x-0.5 transition-all">
                            ↗
                          </span>
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

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
