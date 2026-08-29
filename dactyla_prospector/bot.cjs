/**
 * DACTYLA CODE // AGÊNCIA DE TECNOLOGIA
 * ASSISTENTE EXECUTIVO E CONSULTOR DE VENDAS B2B (whatsapp-web.js)
 * Arquitetura de Diálogo Consultivo: Tom Executivo, Respostas Curtas e Diagnóstico Personalizado.
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ----------------------------------------------------------------------
// CONFIGURAÇÕES DA NUVEM E APIS
// ----------------------------------------------------------------------
const PROSPECTOR_API_KEY = process.env.PROSPECTOR_API_KEY || "dactyla_prospector_secret_2026";
const CLOUD_SYNC_URL = process.env.CLOUD_SYNC_URL || "https://www.dactylacode.com.br/api/leads-sync";
const STATE_FILE = path.join(__dirname, 'bot_user_states.json');

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
// MÁQUINA DE ESTADOS & MEMÓRIA PERSISTENTE EM DISCO
// ----------------------------------------------------------------------
function loadPersistedStates() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, 'utf-8');
      return new Map(JSON.parse(data));
    }
  } catch (e) {
    console.error('Erro ao carregar estados do bot:', e);
  }
  return new Map();
}

function savePersistedStates(statesMap) {
  try {
    const arrayData = Array.from(statesMap.entries());
    fs.writeFileSync(STATE_FILE, JSON.stringify(arrayData, null, 2), 'utf-8');
  } catch (e) {
    console.error('Erro ao salvar estados do bot:', e);
  }
}

const userState = loadPersistedStates();
const processingUsers = new Set();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ----------------------------------------------------------------------
// ROTEADOR DE INTENÇÕES CONSULTIVO (NLP CORPORATIVO)
// ----------------------------------------------------------------------
function classifyIntent(text) {
  const lower = String(text || '').toLowerCase().trim();

  // Rejeição / Opt-Out
  if (/não quero|nao quero|sem interesse|pare|remover|remova|cancela|sair|não tenho interesse|nao tenho interesse/i.test(lower)) {
    return 'REJECTION';
  }

  // Pergunta sobre Preço / Orçamento
  if (/caro|preço|preco|valor|quanto é|quanto e|quanto custa|custa|investimento|tabela/i.test(lower)) {
    return 'PRICE';
  }

  // Pedido de Desenvolvimento (Site, Software, Automação)
  if (/site|plataforma|sistema|automação|automacao|criar|desenvolver|fazer um site|aplicativo|app/i.test(lower)) {
    return 'SERVICE_REQUEST';
  }

  // Foco em Vendas / Tráfego
  if (/tráfego|trafego|vendas|clientes|marketing|anúncios|anuncios/i.test(lower)) {
    return 'TRAFFIC_NEED';
  }

  // Objeção de Tempo
  if (/ocupado|depois|semana que vem|amanhã|amanha|mais tarde|me liga|horário|horario|agora não|agora nao/i.test(lower)) {
    return 'TIME_OBJECTION';
  }

  // Cumprimento
  if (/^oi\b|^olá\b|^ola\b|^bom dia\b|^boa tarde\b|^boa noite\b/i.test(lower)) {
    return 'GREETING';
  }

  return 'GENERAL';
}

// ----------------------------------------------------------------------
// DIGITAÇÃO DINÂMICA ELEGANTE (WPM MATEMÁTICA ENXUTA)
// ----------------------------------------------------------------------
function calculateTypingDuration(text) {
  const charCount = text ? text.length : 15;
  const duration = Math.round(charCount * 35);
  return Math.min(Math.max(duration, 1000), 2500);
}

async function sendHumanizedMessage(msg, chat, text) {
  const duration = calculateTypingDuration(text);
  if (chat && typeof chat.sendStateTyping === 'function') {
    try {
      await chat.sendStateTyping();
    } catch (e) {}
  }
  await sleep(duration);
  await client.sendMessage(msg.from, text);
}

// ----------------------------------------------------------------------
// SINCRONIZAÇÃO NUVEM VERCEL KANBAN
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
// INICIALIZAÇÃO WHATSAPP WEB
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
  console.log(`${LOG_COLORS.green} [OK] ASSISTENTE EXECUTIVO DACTYLA CODE OPERACIONAL!${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.green}=====================================================${LOG_COLORS.reset}\n`);
});

// ----------------------------------------------------------------------
// FLUXO DE DIÁLOGO CONSULTIVO B2B
// ----------------------------------------------------------------------
client.on('message', async (msg) => {
  try {
    if (msg.from.endsWith('@g.us')) return;
    if (msg.from === 'status@broadcast') return;
    if (msg.fromMe) return;

    const userId = msg.from;
    const cleanPhone = userId.replace(/\D/g, '');

    logEvent('MENSAGEM RECEBIDA', cleanPhone, msg.body || '');

    if (processingUsers.has(userId)) return;

    let state = userState.get(userId) || {
      stage: 'INIT',
      companyName: '',
      clientName: '',
      unknownCount: 0,
      isHumanRequired: false,
      isOptedOut: false
    };

    if (state.isHumanRequired || state.isOptedOut) {
      logEvent('SILÊNCIO IA', cleanPhone, 'Atendimento Humano ou Opt-Out ativo. Bot em espera.');
      return;
    }

    processingUsers.add(userId);
    
    let chat = null;
    try {
      chat = await msg.getChat();
    } catch (e) {}

    const intent = classifyIntent(msg.body);

    // 1. REJEIÇÃO / OPT-OUT
    if (intent === 'REJECTION') {
      state.isOptedOut = true;
      userState.set(userId, state);
      savePersistedStates(userState);

      logEvent('OPT-OUT', cleanPhone, 'Lead optou por sair');
      await sendHumanizedMessage(
        msg,
        chat,
        'Compreendido. Agradecemos o contato e desejamos excelente sucesso nos seus negócios.'
      );
      processingUsers.delete(userId);
      return;
    }

    // 2. OBJEÇÃO DE TEMPO
    if (intent === 'TIME_OBJECTION') {
      logEvent('AGENDA DIRETA', cleanPhone, 'Enviando link Cal.com');
      await sendHumanizedMessage(
        msg,
        chat,
        'Sem problemas. Quando for mais conveniente, você pode escolher um horário direto na agenda dos fundadores:\nhttps://cal.com/agenciadactylacode-ddyia5/30min 📅'
      );
      processingUsers.delete(userId);
      return;
    }

    // 3. ESTÁGIO INICIAL (BOAS-VINDAS CURTA E CONSULTIVA)
    if (state.stage === 'INIT') {
      state.stage = 'DISCOVERY_NAME';
      userState.set(userId, state);
      savePersistedStates(userState);

      logEvent('INÍCIO CONSULTORIA', cleanPhone, 'Enviando saudação curta');

      await sendHumanizedMessage(
        msg,
        chat,
        'Olá! Seja bem-vindo à Dactyla Code. Sou o assistente executivo dos fundadores, Gabriel e Matheus.'
      );

      await sendHumanizedMessage(
        msg,
        chat,
        'Para direcionar o seu atendimento com precisão, qual é o seu nome e o nome da sua empresa?'
      );

      syncLeadStageToCloud(state.companyName, cleanPhone, 'abordados');
      processingUsers.delete(userId);
      return;
    }

    // 4. ESTÁGIO DE DESCOBERTA (NOME & EMPRESA)
    if (state.stage === 'DISCOVERY_NAME') {
      state.companyName = msg.body.trim();
      state.stage = 'DISCOVERY_NEED';
      userState.set(userId, state);
      savePersistedStates(userState);

      logEvent('IDENTIFICAÇÃO', cleanPhone, `Cliente se identificou: ${state.companyName}`);

      await sendHumanizedMessage(
        msg,
        chat,
        `Prazer em conhecê-lo! `
      );

      if (intent === 'PRICE') {
        await sendHumanizedMessage(
          msg,
          chat,
          'Nossos projetos de engenharia web e automação são desenvolvidos sob medida de acordo com o escopo necessário para a sua empresa.'
        );
      } else if (intent === 'SERVICE_REQUEST') {
        await sendHumanizedMessage(
          msg,
          chat,
          'Excelente. Desenvolvemos ecossistemas web e plataformas sob medida focados em alta conversão e performance.'
        );
      }

      await sendHumanizedMessage(
        msg,
        chat,
        'Hoje, qual é o principal objetivo ou desafio que você busca resolver na sua operação?'
      );

      processingUsers.delete(userId);
      return;
    }

    // 5. ESTÁGIO DE QUALIFICAÇÃO & HANDOFF EXECUTIVO
    if (state.stage === 'DISCOVERY_NEED') {
      state.stage = 'HANDOFF';
      userState.set(userId, state);
      savePersistedStates(userState);

      logEvent('QUALIFICADO', cleanPhone, `Necessidade registrada: ${msg.body.slice(0, 40)}`);

      await sendHumanizedMessage(
        msg,
        chat,
        'Entendido perfeitamente. É exatamente o escopo que cobrimos com a nossa infraestrutura.'
      );

      await sendHumanizedMessage(
        msg,
        chat,
        'Já repassei estes detalhes diretamente ao Gabriel e ao Matheus. Um deles assumirá esta conversa em instantes para apresentar a solução ideal.'
      );

      await sendHumanizedMessage(
        msg,
        chat,
        'Se desejar antecipar o seu diagnóstico técnico, você também pode agendar uma reunião de 15 minutos aqui:\nhttps://cal.com/agenciadactylacode-ddyia5/30min 📅'
      );

      syncLeadStageToCloud(state.companyName, cleanPhone, 'reuniao');
      processingUsers.delete(userId);
      return;
    }

    // 6. APÓS HANDOFF (SE O CLIENTE CONTINUAR FALANDO)
    if (state.stage === 'HANDOFF') {
      if (intent === 'PRICE') {
        await sendHumanizedMessage(
          msg,
          chat,
          'O Gabriel apresentará os valores e as opções de investimento personalizadas na demonstração. Fique à vontade para sugerir o melhor horário!'
        );
      } else {
        await sendHumanizedMessage(
          msg,
          chat,
          'Anotado! Os fundadores já receberam essa informação adicional e responderão em breve.'
        );
      }
      processingUsers.delete(userId);
      return;
    }

  } catch (error) {
    console.error(`${LOG_COLORS.red} [!] Erro no Consultor Executivo: ${error.stack || error}${LOG_COLORS.reset}`);
  } finally {
    const userId = msg.from;
    processingUsers.delete(userId);
  }
});

client.initialize();
