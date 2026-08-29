/**
 * DACTYLA CODE // AGÊNCIA DE TECNOLOGIA
 * CLOSER DE VENDAS AUTOMÁTICO DE WHATSAPP (whatsapp-web.js)
 * Extension: .cjs (CommonJS isolado de parent ES modules)
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const https = require('https');
const http = require('http');

// ----------------------------------------------------------------------
// CONFIGURAÇÕES DA NUVEM E APIS
// ----------------------------------------------------------------------
const PROSPECTOR_API_KEY = process.env.PROSPECTOR_API_KEY || "dactyla_prospector_secret_2026";
const CLOUD_SYNC_URL = process.env.CLOUD_SYNC_URL || "https://www.dactylacode.com.br/api/leads-sync";

// Cores ANSI para Terminal Corporativo
const LOG_COLORS = {
  reset: '\x1b[0m',
  gold: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  gray: '\x1b[90m'
};

function logEvent(status, phone, text) {
  const time = new Date().toLocaleTimeString('pt-BR');
  console.log(
    `${LOG_COLORS.gray}[${time}]${LOG_COLORS.reset} ${LOG_COLORS.gold}[${status}]${LOG_COLORS.reset} ${LOG_COLORS.cyan}${phone}${LOG_COLORS.reset}: ${text}`
  );
}

// ----------------------------------------------------------------------
// MÁQUINA DE ESTADOS & MEMÓRIA DE SESSÃO
// ----------------------------------------------------------------------
const userState = new Map();
const processingUsers = new Set();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ----------------------------------------------------------------------
// 1. ROTEADOR DE INTENÇÕES (NLP LOCAL - PROTOCOLO GAME CHANGER)
// ----------------------------------------------------------------------
function classifyIntent(text) {
  const lower = String(text || '').toLowerCase().trim();

  // Rejeição Direta / Opt-Out
  if (/não quero|nao quero|sem interesse|pare|remover|remova|cancela|sair|não tenho interesse|nao tenho interesse/i.test(lower)) {
    return 'REJECTION';
  }

  // Objeção de Preço (ROI Focus)
  if (/caro|preço|preco|valor|orçamento|orcamento|custa|quanto é|quanto e|dinheiro|pagar|investimento/i.test(lower)) {
    return 'PRICE_OBJECTION';
  }

  // Objeção de Tempo (Micro-compromisso)
  if (/ocupado|depois|semana que vem|amanhã|amanha|mais tarde|me liga|horário|horario|agora não|agora nao/i.test(lower)) {
    return 'TIME_OBJECTION';
  }

  // Interesse / Dúvida / Resposta ao Gargalo (Tráfego / Automação / Agendamento)
  if (/tráfego|trafego|automação|automacao|clientes|vendas|site|whatsapp|atendimento|sim|com certeza|interessante|funciona|como/i.test(lower)) {
    return 'INTEREST';
  }

  return 'UNKNOWN';
}

// ----------------------------------------------------------------------
// 2. ALGORITMO DE DIGITAÇÃO DINÂMICA (WPM MATEMÁTICA)
// ----------------------------------------------------------------------
function calculateTypingDuration(text) {
  const charCount = text ? text.length : 15;
  const duration = Math.round(charCount * 185);
  return Math.min(Math.max(duration, 1800), 7500);
}

async function sendHumanizedMessage(chat, text) {
  const duration = calculateTypingDuration(text);
  await chat.sendStateTyping();
  await sleep(duration);
  await chat.sendMessage(text);
}

// ----------------------------------------------------------------------
// 3. SINCRONIZAÇÃO 2-WAY COM CRM VERCEL (WEBHOOK INTERNO)
// ----------------------------------------------------------------------
function syncLeadStageToCloud(companyName, phone, stage) {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    
    const payloadData = JSON.stringify({
      leads: [
        {
          empresa: companyName || `Lead +${formattedPhone}`,
          telefone: `+${formattedPhone}`,
          stage: stage,
          status_campanha: `QUALIFICADO_BOT_${stage.toUpperCase()}`
        }
      ]
    });

    const parsedUrl = new URL(CLOUD_SYNC_URL);
    const transport = parsedUrl.protocol === 'https:' ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payloadData),
        'x-prospector-key': PROSPECTOR_API_KEY
      }
    };

    const req = transport.request(options, (res) => {
      if (res.statusCode === 200) {
        logEvent('CRM SYNC OK', formattedPhone, `Card movido automaticamente para '${stage}' no Kanban Vercel`);
      }
    });

    req.on('error', (err) => {});

    req.write(payloadData);
    req.end();
  } catch (e) {}
}

// ----------------------------------------------------------------------
// INICIALIZAÇÃO DO CLIENTE WHATSAPP WEB
// ----------------------------------------------------------------------
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
  puppeteer: {
    headless: true,
    args: ['--disable-dev-shm-usage']
  }
});

client.on('qr', (qr) => {
  console.clear();
  console.log(`${LOG_COLORS.gold}=====================================================${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.gold}   DACTYLA CODE // ESCANEIE O QR CODE NO SEU WHATSAPP ${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.gold}=====================================================${LOG_COLORS.reset}\n`);
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log(`\n${LOG_COLORS.green}=====================================================${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.green} [OK] CLOSER DE VENDAS DACTYLA CODE OPERACIONAL (24/7)!${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.green}=====================================================${LOG_COLORS.reset}\n`);
});

// ----------------------------------------------------------------------
// FLUXO PRINCIPAL DO CLOSER AUTOMÁTICO
// ----------------------------------------------------------------------
client.on('message', async (msg) => {
  try {
    if (msg.from.endsWith('@g.us')) return;
    if (msg.from === 'status@broadcast') return;
    if (msg.fromMe) return;

    const userId = msg.from;
    const cleanPhone = userId.replace(/\D/g, '');

    if (processingUsers.has(userId)) return;

    let state = userState.get(userId) || {
      stage: 'INIT',
      unknownCount: 0,
      isHumanRequired: false,
      isOptedOut: false,
      companyName: ''
    };

    if (state.isHumanRequired || state.isOptedOut) {
      logEvent('SILÊNCIO IA', cleanPhone, 'Atendimento Humano ou Opt-Out ativo. Bot em espera.');
      return;
    }

    processingUsers.add(userId);
    const chat = await msg.getChat();
    const intent = classifyIntent(msg.body);

    if (intent === 'REJECTION') {
      state.isOptedOut = true;
      userState.set(userId, state);
      logEvent('REJEIÇÃO / OPT-OUT', cleanPhone, 'Lead optou por sair do funil.');
      await sendHumanizedMessage(
        chat,
        'Entendido perfeitamente! Agradeço a atenção e desejamos muito sucesso nos seus negócios.'
      );
      processingUsers.delete(userId);
      return;
    }

    if (intent === 'PRICE_OBJECTION') {
      logEvent('OBJEÇÃO DE PREÇO', cleanPhone, 'Injetando argumento de ROI');
      await sendHumanizedMessage(
        chat,
        'Compreendo perfeitamente a atenção ao investimento. A nossa infraestrutura foi projetada exatamente para se pagar no primeiro mês: quando seu WhatsApp atende em 1 segundo, você recupera as vendas que hoje perde para a concorrência por demora.'
      );
      await sendHumanizedMessage(
        chat,
        'Vocês teriam 10 minutos nesta semana para o Gabriel te mostrar na prática como essa tecnologia gera caixa antes de você tomar qualquer decisão?'
      );
      processingUsers.delete(userId);
      return;
    }

    if (intent === 'TIME_OBJECTION') {
      logEvent('OBJEÇÃO DE TEMPO', cleanPhone, 'Injetando micro-compromisso');
      await sendHumanizedMessage(
        chat,
        'Sem problemas! Sabemos como a rotina corporativa é corrida. Para não tomar seu tempo, você mesmo pode escolher um slot de 15 min direto na agenda do Gabriel quando estiver livre:'
      );
      await sendHumanizedMessage(
        chat,
        'https://cal.com/agenciadactylacode-ddyia5/30min 📅'
      );
      processingUsers.delete(userId);
      return;
    }

    if (state.stage === 'INIT') {
      state.stage = 'QUALIFYING';
      userState.set(userId, state);

      logEvent('LEAD NOVO', cleanPhone, 'Iniciando Script Game Changer (Passo 1)');

      await sendHumanizedMessage(
        chat,
        'Olá! Aqui é a Inteligência Artificial da Dactyla Code. 🚀 Confirmo que o Gabriel e o Matheus já estão cientes do seu retorno!'
      );

      await sendHumanizedMessage(
        chat,
        'Como nossa agência foca em acelerar negócios aqui na região, nós criamos ecossistemas como este que você está falando agora: robôs que atendem em 1 segundo e não deixam nenhum lead esfriar.'
      );

      await sendHumanizedMessage(
        chat,
        'Para eu já deixar tudo mastigado para os fundadores falarem com você em instantes: hoje o maior gargalo da sua empresa é trazer novos clientes (Tráfego) ou atender e converter rápido quem já chega no WhatsApp (Automação)?'
      );

      syncLeadStageToCloud(state.companyName, cleanPhone, 'abordados');

      processingUsers.delete(userId);
      return;
    }

    if (state.stage === 'QUALIFYING') {
      if (intent === 'INTEREST' || (msg.body && msg.body.length > 5)) {
        state.stage = 'HANDOFF';
        userState.set(userId, state);

        const textSnippet = msg.body ? msg.body.slice(0, 30) : '';
        logEvent('LEAD QUALIFICADO', cleanPhone, `Resposta da dor: "${textSnippet}"`);

        await sendHumanizedMessage(
          chat,
          'Perfeito. É exatamente o tipo de gargalo que resolvemos com nossa infraestrutura. O Gabriel já vai assumir essa conversa para te mostrar a solução ao vivo.'
        );

        await sendHumanizedMessage(
          chat,
          'Se preferir não esperar, você já pode travar um horário direto na nossa agenda oficial aqui: https://cal.com/agenciadactylacode-ddyia5/30min 📅'
        );

        syncLeadStageToCloud(state.companyName, cleanPhone, 'reuniao');

        processingUsers.delete(userId);
        return;
      } else {
        state.unknownCount += 1;
        userState.set(userId, state);

        if (state.unknownCount >= 2) {
          state.isHumanRequired = true;
          userState.set(userId, state);

          logEvent('FALLBACK DE CRISE', cleanPhone, 'IA não entendeu 2x. Pausando bot e chamando fundadores.');

          await sendHumanizedMessage(
            chat,
            'Para não tomar seu tempo com respostas automáticas, chamei o Gabriel e o Matheus aqui, um dos dois já te responde em 1 minuto. 🤝'
          );

          syncLeadStageToCloud(state.companyName, cleanPhone, 'reuniao');

          processingUsers.delete(userId);
          return;
        } else {
          await sendHumanizedMessage(
            chat,
            'Entendido! Vocês buscam mais volume de clientes (Tráfego) ou automação no atendimento (WhatsApp 24/7)?'
          );
          processingUsers.delete(userId);
          return;
        }
      }
    }

  } catch (error) {
    console.error(`${LOG_COLORS.red} [!] Erro no Closer de Vendas: ${error.message}${LOG_COLORS.reset}`);
  } finally {
    const userId = msg.from;
    processingUsers.delete(userId);
  }
});

client.initialize();
