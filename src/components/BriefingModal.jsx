import React, { useState } from 'react';
import { X, Send, CheckCircle2, Lock } from 'lucide-react';

const DACTYLA_WHATSAPP = import.meta.env?.VITE_DACTYLA_WHATSAPP || '5512992109408';

export default function BriefingModal({ isOpen, onClose, setCursorState }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    empresa: '',
    whatsapp: '',
    faturamento: 'Até R$ 50k/mês',
    escopo: 'Motor de Reativação 48h',
    gargalo: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

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
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-[#0A140E] border border-[#D4AF37]/50 rounded-2xl p-6 md:p-10 text-left space-y-6 shadow-[0_0_50px_rgba(212,175,55,0.25)]">

        {/* Close Button */}
        <button
          onClick={onClose}
          onMouseEnter={() => setCursorState && setCursorState({ hovered: true })}
          onMouseLeave={() => setCursorState && setCursorState({ hovered: false })}
          className="absolute top-6 right-6 p-2 rounded-full border border-[#28593B] text-[#E8F0EA]/60 hover:text-[#E8F0EA] hover:border-[#D4AF37] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <>
            {/* Header */}
            <div className="space-y-2 border-b border-[#28593B]/40 pb-4">
              <span className="font-mono text-xs text-[#D4AF37] tracking-widest uppercase">
                [PROTOCOLO RISCO ZERO] // SOLICITAÇÃO DE TESTE EM 48H
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[#E8F0EA]">
                Ative o Motor de Reativação.
              </h2>
              <p className="font-sans text-xs text-[#E8F0EA]/65">
                Preencha os dados da sua loja em Caraguatatuba para iniciar o Teste de 48h com 60 clientes inativos.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-xs text-[#E8F0EA]/80">SEU NOME *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Marcos Oliveira"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-4 py-2.5 rounded bg-[#070E0A] border border-[#28593B]/50 focus:border-[#D4AF37] text-sm text-[#E8F0EA] focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-xs text-[#E8F0EA]/80">NOME DA LOJA / OFICINA / PET *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Auto Center Caraguá / Pet & Cia"
                    value={formData.empresa}
                    onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                    className="w-full px-4 py-2.5 rounded bg-[#070E0A] border border-[#28593B]/50 focus:border-[#D4AF37] text-sm text-[#E8F0EA] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-xs text-[#E8F0EA]/80">WHATSAPP DA LOJA *</label>
                  <input
                    type="tel"
                    required
                    placeholder="(12) 99999-9999"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-4 py-2.5 rounded bg-[#070E0A] border border-[#28593B]/50 focus:border-[#D4AF37] text-sm text-[#E8F0EA] focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-xs text-[#E8F0EA]/80">FATURAMENTO MENSAL ESTIMADO</label>
                  <select
                    value={formData.faturamento}
                    onChange={(e) => setFormData({ ...formData, faturamento: e.target.value })}
                    className="w-full px-4 py-2.5 rounded bg-[#070E0A] border border-[#28593B]/50 focus:border-[#D4AF37] text-sm text-[#E8F0EA] focus:outline-none transition-colors"
                  >
                    <option value="Até R$ 50k/mês">Até R$ 50k/mês</option>
                    <option value="R$ 50k - R$ 200k/mês">R$ 50k - R$ 200k/mês</option>
                    <option value="R$ 200k - R$ 1M/mês">R$ 200k - R$ 1M/mês</option>
                    <option value="Acima de R$ 1M/mês">Acima de R$ 1M/mês</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-xs text-[#E8F0EA]/80">PLANO DESEJADO</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['Motor de Reativação 48h', 'Presença Prime + Motor IA', 'Engenharia Custom / Big Data'].map((sc) => (
                    <button
                      key={sc}
                      type="button"
                      onClick={() => setFormData({ ...formData, escopo: sc })}
                      className={`py-2 px-3 rounded border font-mono text-xs text-center transition-all cursor-pointer ${
                        formData.escopo === sc
                          ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37] font-bold'
                          : 'border-[#28593B]/40 bg-[#070E0A] text-[#E8F0EA]/60 hover:border-[#D4AF37]/50'
                      }`}
                    >
                      {sc}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-xs text-[#E8F0EA]/80">QUANTOS CLIENTES INATIVOS VOCÊ QUER REATIVAR?</label>
                <textarea
                  rows={3}
                  placeholder="Ex: Temos cerca de 200 clientes de troca de óleo / banho & tosa que não voltam há mais de 3 meses..."
                  value={formData.gargalo}
                  onChange={(e) => setFormData({ ...formData, gargalo: e.target.value })}
                  className="w-full px-4 py-2.5 rounded bg-[#070E0A] border border-[#28593B]/50 focus:border-[#D4AF37] text-sm text-[#E8F0EA] focus:outline-none transition-colors"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[11px] font-mono text-[#E8F0EA]/50">
                  <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Cláusula Risco Zero • Pagamento só após validação</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  onMouseEnter={() => setCursorState && setCursorState({ hovered: true })}
                  onMouseLeave={() => setCursorState && setCursorState({ hovered: false })}
                  className="px-8 py-3 rounded bg-[#D4AF37] text-[#0A140E] font-mono text-xs font-bold hover:bg-[#E8F0EA] transition-all flex items-center space-x-2 shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'ENVIANDO...' : 'LIBERAR TESTE 48H'}</span>
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
              <h3 className="font-serif text-3xl font-semibold text-[#E8F0EA]">Solicitação Recebida!</h3>
              <p className="font-sans text-sm text-[#E8F0EA]/75 max-w-md mx-auto">
                O Gabriel (CTO da Dactyla Code) já recebeu os dados da <strong className="text-[#D4AF37]">{formData.empresa}</strong> para configurar o seu Disparo de Validação em 48h.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://wa.me/${DACTYLA_WHATSAPP}?text=${encodeURIComponent(`Olá Gabriel! Acabei de solicitar o Teste de 48h (${formData.escopo}) para a ${formData.empresa || 'minha loja'} no site da Dactyla Code.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 rounded bg-[#25D366] text-white font-mono text-xs font-bold hover:bg-[#1EBE5D] transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.3)]"
              >
                💬 Falar com Gabriel no WhatsApp ➔
              </a>
              <button
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="px-6 py-2.5 rounded border border-[#D4AF37] text-[#D4AF37] font-mono text-xs hover:bg-[#D4AF37] hover:text-[#0A140E] transition-all cursor-pointer"
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
