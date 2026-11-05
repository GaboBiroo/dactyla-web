import React, { useState } from 'react';
import {
  Zap, Compass, ArrowRight, ArrowLeft, CheckCircle2,
  Sparkles, Lock, Award
} from 'lucide-react';

// Telefone Oficial Unificado de Conversão Dactyla Code (+55 12 99210-9408)
const DACTYLA_PHONE_NUMBER = import.meta.env?.VITE_DACTYLA_WHATSAPP || '5512992109408';

const NICHE_ROI_SUMMARY = {
  'Oficina / Centro Automotivo': {
    ticket: 320,
    ciclo: '150 dias',
    breakEven: 'Apenas 1 carro recuperado no mês já paga os R$ 130 de mensalidade e deixa R$ 190 de lucro.',
    projecao15: 'R$ 4.800/mês (com 15 carros reativados)',
  },
  'Pet Shop / Banho & Tosa': {
    ticket: 85,
    ciclo: '30 dias',
    breakEven: 'Apenas 2 banhos recuperados no mês já pagam os R$ 130 de mensalidade.',
    projecao15: 'R$ 1.275/mês (com 15 pets reativados)',
  },
  'Barbearia / Estética': {
    ticket: 75,
    ciclo: '21 dias',
    breakEven: '2 combos no caixa bruto (ou 4 no lucro líquido) já pagam todo o sistema.',
    projecao15: 'R$ 1.125/mês (com 15 clientes reativados)',
  },
  'Outro Comércio Local': {
    ticket: 150,
    ciclo: '45 dias',
    breakEven: '1 a 2 clientes recuperados no mês já pagam toda a mensalidade de R$ 130.',
    projecao15: 'R$ 2.250/mês (com 15 clientes reativados)',
  },
};

export default function AuditoriaDactyla({ onBack }) {
  const [path, setPath] = useState(null); // 'express' (1 min) ou 'deep' (Completa)
  const [step, setStep] = useState(0);    // 0: Seleção de Path, 1..N: Perguntas, N+1: Resultado
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [answers, setAnswers] = useState({
    empresa: '',
    nicho: 'Oficina / Centro Automotivo',
    inativosVolume: 'Mais de 100 clientes sumidos no caderno/sistema',
    tempoZap: '5 a 30 minutos',
    hasSite: 'Apenas Redes Sociais',
    sistemaAtual: 'Nenhum / Anotação em papel',
    gargalo: 'Reativar clientes antigos que sumiram e lotar terça/quarta'
  });

  // Cálculo de Nota da Empresa (0 a 100)
  const calculateScore = () => {
    let score = 100;

    // Base inativa sem automação de retorno
    if (answers.inativosVolume === 'Mais de 100 clientes sumidos no caderno/sistema') score -= 30;
    else if (answers.inativosVolume === 'Entre 30 e 100 clientes inativos') score -= 20;
    else score -= 25;

    // Tempo de resposta no WhatsApp
    if (answers.tempoZap === 'Mais de 30 minutos') score -= 30;
    else if (answers.tempoZap === '5 a 30 minutos') score -= 15;

    // Presença Digital / Site
    if (answers.hasSite === 'Não possui site') score -= 20;
    else if (answers.hasSite === 'Apenas Redes Sociais') score -= 15;

    // Perguntas da Análise Completa
    if (path === 'deep') {
      if (answers.sistemaAtual === 'Nenhum / Anotação em papel' || answers.sistemaAtual === 'Sistema antigo no computador') {
        score -= 10;
      }
    }

    return Math.max(15, Math.min(100, score));
  };

  const currentScore = calculateScore();
  const nicheInfo = NICHE_ROI_SUMMARY[answers.nicho] || NICHE_ROI_SUMMARY['Outro Comércio Local'];

  // Gera o link do WhatsApp formatado em Português Claro e 100% compatível com parseAuditoriaTrigger do bot.cjs
  const generateWhatsappUrl = (overrideScore) => {
    const scoreVal = overrideScore !== undefined ? overrideScore : currentScore;
    const pathType = path === 'express' ? 'Rápida' : 'Completa';
    const resumo = `Nicho: ${answers.nicho}, Inativos: ${answers.inativosVolume}, Atendimento: ${answers.tempoZap}, Presença: ${answers.hasSite}, Desafio: ${answers.gargalo}`;

    const triggerText = `#AUDITORIA_DACTYLA | Nome: ${answers.empresa || 'Minha Loja'} | Path: ${pathType} | Score: ${scoreVal}/100 | Resumo: ${resumo}`;
    return `https://wa.me/${DACTYLA_PHONE_NUMBER}?text=${encodeURIComponent(triggerText)}`;
  };

  // Executa o envio direto para a API de Sincronização na Nuvem
  const handleFinalSubmit = async () => {
    setLoading(true);
    const calculatedScore = calculateScore();
    const pathName = path === 'express' ? 'Validação Rápida 48h' : 'Auditoria Completa de Receita';

    const leadPayload = {
      empresa: answers.empresa || 'Empresa Auditada',
      categoria: `[AUDITORIA 48H] ${answers.nicho} | ${pathName} | Score: ${calculatedScore}/100`,
      telefone: DACTYLA_PHONE_NUMBER,
      email: 'contato@dactylacode.com.br',
      website: answers.hasSite,
      status_campanha: calculatedScore < 50 ? '[PRIORIDADE - TESTE 48H RISCO ZERO]' : '[QUALIFICADO - MOTOR REATIVAÇÃO]',
      mensagem_pitch: `Score: ${calculatedScore}/100 | Nicho: ${answers.nicho} | Inativos: ${answers.inativosVolume} | Zap: ${answers.tempoZap} | Gargalo: ${answers.gargalo}`,
      wa_link_1clique: generateWhatsappUrl(calculatedScore),
      stage: 'novos'
    };

    const baseUrl = typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://www.dactylacode.com.br';
    const targetApiUrl = `${baseUrl.replace(/\/$/, '')}/api/leads-sync`;

    try {
      await fetch(targetApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-prospector-key': 'dactyla_prospector_secret_2026'
        },
        body: JSON.stringify({ leads: [leadPayload] })
      });
    } catch (e) {
      console.error(' [Dactyla CloudSync ERRO DE CONEXÃO]:', e);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  const totalSteps = path === 'express' ? 4 : 6;

  return (
    <div className="min-h-screen bg-[#0A140E] text-[#E8F0EA] flex flex-col font-sans selection:bg-[#D4AF37] selection:text-[#0A140E] antialiased">

      {/* Header Institucional Dark Luxury */}
      <header className="bg-[#070E0A] border-b border-[#D4AF37]/25 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.6)]" />
          <h1 className="font-serif text-lg font-bold text-[#E8F0EA] tracking-wide flex flex-wrap items-center gap-2">
            Dactyla Code
            <span className="text-[#D4AF37] text-xs font-mono font-medium px-2.5 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30 tracking-wider">
              PROTOCOLO CAIXA PRIMEIRO EM 48H
            </span>
          </h1>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="text-xs text-[#E8F0EA]/70 hover:text-[#D4AF37] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#D4AF37]" /> Voltar ao Site
          </button>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 flex flex-col justify-center my-8">

        {/* STEP 0: SELEÇÃO DE MODALIDADE */}
        {step === 0 && (
          <div className="space-y-8 bg-[#070E0A] border border-[#D4AF37]/30 p-8 md:p-12 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-in fade-in duration-500">
            <div className="space-y-4 text-center md:text-left">
              <span className="text-[#D4AF37] text-xs font-mono font-semibold tracking-widest uppercase px-3.5 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 inline-flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> VALIDAÇÃO DE RECEITA EM 48H — CARAGUATATUBA/SP
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#E8F0EA] leading-tight">
                Descubra quanto dinheiro está parado na sua lista de clientes inativos.
              </h2>
              <p className="text-base text-[#E8F0EA]/75 max-w-xl leading-relaxed">
                Em menos de 1 minuto, calcule quantos clientes sumidos nós conseguimos trazer de volta para o seu balcão em 48 horas com o <strong className="text-[#D4AF37]">Teste de Risco Zero</strong> (você só paga o setup após ver os clientes agendando no seu WhatsApp).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Opção 1: Avaliação Rápida */}
              <button
                onClick={() => { setPath('express'); setStep(1); }}
                className="p-6 rounded-xl bg-[#0A140E] border border-[#28593B]/40 hover:border-[#D4AF37] text-left space-y-4 group transition-all cursor-pointer hover:shadow-[0_0_30px_rgba(212,175,55,0.15)]"
              >
                <div className="w-11 h-11 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#E8F0EA] group-hover:text-[#D4AF37] transition-colors">
                    Liberar Teste de 48h (1 Minuto)
                  </h3>
                  <p className="text-sm text-[#E8F0EA]/65 mt-1.5 leading-relaxed">
                    Cálculo direto de reativação de 60 clientes inativos para Oficinas, Pet Shops e Barbearias.
                  </p>
                </div>
                <div className="text-xs font-mono font-semibold text-[#D4AF37] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform pt-1">
                  <span>Iniciar Simulação Rápida</span> <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              {/* Opção 2: Análise Completa */}
              <button
                onClick={() => { setPath('deep'); setStep(1); }}
                className="p-6 rounded-xl bg-[#0A140E] border border-[#28593B]/40 hover:border-[#D4AF37] text-left space-y-4 group transition-all cursor-pointer hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] relative overflow-hidden"
              >
                <div className="absolute top-3 right-3 text-[10px] font-mono uppercase font-semibold text-[#0A140E] bg-[#D4AF37] px-2.5 py-0.5 rounded-full">
                  Recomendado
                </div>
                <div className="w-11 h-11 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#E8F0EA] group-hover:text-[#D4AF37] transition-colors">
                    Diagnóstico Completo + ROI
                  </h3>
                  <p className="text-sm text-[#E8F0EA]/65 mt-1.5 leading-relaxed">
                    Mapeamento completo de clientes inativos, horários ociosos de 3ª/4ª feira e presença no Google.
                  </p>
                </div>
                <div className="text-xs font-mono font-semibold text-[#D4AF37] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform pt-1">
                  <span>Iniciar Diagnóstico Completo</span> <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* PASSO A PASSO (1 até N) */}
        {step > 0 && step <= totalSteps && (
          <div className="space-y-6 bg-[#070E0A] border border-[#D4AF37]/30 p-8 md:p-10 rounded-2xl shadow-2xl animate-in fade-in duration-300">

            {/* Barra de Progresso */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-[#E8F0EA]/60">
                <span>ETAPA {step} DE {totalSteps}</span>
                <span className="text-[#D4AF37] font-semibold">{Math.round((step / totalSteps) * 100)}% CONCLUÍDO</span>
              </div>
              <div className="w-full h-1.5 bg-[#0A140E] rounded-full overflow-hidden border border-[#28593B]/30">
                <div
                  className="h-full bg-[#D4AF37] transition-all duration-300"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* PERGUNTA 1: NOME DA EMPRESA */}
            {step === 1 && (
              <div className="space-y-5">
                <h3 className="font-serif text-2xl font-bold text-[#E8F0EA] leading-snug">
                  Qual é o nome da sua Oficina, Pet Shop, Barbearia ou Empresa?
                </h3>
                <input
                  type="text"
                  autoFocus
                  placeholder="Ex: Centro Automotivo Litoral / Pet Shop Caiçara..."
                  value={answers.empresa}
                  onChange={(e) => setAnswers({ ...answers, empresa: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl bg-[#0A140E] border border-[#28593B]/50 text-[#E8F0EA] placeholder-[#E8F0EA]/40 focus:border-[#D4AF37] focus:outline-none transition-colors text-base"
                />
              </div>
            )}

            {/* PERGUNTA 2: NICHO DE ATUAÇÃO */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-[#E8F0EA] leading-snug">
                  Qual é o segmento principal do seu estabelecimento em Caraguatatuba?
                </h3>
                <div className="space-y-3">
                  {[
                    { label: '🔧 Oficina Mecânica / Centro Automotivo / Troca de Óleo (Ticket ~R$ 320)', val: 'Oficina / Centro Automotivo' },
                    { label: '🐾 Pet Shop / Banho & Tosa / Clínica Veterinária (Ticket ~R$ 85)', val: 'Pet Shop / Banho & Tosa' },
                    { label: '💈 Barbearia / Estética Masculina (Ticket ~R$ 75)', val: 'Barbearia / Estética' },
                    { label: '🏢 Outro Comércio Local / Clínica / Serviços', val: 'Outro Comércio Local' }
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setAnswers({ ...answers, nicho: item.val })}
                      className={`w-full p-4 rounded-xl text-left font-medium transition-all cursor-pointer flex items-center justify-between border ${
                        answers.nicho === item.val
                          ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#E8F0EA]'
                          : 'bg-[#0A140E] border-[#28593B]/30 text-[#E8F0EA]/75 hover:border-[#D4AF37]/50'
                      }`}
                    >
                      <span className="text-sm">{item.label}</span>
                      {answers.nicho === item.val && <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PERGUNTA 3: BASE DE CLIENTES INATIVOS */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-[#E8F0EA] leading-snug">
                  Quantos clientes antigos já passaram pela sua loja e não voltam há mais de 45 dias?
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Mais de 100 clientes anotados no sistema, planilha ou WhatsApp', val: 'Mais de 100 clientes sumidos no caderno/sistema' },
                    { label: 'Entre 30 e 100 clientes que sumiram nos últimos meses', val: 'Entre 30 e 100 clientes inativos' },
                    { label: 'Temos muitos clientes no WhatsApp, mas ninguém chama eles de volta', val: 'Base no WhatsApp sem reativação ativa' }
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setAnswers({ ...answers, inativosVolume: item.val })}
                      className={`w-full p-4 rounded-xl text-left font-medium transition-all cursor-pointer flex items-center justify-between border ${
                        answers.inativosVolume === item.val
                          ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#E8F0EA]'
                          : 'bg-[#0A140E] border-[#28593B]/30 text-[#E8F0EA]/75 hover:border-[#D4AF37]/50'
                      }`}
                    >
                      <span className="text-sm">{item.label}</span>
                      {answers.inativosVolume === item.val && <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PERGUNTA 4: TEMPO DE RESPOSTA NO ZAP */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-[#E8F0EA] leading-snug">
                  Como funciona o atendimento e aviso de serviço pronto no seu WhatsApp hoje?
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Respondemos rápido, mas não damos conta de chamar clientes inativos', val: 'Menos de 5 minutos' },
                    { label: 'Na correria do balcão, levamos de 5 a 30 minutos para responder', val: '5 a 30 minutos' },
                    { label: 'Demora mais de 30 minutos e perdemos orçamentos toda semana', val: 'Mais de 30 minutos' }
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setAnswers({ ...answers, tempoZap: item.val })}
                      className={`w-full p-4 rounded-xl text-left font-medium transition-all cursor-pointer flex items-center justify-between border ${
                        answers.tempoZap === item.val
                          ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#E8F0EA]'
                          : 'bg-[#0A140E] border-[#28593B]/30 text-[#E8F0EA]/75 hover:border-[#D4AF37]/50'
                      }`}
                    >
                      <span className="text-sm">{item.label}</span>
                      {answers.tempoZap === item.val && <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PERGUNTA 5 (DEEP DIVE): PRESENÇA ONLINE / SITE */}
            {step === 5 && path === 'deep' && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-[#E8F0EA] leading-snug">
                  Sua loja possui site próprio no Google ou depende só de Instagram e indicação?
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Sim, possuímos site próprio ativo', val: 'Sim, possui site' },
                    { label: 'Não temos site, usamos apenas Instagram / Google Meu Negócio', val: 'Apenas Redes Sociais' },
                    { label: 'Não possuímos site nem presença estruturada no Google', val: 'Não possui site' }
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setAnswers({ ...answers, hasSite: item.val })}
                      className={`w-full p-4 rounded-xl text-left font-medium transition-all cursor-pointer flex items-center justify-between border ${
                        answers.hasSite === item.val
                          ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#E8F0EA]'
                          : 'bg-[#0A140E] border-[#28593B]/30 text-[#E8F0EA]/75 hover:border-[#D4AF37]/50'
                      }`}
                    >
                      <span className="text-sm">{item.label}</span>
                      {answers.hasSite === item.val && <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PERGUNTA 6 (DEEP DIVE): GARGALO OPERACIONAL */}
            {step === 6 && path === 'deep' && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-[#E8F0EA] leading-snug">
                  Qual meta traria mais dinheiro rápido para o seu caixa nos próximos 7 dias?
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Reativar 60 clientes sumidos em 48h para gerar agendamentos imediatos', val: 'Reativar 60 clientes inativos em 48h' },
                    { label: 'Lotar os horários ociosos de terça e quarta-feira automaticamente', val: 'Lotar terça e quarta-feira' },
                    { label: 'Parar de pagar R$ 0,50/mensagem em sistemas caros (ex: SimplesVet)', val: 'Eliminar taxa por mensagem disparada' },
                    { label: 'Ter um Site Prime no topo do Google + Motor de Reativação no WhatsApp', val: 'Site Presença Prime + Motor IA' }
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setAnswers({ ...answers, gargalo: item.val })}
                      className={`w-full p-4 rounded-xl text-left font-medium transition-all cursor-pointer flex items-center justify-between border ${
                        answers.gargalo === item.val
                          ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#E8F0EA]'
                          : 'bg-[#0A140E] border-[#28593B]/30 text-[#E8F0EA]/75 hover:border-[#D4AF37]/50'
                      }`}
                    >
                      <span className="text-sm">{item.label}</span>
                      {answers.gargalo === item.val && <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Botões de Navegação */}
            <div className="flex justify-between items-center pt-6 border-t border-[#28593B]/30">
              <button
                onClick={() => setStep((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 text-xs font-mono text-[#E8F0EA]/60 hover:text-[#D4AF37] transition-colors cursor-pointer"
              >
                ← Voltar
              </button>

              {step < totalSteps ? (
                <button
                  disabled={step === 1 && !answers.empresa.trim()}
                  onClick={() => setStep((prev) => prev + 1)}
                  className="px-6 py-3 rounded-xl bg-[#D4AF37] text-[#0A140E] font-mono font-bold text-xs hover:bg-[#E8F0EA] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-[0_0_20px_rgba(212,175,55,0.25)]"
                >
                  <span>PRÓXIMA ETAPA</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="px-8 py-3.5 rounded-xl bg-[#D4AF37] text-[#0A140E] font-mono font-bold text-xs hover:bg-[#E8F0EA] transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(212,175,55,0.35)] cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'CALCULANDO POTENCIAL DE CAIXA...' : 'VER MEU PLANO DE 48H'}</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEPPER FINAL: RESULTADO DA AUDITORIA + PROTOCOLO RISCO ZERO */}
        {submitted && (
          <div className="bg-[#070E0A] border border-[#D4AF37]/40 p-8 md:p-12 rounded-2xl text-center space-y-8 animate-in zoom-in-95 duration-500 shadow-[0_10px_50px_rgba(0,0,0,0.6)]">

            <div className="space-y-3">
              <span className="text-xs font-mono font-semibold text-[#D4AF37] tracking-widest uppercase px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 inline-block">
                DIAGNÓSTICO DE RECEITA CONCLUÍDO
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#E8F0EA]">
                Plano de Resgate 48h: <span className="text-[#D4AF37]">{answers.empresa}</span>
              </h2>
            </div>

            {/* Cartão de Pontuação + ROI do Subnicho */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className={`p-6 rounded-2xl border space-y-2 flex flex-col justify-center items-center text-center ${
                currentScore < 50
                  ? 'bg-red-950/20 border-red-500/40 text-red-300'
                  : 'bg-[#0A140E] border-[#D4AF37]/40 text-[#D4AF37]'
              }`}>
                <span className="text-xs font-mono uppercase tracking-wider block">SCORE DE RETENÇÃO ATUAL</span>
                <div className="font-serif text-6xl font-bold tracking-tight">
                  {currentScore}<span className="text-2xl text-[#E8F0EA]/40">/100</span>
                </div>
                <div className="text-xs font-mono font-semibold uppercase tracking-widest">
                  {currentScore < 50 ? '⚠️ RECEITA PARADA NO CADERNO' : '🟢 PRONTO PARA ESCALA AUTOMÁTICA'}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0A140E] border border-[#28593B]/50 space-y-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[#D4AF37] block">
                  VIABILIDADE ({answers.nicho})
                </span>
                <p className="text-sm text-[#E8F0EA]/90 leading-relaxed">
                  <strong>Break-even imediato:</strong> {nicheInfo.breakEven}
                </p>
                <p className="text-xs font-mono text-[#D4AF37] pt-1 border-t border-[#E8F0EA]/10">
                  Potencial projetado: {nicheInfo.projecao15}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 max-w-xl mx-auto text-sm text-[#E8F0EA]/90 leading-relaxed">
              <strong className="text-[#D4AF37] block mb-1">Cláusula de Risco Zero (Setup R$ 400 + R$ 130/mês):</strong>
              Nós disparamos primeiro para 60 clientes inativos da <strong>{answers.empresa}</strong> em 48h. Você só paga os R$ 400 de setup <u>depois</u> de ver os clientes respondendo e agendando no seu próprio WhatsApp.
            </div>

            {/* Botão do WhatsApp Oficial Dactyla Code (+55 12 99210-9408) */}
            <div className="pt-2">
              <a
                href={generateWhatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full max-w-md mx-auto py-4 px-6 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(37,211,102,0.35)] cursor-pointer inline-flex"
              >
                <span>ATIVAR TESTE DE 48H NO WHATSAPP</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <p className="text-xs text-[#E8F0EA]/50 font-mono flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#D4AF37]" /> Engenharia Dactyla Code — WhatsApp Oficial: (12) 99210-9408
            </p>
          </div>
        )}

      </main>

    </div>
  );
}
