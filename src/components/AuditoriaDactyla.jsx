import React, { useState } from 'react';
import { 
  Zap, Compass, ArrowRight, ArrowLeft, CheckCircle2, 
  Sparkles, Lock, ShieldCheck, Award, Building2, TrendingUp
} from 'lucide-react';

export default function AuditoriaDactyla({ onBack }) {
  const [path, setPath] = useState(null); // 'express' (1 min) ou 'deep' (Completa)
  const [step, setStep] = useState(0);    // 0: Seleção de Path, 1..N: Perguntas, N+1: Resultado
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Telefone Oficial de Atendimento Executivo Dactyla Code (+55 12 99187-9486)
  const DACTYLA_PHONE_NUMBER = '5512991879486';

  const [answers, setAnswers] = useState({
    empresa: '',
    tempoZap: '5 a 30 minutos',
    hasSite: 'Apenas Redes Sociais',
    contatosMgmt: 'Planilha manual',
    sistemaAtual: 'Nenhum / Anotação em papel',
    gargalo: 'Demora no atendimento via WhatsApp'
  });

  // Cálculo de Nota da Empresa (0 a 100)
  const calculateScore = () => {
    let score = 100;

    // Tempo de resposta no WhatsApp
    if (answers.tempoZap === 'Mais de 30 minutos') score -= 40;
    else if (answers.tempoZap === '5 a 30 minutos') score -= 20;

    // Presença Digital / Site
    if (answers.hasSite === 'Não possui site') score -= 35;
    else if (answers.hasSite === 'Apenas Redes Sociais') score -= 30;

    // Perguntas da Análise Completa
    if (path === 'deep') {
      if (answers.contatosMgmt === 'Bloco de notas / Não salva') score -= 15;
      else if (answers.contatosMgmt === 'Planilha manual') score -= 5;

      if (answers.sistemaAtual === 'Nenhum / Anotação em papel' || answers.sistemaAtual === 'Sistema antigo no computador') {
        score -= 10;
      }
    }

    return Math.max(10, Math.min(100, score));
  };

  const currentScore = calculateScore();

  // Executa o envio direto para a API de Sincronização na Nuvem
  const handleFinalSubmit = async () => {
    setLoading(true);
    const calculatedScore = calculateScore();
    const pathName = path === 'express' ? 'Avaliação Rápida (1 Minuto)' : 'Análise Completa (Recomendado)';

    const leadPayload = {
      empresa: answers.empresa || 'Empresa Auditada',
      categoria: `[AVALIAÇÃO EXECUTIVA] ${pathName} | Score: ${calculatedScore}/100`,
      telefone: DACTYLA_PHONE_NUMBER,
      email: 'contato@dactylacode.com.br',
      website: answers.hasSite,
      status_campanha: calculatedScore < 50 ? '[ATENÇÃO CRÍTICA - AUDITORIA]' : '[OPORTUNIDADE DE ESCALA]',
      mensagem_pitch: `Score: ${calculatedScore}/100 | Atendimento: ${answers.tempoZap} | Site: ${answers.hasSite} | Gargalo: ${answers.gargalo}`,
      wa_link_1clique: generateWhatsappUrl(calculatedScore),
      stage: 'novos'
    };

    // Monta a URL Absoluta garantida para evitar falhas de caminho relativo em produção
    const baseUrl = typeof window !== 'undefined' && window.location.origin 
      ? window.location.origin 
      : 'https://www.dactylacode.com.br';
    const targetApiUrl = `${baseUrl.replace(/\/$/, '')}/api/leads-sync`;

    console.log(' [Dactyla CloudSync] Disparando avaliação executiva para:', targetApiUrl, leadPayload);

    try {
      const response = await fetch(targetApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-prospector-key': 'dactyla_prospector_secret_2026'
        },
        body: JSON.stringify({ leads: [leadPayload] })
      });

      if (response.ok) {
        const resJson = await response.json();
        console.log(' [Dactyla CloudSync SUCESSO]:', resJson);
      } else {
        const errorText = await response.text();
        console.error(' [Dactyla CloudSync ALERTA] Status:', response.status, 'Payload:', errorText);
      }
    } catch (e) {
      console.error(' [Dactyla CloudSync ERRO DE CONEXÃO]:', e);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  // Gera o link do WhatsApp formatado em Português Claro para a Dactyla Code
  const generateWhatsappUrl = (overrideScore) => {
    const scoreVal = overrideScore !== undefined ? overrideScore : currentScore;
    const pathType = path === 'express' ? 'Rápida' : 'Completa';
    const resumo = `Atendimento: ${answers.tempoZap}, Presença: ${answers.hasSite}, Gestão: ${answers.sistemaAtual}, Desafio: ${answers.gargalo}`;

    const triggerText = `#AUDITORIA_DACTYLA | Nome: ${answers.empresa || 'Minha Empresa'} | Path: ${pathType} | Score: ${scoreVal}/100 | Resumo: ${resumo}`;
    return `https://wa.me/${DACTYLA_PHONE_NUMBER}?text=${encodeURIComponent(triggerText)}`;
  };

  const totalSteps = path === 'express' ? 3 : 6;

  return (
    <div className="min-h-screen bg-[#0A0C0E] text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black antialiased">
      
      {/* Header Institucional de Alta Renda */}
      <header className="bg-[#121418] border-b border-amber-900/30 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
          <h1 className="font-serif text-lg font-bold text-white tracking-wide flex items-center gap-2">
            Dactyla Code <span className="text-amber-400 text-xs font-sans font-medium px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 tracking-wider">ÁREA EXCLUSIVA PARA EMPRESÁRIOS</span>
          </h1>
        </div>

        {onBack && (
          <button 
            onClick={onBack}
            className="text-xs text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" /> Voltar ao Site
          </button>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 flex flex-col justify-center my-8">
        
        {/* STEP 0: SELEÇÃO DE MODALIDADE */}
        {step === 0 && (
          <div className="space-y-8 bg-[#121418] border border-amber-900/30 p-8 md:p-12 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.4)] animate-in fade-in duration-500">
            <div className="space-y-4 text-center md:text-left">
              <span className="text-amber-400 text-xs font-semibold tracking-widest uppercase px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 inline-flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> DIAGNÓSTICO INSTITUCIONAL GRATUITO
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white leading-tight">
                Avaliação Gratuita de Atendimento e Vendas.
              </h2>
              <p className="text-base text-neutral-300 max-w-xl leading-relaxed">
                Descubra em menos de 1 minuto os gargalos invisíveis que fazem a sua empresa perder clientes no WhatsApp e receba a recomendação técnica dos nossos especialistas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Opção 1: Avaliação Rápida */}
              <button
                onClick={() => { setPath('express'); setStep(1); }}
                className="p-6 rounded-xl bg-[#0A0C0E] border border-neutral-800 hover:border-amber-500 text-left space-y-4 group transition-all cursor-pointer hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]"
              >
                <div className="w-11 h-11 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    Avaliação Rápida (1 Minuto)
                  </h3>
                  <p className="text-sm text-neutral-400 mt-1.5 leading-relaxed">
                    Descubra se a sua empresa está perdendo clientes no WhatsApp agora.
                  </p>
                </div>
                <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform pt-1">
                  <span>Iniciar Avaliação Rápida</span> <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              {/* Opção 2: Análise Completa */}
              <button
                onClick={() => { setPath('deep'); setStep(1); }}
                className="p-6 rounded-xl bg-[#0A0C0E] border border-neutral-800 hover:border-amber-400 text-left space-y-4 group transition-all cursor-pointer hover:shadow-[0_0_30px_rgba(251,191,36,0.15)] relative overflow-hidden"
              >
                <div className="absolute top-3 right-3 text-[10px] uppercase font-semibold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                  Recomendado
                </div>
                <div className="w-11 h-11 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    Análise Completa (Recomendado)
                  </h3>
                  <p className="text-sm text-neutral-400 mt-1.5 leading-relaxed">
                    Avaliação profunda dos gargalos de gestão, atendimento e perda de lucro.
                  </p>
                </div>
                <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform pt-1">
                  <span>Iniciar Análise Completa</span> <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* PASSO A PASSO (1 até N) */}
        {step > 0 && step <= totalSteps && (
          <div className="space-y-6 bg-[#121418] border border-amber-900/30 p-8 md:p-10 rounded-2xl shadow-2xl animate-in fade-in duration-300">
            
            {/* Barra de Progresso */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-neutral-400">
                <span>ETAPA {step} DE {totalSteps}</span>
                <span className="text-amber-400 font-semibold">{Math.round((step / totalSteps) * 100)}% CONCLUÍDO</span>
              </div>
              <div className="w-full h-1.5 bg-[#0A0C0E] rounded-full overflow-hidden border border-neutral-800">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* PERGUNTA 1: NOME DA EMPRESA */}
            {step === 1 && (
              <div className="space-y-5">
                <h3 className="font-serif text-2xl font-bold text-white leading-snug">
                  Qual é o nome da sua empresa, clínica ou estabelecimento?
                </h3>
                <input
                  type="text"
                  autoFocus
                  placeholder="Digite o nome da empresa..."
                  value={answers.empresa}
                  onChange={(e) => setAnswers({ ...answers, empresa: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl bg-[#0A0C0E] border border-neutral-800 text-white placeholder-neutral-500 focus:border-amber-500 focus:outline-none transition-colors text-base"
                />
              </div>
            )}

            {/* PERGUNTA 2: TEMPO DE RESPOSTA NO ZAP */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-white leading-snug">
                  Quanto tempo a sua equipe leva para responder um cliente no WhatsApp?
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Menos de 5 minutos (Atendimento Imediato)', val: 'Menos de 5 minutos' },
                    { label: 'Entre 5 e 30 minutos (Tempo Médio)', val: '5 a 30 minutos' },
                    { label: 'Mais de 30 minutos ou horas (Atendimento Lento)', val: 'Mais de 30 minutos' }
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setAnswers({ ...answers, tempoZap: item.val })}
                      className={`w-full p-4.5 rounded-xl text-left font-medium transition-all cursor-pointer flex items-center justify-between border ${
                        answers.tempoZap === item.val
                          ? 'bg-amber-500/10 border-amber-500 text-white'
                          : 'bg-[#0A0C0E] border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <span className="text-sm">{item.label}</span>
                      {answers.tempoZap === item.val && <CheckCircle2 className="w-5 h-5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PERGUNTA 3: PRESENÇA ONLINE / SITE */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-white leading-snug">
                  A sua empresa possui um site ou portal oficial próprio no Google?
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Sim, possuímos site próprio ativo', val: 'Sim, possui site' },
                    { label: 'Não temos site, usamos apenas Instagram ou Facebook', val: 'Apenas Redes Sociais' },
                    { label: 'Não possuímos site nem portal oficial', val: 'Não possui site' }
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setAnswers({ ...answers, hasSite: item.val })}
                      className={`w-full p-4.5 rounded-xl text-left font-medium transition-all cursor-pointer flex items-center justify-between border ${
                        answers.hasSite === item.val
                          ? 'bg-amber-500/10 border-amber-500 text-white'
                          : 'bg-[#0A0C0E] border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <span className="text-sm">{item.label}</span>
                      {answers.hasSite === item.val && <CheckCircle2 className="w-5 h-5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PERGUNTA 4 (DEEP DIVE): GESTÃO DE CONTATOS */}
            {step === 4 && path === 'deep' && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-white leading-snug">
                  Como a sua empresa organiza os contatos e clientes cadastrados?
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Em planilhas (Excel ou Google Sheets)', val: 'Planilha manual' },
                    { label: 'Em bloco de notas, agenda física ou não armazena', val: 'Bloco de notas / Não salva' },
                    { label: 'Em um sistema CRM automatizado', val: 'CRM automatizado' }
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setAnswers({ ...answers, contatosMgmt: item.val })}
                      className={`w-full p-4.5 rounded-xl text-left font-medium transition-all cursor-pointer flex items-center justify-between border ${
                        answers.contatosMgmt === item.val
                          ? 'bg-amber-500/10 border-amber-500 text-white'
                          : 'bg-[#0A0C0E] border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <span className="text-sm">{item.label}</span>
                      {answers.contatosMgmt === item.val && <CheckCircle2 className="w-5 h-5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PERGUNTA 5 (DEEP DIVE): SISTEMA ATUAL */}
            {step === 5 && path === 'deep' && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-white leading-snug">
                  Qual sistema de gestão ou caixa a empresa utiliza hoje?
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Sistema antigo instalado no computador (Offline)', val: 'Sistema antigo no computador' },
                    { label: 'Sistema em nuvem moderno (SaaS)', val: 'Sistema em nuvem' },
                    { label: 'Nenhum sistema / Anotações manuais', val: 'Nenhum / Anotação em papel' }
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setAnswers({ ...answers, sistemaAtual: item.val })}
                      className={`w-full p-4.5 rounded-xl text-left font-medium transition-all cursor-pointer flex items-center justify-between border ${
                        answers.sistemaAtual === item.val
                          ? 'bg-amber-500/10 border-amber-500 text-white'
                          : 'bg-[#0A0C0E] border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <span className="text-sm">{item.label}</span>
                      {answers.sistemaAtual === item.val && <CheckCircle2 className="w-5 h-5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PERGUNTA 6 (DEEP DIVE): GARGALO OPERACIONAL */}
            {step === 6 && path === 'deep' && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-white leading-snug">
                  Qual é o principal desafio da sua empresa no momento?
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Demora no atendimento via WhatsApp', val: 'Demora no atendimento via WhatsApp' },
                    { label: 'Perda de orçamentos e falta de acompanhamento', val: 'Perda de orçamentos' },
                    { label: 'Taxas de comissão elevadas do iFood ou intermediários', val: 'Taxas do iFood' },
                    { label: 'Falta de controle de estoque e vendas', val: 'Controle de estoque' }
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setAnswers({ ...answers, gargalo: item.val })}
                      className={`w-full p-4.5 rounded-xl text-left font-medium transition-all cursor-pointer flex items-center justify-between border ${
                        answers.gargalo === item.val
                          ? 'bg-amber-500/10 border-amber-500 text-white'
                          : 'bg-[#0A0C0E] border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <span className="text-sm">{item.label}</span>
                      {answers.gargalo === item.val && <CheckCircle2 className="w-5 h-5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Botões de Navegação */}
            <div className="flex justify-between items-center pt-6 border-t border-neutral-800">
              <button
                onClick={() => setStep((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                ← Voltar
              </button>

              {step < totalSteps ? (
                <button
                  disabled={step === 1 && !answers.empresa.trim()}
                  onClick={() => setStep((prev) => prev + 1)}
                  className="px-6 py-3 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                >
                  <span>PRÓXIMA ETAPA</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-black font-bold text-xs hover:opacity-95 transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(245,158,11,0.35)] cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'GERANDO AVALIAÇÃO...' : 'VER MEU DIAGNÓSTICO'}</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEPPER FINAL: RESULTADO DA AUDITORIA */}
        {submitted && (
          <div className="bg-[#121418] border border-amber-900/30 p-8 md:p-12 rounded-2xl text-center space-y-8 animate-in zoom-in-95 duration-500 shadow-[0_10px_50px_rgba(0,0,0,0.5)]">
            
            <div className="space-y-3">
              <span className="text-xs font-semibold text-amber-400 tracking-widest uppercase px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 inline-block">
                AVALIAÇÃO CONCLUÍDA COM SUCESSO
              </span>
              <h2 className="font-serif text-3xl font-bold text-white">
                Resultado do Diagnóstico: <span className="text-amber-400">{answers.empresa}</span>
              </h2>
            </div>

            {/* Cartão de Pontuação Institucional */}
            <div className={`p-8 rounded-2xl border max-w-sm mx-auto space-y-3 ${
              currentScore < 50 
                ? 'bg-red-950/20 border-red-500/40 text-red-400' 
                : 'bg-amber-950/20 border-amber-500/40 text-amber-300'
            }`}>
              <span className="text-xs font-medium uppercase tracking-wider block">PONTUAÇÃO DE PERFORMANCE DIGITAL</span>
              <div className="font-serif text-6xl font-bold tracking-tight">
                {currentScore}<span className="text-2xl text-neutral-500">/100</span>
              </div>
              <div className="text-xs font-semibold uppercase tracking-widest">
                {currentScore < 50 ? '⚠️ NECESSITA DE ADEQUAÇÃO IMEDIATA' : '🟢 POTENCIAL DE ESCALA COM AUTOMAÇÃO'}
              </div>
            </div>

            <p className="text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
              Sua empresa possui pontos de melhoria no atendimento. Clique abaixo para receber a orientação da diretoria técnica da Dactyla Code:
            </p>

            {/* Botão do WhatsApp Oficial Dactyla Code (+55 12 99187-9486) */}
            <div className="pt-2">
              <a
                href={generateWhatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full max-w-md mx-auto py-4 px-6 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(37,211,102,0.35)] cursor-pointer inline-flex"
              >
                <span>FALAR COM O ESPECIALISTA NO WHATSAPP</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <p className="text-xs text-neutral-500 font-sans flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" /> Atendimento direto dos Engenheiros da Dactyla Code (+55 12 99187-9486)
            </p>
          </div>
        )}

      </main>

    </div>
  );
}
