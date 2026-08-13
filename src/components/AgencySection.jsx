import React from 'react';
import { motion } from 'framer-motion';

export default function AgencySection() {
  const gabrielTags = ['Backend', 'Infraestrutura', 'Banco de Dados', 'PHP/Laravel', 'Python', 'SQL'];
  const matheusTags = ['Frontend', 'Motion Design', 'UI/UX', 'Design Systems'];

  return (
    <section id="agencia" className="bg-[#E8F0EA] text-[#0A140E] py-24 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Manifesto */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mb-16 pl-6 border-l-4 border-[#D4AF37]"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-[#0A140E]">
            A Dualidade Indissociável.
          </h2>
          <p className="text-lg md:text-xl text-[#0A140E]/80 leading-relaxed font-light">
            Nascida na faixa litorânea de Caraguatatuba, a Dactyla dita a única regra que importa: adaptação absoluta ao ambiente com execução predatória de resultados.
          </p>
        </motion.div>

        {/* Founders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Gabriel Hatakeyama Rodrigues */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7 }}
            className="bg-[#F4F7F5] border border-[#28593B]/15 rounded-xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
          >
            <div>
              <div className="overflow-hidden">
                <img
                  src="/media_1786120579526.png"
                  alt="Gabriel Hatakeyama Rodrigues"
                  className="w-full h-80 object-cover object-center grayscale hover:grayscale-0 transition-all duration-500 rounded-t-lg hover:scale-105"
                />
              </div>
              <div className="p-8 md:p-10 pb-0">
                <span className="text-xs font-mono uppercase tracking-widest text-[#28593B]/70 block mb-2">
                  O Núcleo Invisível — Engenharia & Infraestrutura
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-[#0A140E] mb-1">
                  Gabriel Hatakeyama Rodrigues
                </h3>
                <p className="text-sm font-semibold text-[#28593B] mb-6">
                  Co-Founder & Engenheiro de Software
                </p>
                <p className="text-[#0A140E]/80 leading-relaxed text-base mb-8">
                  Com raízes em Caraguatatuba e formação em Análise e Desenvolvimento de Sistemas pelo Centro Universitário Módulo, arquiteta o núcleo duro das aplicações. Liderança técnica com visão panorâmica. Especialista na espinha dorsal dos projetos: da modelagem de bancos de dados à estruturação de servidores, orquestrando soluções robustas em PHP/Laravel, Python e JavaScript.
                </p>
              </div>
            </div>
            <div className="p-8 md:p-10 pt-4">
              <div className="flex flex-wrap gap-2 pt-4 border-t border-[#28593B]/10">
                {gabrielTags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-[#28593B]/10 text-[#28593B] text-xs px-3 py-1 rounded-full font-medium font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Matheus Vicente */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="bg-[#F4F7F5] border border-[#28593B]/15 rounded-xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
          >
            <div>
              <div className="overflow-hidden">
                <img
                  src="/media_1786120555908.png"
                  alt="Matheus Vicente"
                  className="w-full h-80 object-cover object-center grayscale hover:grayscale-0 transition-all duration-500 rounded-t-lg hover:scale-105"
                />
              </div>
              <div className="p-8 md:p-10 pb-0">
                <span className="text-xs font-mono uppercase tracking-widest text-[#28593B]/70 block mb-2">
                  A Camada Visível — UX/UI & Experiência Tátil
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-[#0A140E] mb-1">
                  Matheus Vicente
                </h3>
                <p className="text-sm font-semibold text-[#28593B] mb-6">
                  Co-Founder & Diretor de UX/UI
                </p>
                <p className="text-[#0A140E]/80 leading-relaxed text-base mb-8">
                  O mestre da camada visível. Enquanto a lógica acontece nos bastidores, ele transforma dados brutos em experiências táteis e interativas. Responsável pela fluidez de tela, animações de alto padrão e integração rigorosa do design system. A ponte exata entre o código purista e o encantamento psicológico do cliente final.
                </p>
              </div>
            </div>
            <div className="p-8 md:p-10 pt-4">
              <div className="flex flex-wrap gap-2 pt-4 border-t border-[#28593B]/10">
                {matheusTags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-[#28593B]/10 text-[#28593B] text-xs px-3 py-1 rounded-full font-medium font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
