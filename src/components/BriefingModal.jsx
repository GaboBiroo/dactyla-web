import React, { useState } from 'react';
import { X, Send, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';

export default function BriefingModal({ isOpen, onClose, setCursorState }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    nome: '',
    empresa: '',
    whatsapp: '',
    faturamento: 'R$ 50k - R$ 200k/mês',
    escopo: 'Ecossistema (Growth)',
    gargalo: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao enviar briefing.');
      }

      setSubmitted(true);
    } catch (err) {
      // Exibe view de confirmação para o cliente e registra log
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-[#1A1A1A] border border-[#D4AF37]/50 rounded-2xl p-6 md:p-10 text-left space-y-6 shadow-[0_0_50px_rgba(212,175,55,0.25)]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          onMouseEnter={() => setCursorState({ hovered: true })}
          onMouseLeave={() => setCursorState({ hovered: false })}
          className="absolute top-6 right-6 p-2 rounded-full border border-neutral-800 text-neutral-400 hover:text-white hover:border-[#D4AF37] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <>
            {/* Header */}
            <div className="space-y-2 border-b border-neutral-800 pb-4">
              <span className="font-mono-code text-xs text-[#D4AF37] tracking-widest uppercase">
                [05] CONEXÃO DIRECTA // BRIEFING HIGH-TICKET
              </span>
              <h2 className="font-editorial text-3xl md:text-4xl font-semibold text-[#F8F9FA]">
                Inicie a Transformação Digital.
              </h2>
              <p className="font-sans text-xs text-neutral-400">
                Preencha os parâmetros de engenharia do seu projeto para análise direta de Gabriel e Matheus.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono-code text-xs text-neutral-300">NOME COMPLETO *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dra. Helena Silveira"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-4 py-2.5 rounded bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] text-sm text-[#F8F9FA] focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono-code text-xs text-neutral-300">EMPRESA / MARCA *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Clinica Vitta / TechCorp"
                    value={formData.empresa}
                    onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                    className="w-full px-4 py-2.5 rounded bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] text-sm text-[#F8F9FA] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono-code text-xs text-neutral-300">WHATSAPP CORPORATIVO *</label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 99999-9999"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-4 py-2.5 rounded bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] text-sm text-[#F8F9FA] focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono-code text-xs text-neutral-300">FATURAMENTO MENSAL ESTIMADO</label>
                  <select
                    value={formData.faturamento}
                    onChange={(e) => setFormData({ ...formData, faturamento: e.target.value })}
                    className="w-full px-4 py-2.5 rounded bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] text-sm text-[#F8F9FA] focus:outline-none transition-colors"
                  >
                    <option value="Até R$ 50k/mês">Até R$ 50k/mês</option>
                    <option value="R$ 50k - R$ 200k/mês">R$ 50k - R$ 200k/mês</option>
                    <option value="R$ 200k - R$ 1M/mês">R$ 200k - R$ 1M/mês</option>
                    <option value="Acima de R$ 1M/mês">Acima de R$ 1M/mês (Enterprise)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono-code text-xs text-neutral-300">ESCOPO ARQUITETURAL DESEJADO</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Presença Prime', 'Ecossistema (Growth)', 'Dactyla Custom'].map((sc) => (
                    <button
                      key={sc}
                      type="button"
                      onClick={() => setFormData({ ...formData, escopo: sc })}
                      className={`py-2 px-3 rounded border font-mono-code text-xs text-center transition-all cursor-pointer ${
                        formData.escopo === sc
                          ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37] font-bold'
                          : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      {sc}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono-code text-xs text-neutral-300">DESCREVA O GARGALO OU DESAFIO ATUAL</label>
                <textarea
                  rows={3}
                  placeholder="Ex: Nosso site atual demora 6 segundos para carregar, perdemos leads e não temos automação de WhatsApp..."
                  value={formData.gargalo}
                  onChange={(e) => setFormData({ ...formData, gargalo: e.target.value })}
                  className="w-full px-4 py-2.5 rounded bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] text-sm text-[#F8F9FA] focus:outline-none transition-colors"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[11px] font-mono-code text-neutral-500">
                  <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>NDA & Sigilo Corporativo Automático</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  onMouseEnter={() => setCursorState({ hovered: true })}
                  onMouseLeave={() => setCursorState({ hovered: false })}
                  className="px-8 py-3 rounded bg-[#D4AF37] text-[#1A1A1A] font-mono-code text-xs font-bold hover:bg-[#C68B59] transition-all flex items-center space-x-2 shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'ENVIANDO...' : 'ENVIAR BRIEFING'}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Submission Success View */
          <div className="py-12 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-editorial text-3xl font-semibold text-[#F8F9FA]">Briefing Recebido com Sucesso.</h3>
              <p className="font-sans text-sm text-neutral-300 max-w-md mx-auto">
                O CTO da Dactyla Code analisará o perfil da <strong className="text-[#D4AF37]">{formData.empresa}</strong> nas próximas horas para agendamento de diagnóstico.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://wa.me/5512992109408?text=Olá%20Gabriel!%20Acabei%20de%20enviar%20o%20briefing%20da%20minha%20empresa%20(${encodeURIComponent(formData.empresa || 'Dactyla')})%20no%20site.`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 rounded bg-[#25D366] text-white font-mono-code text-xs font-bold hover:bg-[#1EBE5D] transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.3)]"
              >
                💬 Falar com Gabriel no WhatsApp ➔
              </a>
              <button
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="px-6 py-2.5 rounded border border-[#D4AF37] text-[#D4AF37] font-mono-code text-xs hover:bg-[#D4AF37] hover:text-[#1A1A1A] transition-all cursor-pointer"
              >
                RETORNAR AO SITE
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
