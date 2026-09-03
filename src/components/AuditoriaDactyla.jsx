import React, { useState } from 'react';
import { 
  Zap, Cpu, ArrowRight, ArrowLeft, CheckCircle2, 
  Sparkles, Lock, ShieldCheck, AlertOctagon 
} from 'lucide-react';

export default function AuditoriaDactyla({ onBack }) {
  const [path, setPath] = useState(null); // 'express' (3p) ou 'deep' (6p)
  const [step, setStep] = useState(0);    // 0: Seleção de Path, 1..N: Perguntas, N+1: Resultado
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const DACTYLA_PHONE_NUMBER = '5512991879486'; // Telefone Oficial da Dactyla Code (+55 12 99187-9486)

  const [answers, setAnswers] = useState({
    empresa: '',
    tempoZap: '5-30 mins',
    hasSite: 'Só Redes Sociais',
    contatosMgmt: 'Planilha manual',
    sistemaAtual: 'Nenhum / Papel',
    gargalo: 'Lentidão no Atendimento'
  });

  // Cálculo Dinâmico de Score (0 a 100)
  const calculateScore = () => {
    let score = 100;

    // Tempo de resposta no WhatsApp
    if (answers.tempoZap === 'Mais de 30 mins') score -= 40;
    else if (answers.tempoZap === '5-30 mins') score -= 20;

    // Presença Digital / Site
    if (answers.hasSite === 'Não') score -= 35;
    else if (answers.hasSite === 'Só Redes Sociais') score -= 30;

    // Path Deep Dive Extra Deductions
    if (path === 'deep') {
      if (answers.contatosMgmt === 'Nenhum / Bloco de Notas') score -= 15;
      else if (answers.contatosMgmt === 'Planilha manual') score -= 5;

      if (answers.sistemaAtual === 'Nenhum / Papel' || answers.sistemaAtual === 'Sistema Antigo Offline') {
        score -= 10;
      }
    }

    return Math.max(5, Math.min(100, score));
  };

  const currentScore = calculateScore();

  // Executa o envio Zero-Touch para o Kanban na Vercel
  const handleFinalSubmit = async () => {
    setLoading(true);
    const calculatedScore = calculateScore();
    const pathName = path === 'express' ? 'Path Express (3p)' : 'Path Deep Dive (6p)';

    const leadPayload = {
      empresa: answers.empresa || 'Empresa Auditada',
      categoria: `[AUDITORIA INBOUND] ${pathName} | Score: ${calculatedScore}/100`,
      telefone: DACTYLA_PHONE_NUMBER,
      email: 'inbound@dactylacode.com.br',
      website: answers.hasSite,
      status_campanha: calculatedScore < 50 ? '[ALVO QUENTE - AUDITORIA CRÍTICA]' : '[AUDITORIA QUALIFICADA]',
      mensagem_pitch: `Score: ${calculatedScore}/100 | Zap: ${answers.tempoZap} | Site: ${answers.hasSite} | Gargalo: ${answers.gargalo}`,
      wa_link_1clique: generateWhatsappUrl(calculatedScore),
      stage: 'novos'
    };

    try {
      await fetch('/api/leads-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-prospector-key': 'dactyla_prospector_secret_2026'
        },
        body: JSON.stringify({ leads: [leadPayload] })
      });
    } catch (e) {
      console.error('Erro na submissão Zero-Touch:', e);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  // Monta a URL wa.me direcionada rigorosamente para o número oficial da Dactyla Code
  const generateWhatsappUrl = (overrideScore) => {
    const scoreVal = overrideScore !== undefined ? overrideScore : currentScore;
    const pathType = path === 'express' ? 'Express' : 'DeepDive';
    const resumo = `Zap: ${answers.tempoZap}, Site: ${answers.hasSite}, Gestao: ${answers.sistemaAtual}, Gargalo: ${answers.gargalo}`;

    const triggerText = `#AUDITORIA_DACTYLA | Nome: ${answers.empresa || 'Minha Empresa'} | Path: ${pathType} | Score: ${scoreVal}/100 | Resumo: ${resumo}`;
    return `https://wa.me/${DACTYLA_PHONE_NUMBER}?text=${encodeURIComponent(triggerText)}`;
  };

  const totalSteps = path === 'express' ? 3 : 6;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black antialiased">
      
      {/* Header Fixo Dark Premium */}
      <header className="bg-[#111111] border-b border-neutral-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <h1 className="font-editorial text-lg font-bold text-white tracking-wide flex items-center gap-2">
            Dactyla Code <span className="text-emerald-400 text-xs font-mono-code px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">INBOUND ENGINE</span>
          </h1>
        </div>

        {onBack && (
          <button 
            onClick={onBack}
            className="text-xs font-mono-code text-neutral-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Site
          </button>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 flex flex-col justify-center my-8">
        
        {/* STEP 0: SELEÇÃO DE PATH (EXPRESS VS DEEP DIVE) */}
        {step === 0 && (
          <div className="space-y-8 bg-[#111111] border border-neutral-800 p-8 md:p-12 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.05)] animate-in fade-in duration-500">
            <div className="space-y-3 text-center md:text-left">
              <span className="text-emerald-400 text-xs font-mono-code tracking-widest uppercase px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 inline-block">
                [AUDITORIA DIGITAL GRATUITA 60s]
              </span>
              <h2 className="font-editorial text-3xl md:text-4xl font-bold text-white leading-tight">
                Diagnóstico de Performance & Conversão B2B.
              </h2>
              <p className="text-sm text-neutral-400 max-w-xl">
                Descubra em segundos os gargalos invisíveis de vendas da sua empresa no Litoral Norte e receba uma análise executiva direta dos engenheiros da Dactyla.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {/* Path Express */}
              <button
                onClick={() => { setPath('express'); setStep(1); }}
                className="p-6 rounded-xl bg-[#0a0a0a] border border-neutral-800 hover:border-emerald-500 text-left space-y-4 group transition-all cursor-pointer hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-editorial text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    Path Express (3 Perguntas)
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Auditoria rápida em 45 segundos. Foco em velocidade de atendimento e presença online.
                  </p>
                </div>
                <div className="text-xs font-mono-code text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Iniciar Express</span> <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Path Deep Dive */}
              <button
                onClick={() => { setPath('deep'); setStep(1); }}
                className="p-6 rounded-xl bg-[#0a0a0a] border border-neutral-800 hover:border-amber-400 text-left space-y-4 group transition-all cursor-pointer hover:shadow-[0_0_25px_rgba(251,191,36,0.15)]"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-editorial text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    Path Deep Dive (6 Perguntas)
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Diagnóstico completo de engenharia comercial, sistemas de gestão e gargalos operacionais.
                  </p>
                </div>
                <div className="text-xs font-mono-code text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Iniciar Deep Dive</span> <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEPPER DINÂMICO (1 até N) */}
        {step > 0 && step <= totalSteps && (
          <div className="space-y-6 bg-[#111111] border border-neutral-800 p-8 md:p-10 rounded-2xl shadow-xl animate-in fade-in duration-300">
            
            {/* Barra de Progresso do Stepper */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono-code text-neutral-400">
                <span>ETAPA {step} DE {totalSteps}</span>
                <span className="text-emerald-400">{Math.round((step / totalSteps) * 100)}% CONCLUÍDO</span>
              </div>
              <div className="w-full h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden border border-neutral-800">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-300"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* PERGUNTA 1: NOME DA EMPRESA */}
            {step === 1 && (
              <div className="space-y-5">
                <h3 className="font-editorial text-2xl font-bold text-white">
                  Qual é o nome da sua empresa ou consultório?
                </h3>
                <input
                  type="text"
                  autoFocus
                  placeholder="Ex: Clínica Sorella / Restaurante Mar & Terra"
                  value={answers.empresa}
                  onChange={(e) => setAnswers({ ...answers, empresa: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl bg-[#0a0a0a] border border-neutral-800 text-white focus:border-emerald-500 focus:outline-none transition-colors text-base"
                />
              </div>
            )}

            {/* PERGUNTA 2: TEMPO DE RESPOSTA NO ZAP */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-editorial text-2xl font-bold text-white">
                  Quanto tempo sua equipe demora para responder um orçamento no WhatsApp?
                </h3>
                <div className="space-y-3">
                  {[
                    { label: '⚡ Menos de 5 minutos (Imediato)', val: 'Menos de 5 mins' },
                    { label: '🕒 Entre 5 e 30 minutos (Médio)', val: '5-30 mins' },
                    { label: '⚠️ Mais de 30 minutos / Horas (Lento)', val: 'Mais de 30 mins' }
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setAnswers({ ...answers, tempoZap: item.val })}
                      className={`w-full p-4 rounded-xl text-left font-medium transition-all cursor-pointer flex items-center justify-between border ${
                        answers.tempoZap === item.val
                          ? 'bg-emerald-500/10 border-emerald-500 text-white'
                          : 'bg-[#0a0a0a] border-neutral-800 text-neutral-300 hover:border-neutral-600'
                      }`}
                    >
                      <span>{item.label}</span>
                      {answers.tempoZap === item.val && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PERGUNTA 3: PRESENÇA ONLINE / SITE */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-editorial text-2xl font-bold text-white">
                  Sua empresa possui um site ou landing page oficial configurada no Google?
                </h3>
                <div className="space-y-3">
                  {[
                    { label: '🌐 Sim, temos site próprio ativo', val: 'Sim' },
                    { label: '📱 Não temos site, usamos apenas Instagram / Facebook', val: 'Só Redes Sociais' },
                    { label: '❌ Não temos site nem presença estruturada', val: 'Não' }
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setAnswers({ ...answers, hasSite: item.val })}
                      className={`w-full p-4 rounded-xl text-left font-medium transition-all cursor-pointer flex items-center justify-between border ${
                        answers.hasSite === item.val
                          ? 'bg-emerald-500/10 border-emerald-500 text-white'
                          : 'bg-[#0a0a0a] border-neutral-800 text-neutral-300 hover:border-neutral-600'
                      }`}
                    >
                      <span>{item.label}</span>
                      {answers.hasSite === item.val && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PERGUNTA 4 (DEEP DIVE): GESTÃO DE CONTATOS */}
            {step === 4 && path === 'deep' && (
              <div className="space-y-4">
                <h3 className="font-editorial text-2xl font-bold text-white">
                  Como sua empresa salva e organiza o histórico de contatos dos clientes?
                </h3>
                <div className="space-y-3">
                  {[
                    { label: '📊 Planilha manual (Excel / Google Sheets)', val: 'Planilha manual' },
                    { label: '📝 Bloco de notas / Agenda física / Não salva', val: 'Nenhum / Bloco de Notas' },
                    { label: '🚀 CRM de vendas automatizado', val: 'CRM Automatizado' }
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setAnswers({ ...answers, contatosMgmt: item.val })}
                      className={`w-full p-4 rounded-xl text-left font-medium transition-all cursor-pointer flex items-center justify-between border ${
                        answers.contatosMgmt === item.val
                          ? 'bg-amber-500/10 border-amber-500 text-white'
                          : 'bg-[#0a0a0a] border-neutral-800 text-neutral-300 hover:border-neutral-600'
                      }`}
                    >
                      <span>{item.label}</span>
                      {answers.contatosMgmt === item.val && <CheckCircle2 className="w-5 h-5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PERGUNTA 5 (DEEP DIVE): SISTEMA ATUAL */}
            {step === 5 && path === 'deep' && (
              <div className="space-y-4">
                <h3 className="font-editorial text-2xl font-bold text-white">
                  Qual sistema de gestão / PDV sua empresa utiliza atualmente?
                </h3>
                <div className="space-y-3">
                  {[
                    { label: '💻 Sistema antigo instalado no computador (Offline/Firebird)', val: 'Sistema Antigo Offline' },
                    { label: '☁️ Sistema em nuvem moderno (SaaS)', val: 'Sistema Web SaaS' },
                    { label: '📋 Nenhum sistema / Anotação em papel', val: 'Nenhum / Papel' }
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setAnswers({ ...answers, sistemaAtual: item.val })}
                      className={`w-full p-4 rounded-xl text-left font-medium transition-all cursor-pointer flex items-center justify-between border ${
                        answers.sistemaAtual === item.val
                          ? 'bg-amber-500/10 border-amber-500 text-white'
                          : 'bg-[#0a0a0a] border-neutral-800 text-neutral-300 hover:border-neutral-600'
                      }`}
                    >
                      <span>{item.label}</span>
                      {answers.sistemaAtual === item.val && <CheckCircle2 className="w-5 h-5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PERGUNTA 6 (DEEP DIVE): GARGALO OPERACIONAL */}
            {step === 6 && path === 'deep' && (
              <div className="space-y-4">
                <h3 className="font-editorial text-2xl font-bold text-white">
                  Qual é o maior desafio ou gargalo do seu negócio hoje?
                </h3>
                <div className="space-y-3">
                  {[
                    { label: '🕒 Demora no atendimento via WhatsApp', val: 'Lentidão no Atendimento' },
                    { label: '📉 Perda de orçamentos e falta de acompanhamento', val: 'Perda de Orçamentos' },
                    { label: '🍕 Taxas altíssimas do iFood / plataformas de entrega', val: 'iFood / Comissões' },
                    { label: '📦 Falta de controle de estoque e tributos', val: 'Estoque e Tributos' }
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setAnswers({ ...answers, gargalo: item.val })}
                      className={`w-full p-4 rounded-xl text-left font-medium transition-all cursor-pointer flex items-center justify-between border ${
                        answers.gargalo === item.val
                          ? 'bg-amber-500/10 border-amber-500 text-white'
                          : 'bg-[#0a0a0a] border-neutral-800 text-neutral-300 hover:border-neutral-600'
                      }`}
                    >
                      <span>{item.label}</span>
                      {answers.gargalo === item.val && <CheckCircle2 className="w-5 h-5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Controles do Stepper */}
            <div className="flex justify-between items-center pt-6 border-t border-neutral-800">
              <button
                onClick={() => setStep((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 text-xs font-mono-code text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                ← Voltar
              </button>

              {step < totalSteps ? (
                <button
                  disabled={step === 1 && !answers.empresa.trim()}
                  onClick={() => setStep((prev) => prev + 1)}
                  className="px-6 py-3 rounded-xl bg-emerald-500 text-black font-bold font-mono-code text-xs hover:bg-emerald-400 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>PRÓXIMO PASSO</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-400 text-black font-bold font-mono-code text-xs hover:opacity-90 transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.3)] cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'ANALISANDO DADOS...' : 'GERAR MEU DIAGNÓSTICO'}</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEPPER FINAL: RESULTADO DA AUDITORIA & REDIRECIONAMENTO WHATSAPP DACTYLA */}
        {submitted && (
          <div className="bg-[#111111] border border-neutral-800 p-8 md:p-12 rounded-2xl text-center space-y-8 animate-in zoom-in-95 duration-500 shadow-[0_0_60px_rgba(16,185,129,0.1)]">
            
            {/* Header Resultado */}
            <div className="space-y-3">
              <span className="text-xs font-mono-code text-emerald-400 tracking-widest uppercase">
                [AUDITORIA DIGITAL CONCLUÍDA]
              </span>
              <h2 className="font-editorial text-3xl font-bold text-white">
                Resultado do Diagnóstico para <span className="text-emerald-400">{answers.empresa}</span>
              </h2>
            </div>

            {/* Placa de Nota Dinâmica */}
            <div className={`p-8 rounded-2xl border max-w-sm mx-auto space-y-3 ${
              currentScore < 50 
                ? 'bg-red-950/20 border-red-500/50 text-red-400' 
                : 'bg-emerald-950/20 border-emerald-500/50 text-emerald-400'
            }`}>
              <span className="text-xs font-mono-code uppercase tracking-wider block">SCORE DE PERFORMANCE DIGITAL</span>
              <div className="font-editorial text-6xl font-bold tracking-tight">
                {currentScore}<span className="text-2xl text-neutral-500">/100</span>
              </div>
              <div className="text-xs font-semibold uppercase tracking-widest">
                {currentScore < 50 ? '⚠️ RISCO ALTO DE PERDA DE CLIENTES' : '🟢 POTENCIAL DE ESCALA COM IA'}
              </div>
            </div>

            <p className="text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
              O diagnóstico identificou gargalos operacionais no seu atendimento. Clique abaixo para abrir o atendimento direto com a engenharia da Dactyla Code:
            </p>

            {/* Botão de Disparo do Gatilho WhatsApp para o Número Oficial da Dactyla (+55 12 99187-9486) */}
            <div className="pt-2">
              <a
                href={generateWhatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full max-w-md mx-auto py-4 px-6 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold font-mono-code text-sm transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(37,211,102,0.35)] cursor-pointer inline-flex"
              >
                <span>RECEBER DIAGNÓSTICO NO WHATSAPP DACTYLA</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <p className="text-xs text-neutral-500 font-mono-code flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> Canal oficial Dactyla Code (+55 12 99187-9486)
            </p>
          </div>
        )}

      </main>

    </div>
  );
}
