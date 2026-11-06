import React, { useState, useEffect } from 'react';
import {
  Zap, CheckCircle2, Clock, Upload, Send, ArrowLeft, Shield,
  Terminal, RefreshCw, Calendar, Sparkles, ExternalLink, Activity
} from 'lucide-react';

const NICHE_CONFIG = {
  oficina: {
    id: 'oficina',
    label: '🔧 Oficina / Troca de Óleo',
    ticket: 320,
    cycleDays: 150,
    itemPlaceholder: 'Ex: Gol G6 1.6 / Hilux / Onix',
    itemLabel: 'Veículo / Placa / Serviço',
    defaultItem: 'Gol G6 (Troca de Óleo + Filtros)',
  },
  petshop: {
    id: 'petshop',
    label: '🐾 Pet Shop / Banho & Tosa',
    ticket: 85,
    cycleDays: 30,
    itemPlaceholder: 'Ex: Thor (Golden) / Mel (Shih Tzu)',
    itemLabel: 'Nome do Pet / Raça',
    defaultItem: 'Thor (Banho & Tosa Higiênica)',
  },
  barbearia: {
    id: 'barbearia',
    label: '💈 Barbearia & Estética',
    ticket: 75,
    cycleDays: 21,
    itemPlaceholder: 'Ex: Combo Degradê + Barba Terapia',
    itemLabel: 'Procedimento / Estilo',
    defaultItem: 'Combo Corte Degradê + Barba',
  },
};

function resolveSpintaxClient(template) {
  if (!template) return '';
  let result = String(template);
  const regex = /\{([^{}]+)\}/g;
  let guard = 0;
  while (regex.test(result) && guard < 20) {
    result = result.replace(regex, (_, group) => {
      const opts = group.split('|');
      return opts[Math.floor(Math.random() * opts.length)];
    });
    guard++;
  }
  return result;
}

function generatePlaybookPreview({ niche, campaignType, storeName, customerName, itemPetOrCar, daysInactive }) {
  const nome = customerName || 'Cliente';
  const item = itemPetOrCar || NICHE_CONFIG[niche]?.defaultItem || 'seu atendimento';
  const loja = storeName || 'Nossa Loja';
  const dias = Number(daysInactive || NICHE_CONFIG[niche]?.cycleDays || 60);

  if (campaignType === 'SERVICO_CONCLUIDO') {
    if (niche === 'oficina') {
      return resolveSpintaxClient(
        `{Fala|Opa} ${nome}, {tudo certo|tudo joia}? Avisando aqui da *${loja}* que o serviço do seu *${item}* {já foi concluído com sucesso|já está 100% pronto e revisado no box}! 🔧 Quando quiser {vir buscar|passar aqui pra retirar}, já está liberado na frente pra você.`
      );
    }
    if (niche === 'petshop') {
      return resolveSpintaxClient(
        `{Oi|Olá} ${nome}, {tudo bem|tudo ótimo}? Passando aqui do *${loja}* pra avisar que o(a) *${item}* já está {prontinho(a), cheiroso(a) e te esperando|100% pronto(a) do banho e tosa}! 🐶✨ Assim que puder vir buscar, é só chamar na recepção!`
      );
    }
    return resolveSpintaxClient(
      `{Fala|Opa} ${nome}, tudo certo? Passando aqui da *${loja}* 💈 pra confirmar que o seu *${item}* foi registrado e seu próximo retorno preditivo já está garantido!`
    );
  }

  if (campaignType === 'OFERTA_TERCA_QUARTA') {
    if (niche === 'oficina') {
      return resolveSpintaxClient(
        `{Fala|Opa} ${nome}, beleza? Aqui é da *${loja}*. Como {terça e quarta|no meio da semana} o movimento no box é mais tranquilo, liberamos *check-up gratuito de 15 itens + higienização do ar de cortesia* na troca de óleo do seu *${item}* para os próximos 5 clientes que agendarem pra amanhã ou quarta. {Quer aproveitar e já deixar reservado?|Posso segurar uma vaga pro seu carro?}`
      );
    }
    if (niche === 'petshop') {
      return resolveSpintaxClient(
        `{Oi|Olá} ${nome}, tudo bem? Aqui é do *${loja}* 🐾. Liberamos a nossa *Terça & Quarta Vip*: agendando o banho do(a) *${item}* para terça ou quarta-feira agora, {a hidratação de pelos sai de presente|você ganha a hidratação especial de cortesia}! Temos só 4 vagas disponíveis. {Quer que eu separe uma vaga pra vocês?|Vamos aproveitar essa semana?}`
      );
    }
    return resolveSpintaxClient(
      `{Fala|E aí} ${nome}, tranquilo? Aqui é da *${loja}* 💈. Pra quem curte cortar sem pressa no meio da semana, liberamos a condição especial de *Terça e Quarta* no *${item}* com {toalha quente e finalização premium inclusa|condição especial no combo}. {Quer garantir um horário amanhã ou quarta?|Qual horário fica top pra você?}`
    );
  }

  // REATIVACAO_PREDITIVA
  if (niche === 'oficina') {
    return resolveSpintaxClient(
      `{Fala|Opa|Bom dia} ${nome}, {tudo bem|tudo joia}? Aqui é da *${loja}*. O sistema me avisou aqui que já faz uns ${dias} dias desde a última manutenção do seu *${item}*. Como já bateu o ciclo de segurança {do óleo e dos filtros|da revisão preventiva}, separei {2 horários|uma vaga rápida no box} pra essa semana pra gente dar um check-up sem fila. {Prefere passar na terça ou na quarta?|Como está sua rotina essa semana?}`
    );
  }
  if (niche === 'petshop') {
    return resolveSpintaxClient(
      `{Oi|Olá|Opa} ${nome}, {tudo bem|tudo joia}? Aqui é da equipe do *${loja}* 🐾. Passando porque já deu ${dias} dias desde o último banho de *${item}* e {a galerinha aqui já está com saudade|já chegou a época de renovar o banho e a hidratação}! Temos {horários tranquilos|vagas sem espera} essa semana. {Quer que eu já deixe reservado o horário dele(a)?|Qual melhor horário pra você trazer?}`
    );
  }
  return resolveSpintaxClient(
    `{Fala|E aí|Opa} ${nome}, {tudo tranquilo|tudo certo}? Aqui é da *${loja}* 💈. Vi aqui que já passaram ${dias} dias desde o seu último *${item}* — já tá na hora de {dar aquele talento no visual|alinhar o degradê e a barba}, hein! Essa semana ainda tenho {2 horários bons no final da tarde|alguns encaixes tranquilos na terça e na quarta}. {Bora garantir seu horário?|Qual dia fica melhor pra você colar aqui?}`
  );
}

const DEFAULT_BATCH_TEXT = `Marcos Silva, 12997112233, Gol G6 1.6, 160
Roberto Almeida, 12997445566, Hilux SRV, 185
Carlos Eduardo, 12981223344, Onix LTZ, 152
Fernando Costa, 12992334455, Corolla XEi, 175
Paulo Henrique, 12988776655, Toro Freedom, 190`;

export default function MerchantCounterApp({ onBack }) {
  const [activeTab, setActiveTab] = useState('balcao'); // 'balcao' | 'reativacao48h' | 'terca_quarta' | 'appliance'
  const [storeName, setStoreName] = useState('Centro Automotivo Litoral');
  const [niche, setNiche] = useState('oficina');

  // Estado Aba 1: Aviso 1-Clique de Serviço Pronto
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [itemPetOrCar, setItemPetOrCar] = useState('');
  const [sendingReady, setSendingReady] = useState(false);
  const [lastTriggeredEvent, setLastTriggeredEvent] = useState(null);

  // Estado Aba 2: Lote 48h de Clientes Inativos
  const [rawBatchInput, setRawBatchInput] = useState(DEFAULT_BATCH_TEXT);
  const [parsedQueue, setParsedQueue] = useState([]);

  // Estado Aba 4 & Histórico
  const [eventsLog, setEventsLog] = useState([]);
  const [localDaemonOnline, setLocalDaemonOnline] = useState(false);
  const [dailyCount, setDailyCount] = useState(0);

  const currentNicheCfg = NICHE_CONFIG[niche];

  const liveReadyPreview = generatePlaybookPreview({
    niche,
    campaignType: activeTab === 'terca_quarta' ? 'OFERTA_TERCA_QUARTA' : 'SERVICO_CONCLUIDO',
    storeName,
    customerName: customerName || 'Marcos',
    itemPetOrCar: itemPetOrCar || currentNicheCfg.defaultItem,
    daysInactive: 0,
  });

  // Verifica se o Appliance Local (http://127.0.0.1:4848) está ativo no PC do comércio e carrega eventos da nuvem
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/merchant-trigger');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.events)) {
            setEventsLog(data.events);
            setDailyCount(Math.min(20, data.events.length));
          }
        }
      } catch (e) {}

      try {
        const localRes = await fetch('http://127.0.0.1:4848/api/status', { method: 'GET' });
        if (localRes.ok) {
          setLocalDaemonOnline(true);
        }
      } catch (e) {
        setLocalDaemonOnline(false);
      }
    };

    checkStatus();
  }, []);

  // Processa a lista colada no Importador Universal 48h
  useEffect(() => {
    const lines = rawBatchInput
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const parsed = lines.slice(0, 60).map((line, index) => {
      const parts = line.split(/[,\t;|]/).map((p) => p.trim());
      const name = parts[0] || `Cliente ${index + 1}`;
      const rawPhone = (parts[1] || '12992109408').replace(/\D/g, '');
      const formattedPhone = rawPhone.startsWith('55')
        ? rawPhone
        : rawPhone.length <= 9
        ? `5512${rawPhone}`
        : `55${rawPhone}`;
      const item = parts[2] || currentNicheCfg.defaultItem;
      const days = parseInt(parts[3] || String(currentNicheCfg.cycleDays + 15), 10);

      const message = generatePlaybookPreview({
        niche,
        campaignType: 'REATIVACAO_PREDITIVA',
        storeName,
        customerName: name,
        itemPetOrCar: item,
        daysInactive: days,
      });

      return {
        id: `batch_${index + 1}`,
        name,
        phone: formattedPhone,
        item,
        days,
        message,
        waUrl: `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`,
      };
    });

    setParsedQueue(parsed);
  }, [rawBatchInput, niche, storeName, currentNicheCfg]);

  const handleSelectNiche = (newNiche) => {
    setNiche(newNiche);
    if (newNiche === 'oficina' && storeName.includes('Pet')) setStoreName('Centro Automotivo Litoral');
    if (newNiche === 'petshop' && storeName.includes('Automotivo')) setStoreName('Pet Shop Caiçara');
    if (newNiche === 'barbearia') setStoreName('Barbearia Costa Norte');
  };

  const handleTriggerSingleMessage = async (e, overrideCampaignType) => {
    e.preventDefault();
    if (!customerName || !customerPhone) return;

    setSendingReady(true);
    const campaignType = overrideCampaignType || 'SERVICO_CONCLUIDO';
    const messagePreview = generatePlaybookPreview({
      niche,
      campaignType,
      storeName,
      customerName,
      itemPetOrCar: itemPetOrCar || currentNicheCfg.defaultItem,
      daysInactive: 0,
    });

    try {
      // 1. Tenta disparar silenciosamente no Appliance Local da loja se estiver online
      if (localDaemonOnline) {
        await fetch('http://127.0.0.1:4848/api/service-ready', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeName,
            niche,
            campaignType,
            customerName,
            customerPhone,
            itemPetOrCar: itemPetOrCar || currentNicheCfg.defaultItem,
            messagePreview,
          }),
        }).catch(() => {});
      }

      // 2. Registra no endpoint Serverless da Vercel e agenda o próximo ciclo preditivo
      const res = await fetch('/api/merchant-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName,
          niche,
          campaignType,
          customerName,
          customerPhone,
          itemPetOrCar: itemPetOrCar || currentNicheCfg.defaultItem,
          daysInactive: 0,
          messagePreview,
        }),
      });

      const data = await res.json();
      if (data?.event) {
        setLastTriggeredEvent(data.event);
        setEventsLog((prev) => [data.event, ...prev]);
        setDailyCount((prev) => Math.min(20, prev + 1));
      }
    } catch (err) {
      console.error('Erro ao registrar disparo no balcão:', err);
    } finally {
      setSendingReady(false);
    }
  };

  const estimatedConversionCount = Math.max(1, Math.round(parsedQueue.length * 0.25));
  const estimatedBatchRevenue = estimatedConversionCount * currentNicheCfg.ticket;

  return (
    <div className="min-h-screen bg-[#0A140E] text-[#E8F0EA] flex flex-col font-sans selection:bg-[#D4AF37] selection:text-[#0A140E] antialiased">
      {/* Top Bar */}
      <header className="bg-[#070E0A] border-b border-[#D4AF37]/30 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#D4AF37] shadow-[0_0_12px_#D4AF37]" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-serif text-xl font-bold text-[#E8F0EA]">
                Dactyla Appliance // Balcão Plug-and-Play
              </h1>
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40 font-bold">
                MOTOR 48H ATIVO
              </span>
              <span
                className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded border flex items-center gap-1.5 ${
                  localDaemonOnline
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                    : 'bg-[#28593B]/30 text-[#E8F0EA]/80 border-[#28593B]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {localDaemonOnline ? 'Daemon Local :4848 Conectado' : 'Modo Cloud + 1-Clique Ativo'}
              </span>
            </div>
            <p className="text-xs text-[#E8F0EA]/55 font-mono mt-0.5">
              Cota Diária Anti-Ban da Loja: <strong className="text-[#D4AF37]">{dailyCount}/20 disparos hoje</strong> • Taxa por mensagem: <strong className="text-emerald-400">R$ 0,00</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {Object.values(NICHE_CONFIG).map((cfg) => (
            <button
              key={cfg.id}
              type="button"
              onClick={() => handleSelectNiche(cfg.id)}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer border ${
                niche === cfg.id
                  ? 'bg-[#D4AF37] text-[#0A140E] border-[#D4AF37] font-bold'
                  : 'bg-[#0A140E] text-[#E8F0EA]/70 border-[#28593B]/50 hover:border-[#D4AF37]/50'
              }`}
            >
              {cfg.label}
            </button>
          ))}

          {onBack && (
            <button
              onClick={onBack}
              className="px-3.5 py-1.5 rounded bg-[#112017] hover:bg-[#28593B]/40 text-xs font-mono text-[#E8F0EA] border border-[#28593B]/50 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Voltar ao Site</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        {/* Store Identity & Navigation Tabs */}
        <div className="bg-[#070E0A] border border-[#28593B]/40 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-xs font-mono uppercase tracking-wider text-[#D4AF37]">
              Estabelecimento Ativo:
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="px-3.5 py-2 rounded bg-[#0A140E] border border-[#28593B]/60 focus:border-[#D4AF37] text-sm text-[#E8F0EA] font-medium focus:outline-none w-full sm:w-72"
            />
            <span className="text-xs font-mono text-[#E8F0EA]/50">
              Ciclo Preditivo: <strong className="text-[#D4AF37]">{currentNicheCfg.cycleDays} dias</strong> | Ticket Médio: <strong className="text-[#D4AF37]">R$ {currentNicheCfg.ticket}</strong>
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'balcao', label: '1. Aviso Serviço Pronto (1-Clique)' },
              { id: 'reativacao48h', label: '2. Motor Reativação 48h (60 Inativos)' },
              { id: 'terca_quarta', label: '3. Lotar Terça & Quarta' },
              { id: 'appliance', label: '4. Kit Plug-and-Play Local' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer border ${
                  activeTab === tab.id
                    ? 'bg-[#D4AF37] text-[#0A140E] border-[#D4AF37] font-bold shadow-[0_0_20px_rgba(212,175,55,0.25)]'
                    : 'bg-[#0A140E] text-[#E8F0EA]/75 border-[#28593B]/40 hover:border-[#D4AF37]/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── TAB 1 & TAB 3: AVISO 1-CLIQUE DE SERVIÇO PRONTO OU OFERTA TERÇA/QUARTA ─── */}
        {(activeTab === 'balcao' || activeTab === 'terca_quarta') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form
              onSubmit={(e) =>
                handleTriggerSingleMessage(
                  e,
                  activeTab === 'terca_quarta' ? 'OFERTA_TERCA_QUARTA' : 'SERVICO_CONCLUIDO'
                )
              }
              className="lg:col-span-6 bg-[#070E0A] border border-[#D4AF37]/30 rounded-2xl p-6 md:p-8 space-y-5 shadow-xl"
            >
              <div className="space-y-1 border-b border-[#28593B]/30 pb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-[#D4AF37]">
                  {activeTab === 'terca_quarta'
                    ? 'PLAYBOOK 03 // PREENCHIMENTO DE HORÁRIOS OCIOSOS'
                    : 'PLAYBOOK 02 // LIBERAÇÃO RÁPIDA DE BOX / GAIOLA + AGENDAMENTO PREDITIVO'}
                </span>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#E8F0EA]">
                  {activeTab === 'terca_quarta'
                    ? 'Disparo Relâmpago de Terça & Quarta'
                    : 'Avisar "Serviço Pronto" com 1 Clique'}
                </h2>
                <p className="text-xs text-[#E8F0EA]/65">
                  {activeTab === 'terca_quarta'
                    ? 'Oferece condição especial para encher o box, banho & tosa ou cadeira nos dias mais fracos da semana.'
                    : `Envia o aviso de retirada no WhatsApp do cliente e já programa automaticamente a reativação preditiva para daqui a ${currentNicheCfg.cycleDays} dias.`}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-[#E8F0EA]/80 block mb-1.5">
                    NOME DO CLIENTE *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Marcos Oliveira"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#0A140E] border border-[#28593B]/60 focus:border-[#D4AF37] text-sm text-[#E8F0EA] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-[#E8F0EA]/80 block mb-1.5">
                    WHATSAPP DO CLIENTE (DDD 12) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: (12) 99711-2233"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#0A140E] border border-[#28593B]/60 focus:border-[#D4AF37] text-sm text-[#E8F0EA] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-[#E8F0EA]/80 block mb-1.5">
                    {currentNicheCfg.itemLabel.toUpperCase()} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={currentNicheCfg.itemPlaceholder}
                    value={itemPetOrCar}
                    onChange={(e) => setItemPetOrCar(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#0A140E] border border-[#28593B]/60 focus:border-[#D4AF37] text-sm text-[#E8F0EA] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={sendingReady}
                className="w-full py-4 px-6 rounded-xl bg-[#D4AF37] hover:bg-[#E8F0EA] text-[#0A140E] font-mono text-xs md:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(212,175,55,0.3)]"
              >
                <Send className="w-4 h-4" />
                <span>
                  {sendingReady
                    ? 'PROCESSANDO DISPARO + AGENDAMENTO...'
                    : activeTab === 'terca_quarta'
                    ? 'GERAR & DISPARAR CONVITE DE TERÇA/QUARTA'
                    : `AVISAR CLIENTE + AGENDAR RETORNO EM ${currentNicheCfg.cycleDays} DIAS`}
                </span>
              </button>
            </form>

            {/* Right Column: Live Spintax Preview & Confirmation */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-[#070E0A] border border-[#28593B]/50 rounded-2xl p-6 md:p-8 space-y-4">
                <div className="flex items-center justify-between border-b border-[#28593B]/30 pb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#D4AF37]">
                    PREVIEW DA MENSAGEM HUMANA (SPINTAX ANTI-BAN)
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400">
                    Typing: 4.0s • Custo: R$ 0,00
                  </span>
                </div>

                <div className="p-5 rounded-xl bg-[#0A140E] border border-[#28593B]/40 text-sm text-[#E8F0EA]/90 leading-relaxed font-sans">
                  {liveReadyPreview}
                </div>

                {lastTriggeredEvent && (
                  <div className="p-5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> GATILHO REGISTRADO COM SUCESSO!
                      </span>
                      <span className="text-[11px] font-mono text-[#D4AF37]">
                        Retorno Preditivo: {lastTriggeredEvent.nextReactivationDate}
                      </span>
                    </div>
                    <p className="text-xs text-[#E8F0EA]/80">
                      Cliente <strong>{lastTriggeredEvent.customerName}</strong> ({lastTriggeredEvent.itemPetOrCar}) agendado automaticamente para reativação em{' '}
                      <strong>{lastTriggeredEvent.cycleDays} dias</strong>.
                    </p>
                    <a
                      href={lastTriggeredEvent.waDirectLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                    >
                      <span>Abrir Conversa Direta no WhatsApp</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Recent Counter Events */}
              <div className="bg-[#070E0A] border border-[#28593B]/40 rounded-2xl p-6 space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#D4AF37]">
                  HISTÓRICO DE ATENDIMENTOS &amp; RETORNOS PROGRAMADOS ({eventsLog.length})
                </h3>
                {eventsLog.length === 0 ? (
                  <p className="text-xs text-[#E8F0EA]/45 font-mono">
                    Nenhum disparo registrado nesta sessão ainda. Preencha o formulário ao lado para testar.
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {eventsLog.slice(0, 8).map((ev) => (
                      <div
                        key={ev.id}
                        className="p-3 rounded-lg bg-[#0A140E] border border-[#28593B]/30 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <span className="font-bold text-[#E8F0EA]">{ev.customerName}</span>{' '}
                          <span className="text-[#D4AF37]">({ev.itemPetOrCar})</span>
                          <span className="block text-[10px] font-mono text-[#E8F0EA]/50">
                            Campanha: {ev.campaignType} • Próxima Reativação: {ev.nextReactivationDate}
                          </span>
                        </div>
                        <a
                          href={ev.waDirectLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30 font-mono text-[10px] hover:bg-[#25D366] hover:text-black font-bold shrink-0"
                        >
                          WhatsApp ↗
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: MOTOR DE REATIVAÇÃO 48H (IMPORTADOR UNIVERSAL DE 60 INATIVOS) ─── */}
        {activeTab === 'reativacao48h' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 bg-[#070E0A] border border-[#D4AF37]/30 rounded-2xl p-6 md:p-8 space-y-5">
              <div className="space-y-1 border-b border-[#28593B]/30 pb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-[#D4AF37]">
                  PROTOCOLO RISCO ZERO // LOTE DE VALIDAÇÃO 48H
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#E8F0EA]">
                  Importador Universal de Inativos
                </h2>
                <p className="text-xs text-[#E8F0EA]/65">
                  Cole abaixo até 60 clientes que passaram do ciclo de {currentNicheCfg.cycleDays} dias (formato:{' '}
                  <code className="text-[#D4AF37]">Nome, Telefone, Veículo/Pet, Dias Inativo</code>).
                </p>
              </div>

              <textarea
                rows={9}
                value={rawBatchInput}
                onChange={(e) => setRawBatchInput(e.target.value)}
                className="w-full p-4 rounded-xl bg-[#0A140E] border border-[#28593B]/60 focus:border-[#D4AF37] text-xs font-mono text-[#E8F0EA] focus:outline-none leading-relaxed"
              />

              <div className="p-4 rounded-xl bg-[#0A140E] border border-[#D4AF37]/30 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#E8F0EA]/60">Clientes na Fila de 48h:</span>
                  <span className="text-[#D4AF37] font-bold">{parsedQueue.length} clientes</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#E8F0EA]/60">Retornos Estimados (25% conv.):</span>
                  <span className="text-emerald-400 font-bold">~{estimatedConversionCount} agendamentos</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-[#28593B]/30">
                  <span className="text-[#E8F0EA]/80">Caixa Projetado no Teste 48h:</span>
                  <span className="text-base font-bold text-[#D4AF37]">
                    R$ {estimatedBatchRevenue.toLocaleString('pt-BR')},00
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#070E0A] border border-[#28593B]/50 rounded-2xl p-6 md:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#28593B]/30 pb-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#D4AF37] block">
                    FILA GERADA COM SPINTAX INDIVIDUAL ({parsedQueue.length} REGISTROS)
                  </span>
                  <p className="text-xs text-[#E8F0EA]/55">
                    Jitter Anti-Ban: 45s a 120s • Trava Diária: 20/dia por loja
                  </p>
                </div>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {parsedQueue.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-[#0A140E] border border-[#28593B]/40 hover:border-[#D4AF37]/50 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] font-mono text-[10px] font-bold">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-sm text-[#E8F0EA]">{item.name}</span>
                        <span className="text-xs font-mono text-[#D4AF37]">• {item.item}</span>
                      </div>
                      <span className="text-[11px] font-mono text-[#E8F0EA]/50">
                        Inativo há {item.days} dias • +{item.phone}
                      </span>
                    </div>

                    <p className="text-xs text-[#E8F0EA]/80 bg-[#070E0A] p-3 rounded-lg border border-[#28593B]/25 leading-relaxed">
                      "{item.message}"
                    </p>

                    <div className="flex justify-end">
                      <a
                        href={item.waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Send className="w-3 h-3" />
                        <span>Disparar Agora no WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 4: KIT PLUG-AND-PLAY DE INSTALAÇÃO NO COMÉRCIO ─── */}
        {activeTab === 'appliance' && (
          <div className="bg-[#070E0A] border border-[#D4AF37]/30 rounded-2xl p-6 md:p-10 space-y-8">
            <div className="space-y-2 border-b border-[#28593B]/30 pb-6">
              <span className="text-xs font-mono uppercase tracking-widest text-[#D4AF37]">
                ARQUITETURA ON-PREMISE // KIT PLUG-AND-PLAY DE BALCÃO (dactyla_store_appliance)
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#E8F0EA]">
                Instalação Plug-and-Play em 2 Minutos nas Dependências do Comércio
              </h2>
              <p className="text-sm text-[#E8F0EA]/70 max-w-3xl leading-relaxed">
                Para lojas que possuem banco de dados antigo no PC do caixa (Firebird <code className="text-[#D4AF37]">.fdb</code>, SQLite, planilhas ou exportação de PDV), o pacote{' '}
                <code className="text-[#D4AF37]">dactyla_store_appliance/</code> extrai automaticamente os 60 clientes inativos e conecta o WhatsApp da loja sem exigir conhecimento técnico do comerciante.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-[#0A140E] border border-[#28593B]/40 space-y-3">
                <span className="text-xs font-mono text-[#D4AF37] font-bold">PASSO 01 // EXTRATOR UNIVERSAL</span>
                <h3 className="text-lg font-serif font-bold text-[#E8F0EA]">
                  Varredura Automática de Inativos
                </h3>
                <p className="text-xs text-[#E8F0EA]/70 leading-relaxed">
                  O script <code className="text-[#D4AF37]">universal_inactives_extractor.py</code> lê bancos Firebird, SQLite ou CSVs da loja, filtra celulares válidos (DDD 12 + dígito 9) que passaram de 150d/30d/21d e gera a fila de 60 clientes para o Teste de 48h.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-[#0A140E] border border-[#28593B]/40 space-y-3">
                <span className="text-xs font-mono text-[#D4AF37] font-bold">PASSO 02 // DAEMON LOCAL :4848</span>
                <h3 className="text-lg font-serif font-bold text-[#E8F0EA]">
                  Micro-Servidor Local-First
                </h3>
                <p className="text-xs text-[#E8F0EA]/70 leading-relaxed">
                  O serviço <code className="text-[#D4AF37]">store_local_server.cjs</code> roda em segundo plano no Windows da loja (ou no servidor central via Cloudflare Tunnel), aplicando Jitter de 45s-120s e trava de 20 envios/dia.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-[#0A140E] border border-[#28593B]/40 space-y-3">
                <span className="text-xs font-mono text-[#D4AF37] font-bold">PASSO 03 // INSTALADOR 1-CLIQUE</span>
                <h3 className="text-lg font-serif font-bold text-[#E8F0EA]">
                  Setup PowerShell Automatizado
                </h3>
                <p className="text-xs text-[#E8F0EA]/70 leading-relaxed">
                  Basta executar <code className="text-[#D4AF37]">install_store_agent.ps1</code> no computador da loja para configurar o ambiente, extrair a base inativa e abrir o QR Code de pareamento.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#050706] border border-[#28593B]/50 font-mono text-xs space-y-2 overflow-x-auto">
              <div className="text-[#D4AF37] font-bold mb-2">
                # Comandos Rápidos de Implantação no Comércio (PowerShell / Terminal):
              </div>
              <div className="text-[#E8F0EA]/90">
                powershell -ExecutionPolicy Bypass -File .\dactyla_store_appliance\install_store_agent.ps1 -StoreName "{storeName}" -Niche "{niche}"
              </div>
              <div className="text-[#E8F0EA]/60 pt-2">
                # Ou para extrair 60 clientes inativos de um arquivo CSV/FDB/SQLite e testar em Dry-Run:
              </div>
              <div className="text-[#E8F0EA]/90">
                python .\dactyla_store_appliance\universal_inactives_extractor.py --niche {niche} --store "{storeName}"
              </div>
              <div className="text-[#E8F0EA]/90">
                node .\dactyla_prospector\client_reactivation_engine.cjs --file .\dactyla_store_appliance\store_inactives_queue.json --dry-run
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
