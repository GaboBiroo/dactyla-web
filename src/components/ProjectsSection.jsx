import React from 'react';
import { motion } from 'framer-motion';

export default function ProjectsSection() {
  const projects = [
    {
      id: 1,
      title: 'Projeto Alpha',
      description: 'Arquitetura monolítica de alta disponibilidade e baixa latência.',
    },
    {
      id: 2,
      title: 'Projeto Beta',
      description: 'Plataforma web resiliente integrada com processamento em tempo real.',
    },
    {
      id: 3,
      title: 'Projeto Gamma',
      description: 'Interface tátil com renderização 3D e performance otimizada.',
    },
  ];

  return (
    <section id="projetos" className="bg-[#0A140E] text-[#E8F0EA] py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-5xl font-bold tracking-tight mb-16 text-[#E8F0EA]"
        >
          Monólitos em Movimento
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -8 }}
              className="bg-[#112017] rounded-xl overflow-hidden border border-[#28593B]/20 transition-colors hover:border-[#D4AF37]/50 shadow-lg flex flex-col justify-between"
            >
              <div>
                {/* 3D Render Placeholder Space */}
                <div className="h-64 w-full bg-[#28593B]/20 flex items-center justify-center border-b border-[#28593B]/20 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#28593B]/10 to-[#D4AF37]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="text-xs font-mono tracking-widest text-[#28593B] group-hover:text-[#D4AF37] transition-colors">
                    RENDERIZAÇÃO 3D / PREVIEW
                  </span>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-[#D4AF37] mb-3 font-mono">
                    {project.title}
                  </h3>
                  <p className="text-[#E8F0EA]/70 text-sm leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
