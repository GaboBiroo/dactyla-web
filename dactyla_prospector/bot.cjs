/**
 * DACTYLA CODE // AGÊNCIA DE TECNOLOGIA
 * ASSISTENTE EXECUTIVO DE VENDAS B2B COM INTELICÊNCIA ARTIFICIAL CONVERSACIONAL (LLM HYBRID ENGINE)
 * Suporta: Gemini API / OpenAI API / Groq API / Ollama Local (Llama 3) com Fallback Inteligente.
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ----------------------------------------------------------------------
// CONFIGURAÇÕES DA NUVEM, LLM E APIS
// ----------------------------------------------------------------------
const PROSPECTOR_API_KEY = process.env.PROSPECTOR_API_KEY || "dactyla_prospector_secret_2026";
const CLOUD_SYNC_URL = process.env.CLOUD_SYNC_URL || "https://www.dactylacode.com.br/api/leads-sync";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434/api/generate";
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
// PERSISTÊNCIA DE ESTADO E HISTÓRICO CONVERSACIONAL EM DISCO
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
// SYSTEM PROMPT EXECUTIVO DA DACTYLA CODE (LLM SALES CONSULTANT)
// ----------------------------------------------------------------------
const SYSTEM_PROMPT = `
Você é o Consultor Executivo de Vendas B2B da Dactyla Code — Agência de Tecnologia de Alta Performance fundada pelos engenheiros de software Gabriel Hatakeyama (CTO) e Matheus.

DIRETRIZES DE PERSONA E CONVERSAÇÃO:
1. TOM DE VOZ: Executivo, altamente educado, persuasivo, seguro e consultivo. NUNCA seja prolixo ou robótico.
2. TAMANHO DA RESPOSTA: No máximo 2 a 3 frases curtas e diretas. Responda como um humano digitando no WhatsApp.
3. OBJETIVO: Entender quem é o cliente, o nome da empresa dele e o principal desafio (vendas, site, automação, sistema).
4. PREÇOS E ORÇAMENTOS: Nunca dê um valor fixo imediato. Explique com autoridade que os projetos são desenvolvidos sob medida após um diagnóstico técnico do escopo para garantir o ROI.
5. CONDUÇÃO DE FECHAMENTO: Apresente o link da agenda dos fundadores (https://cal.com/agenciadactylacode-ddyia5/30min) de forma natural para o cliente travar um horário de diagnóstico.
6. RESPEITO: Se o cliente disser que não tem interesse ou pedir para parar, encerre com polidez imediata.
`;

// ----------------------------------------------------------------------
// MOTOR DE INTELIGÊNCIA ARTIFICIAL HYBRID (GEMINI / GROQ / OLLAMA / NATIVE)
// ----------------------------------------------------------------------
async function fetchLLMResponse(userMessage, chatHistory = []) {
  // 1. Tentar Gemini API
  if (GEMINI_API_KEY) {
    try {
      const payload = JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\nHistórico:\n${chatHistory.join('\n')}\n\nCliente disse: "${userMessage}"\n\nSua resposta (curta, executiva e persuasiva):` }] }
        ]
      });

      const resText = await makeHttpRequest(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        'POST',
        { 'Content-Type': 'application/json' },
        payload
      );

      const parsed = JSON.parse(resText);
      const reply = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) return reply.trim();
    } catch (e) {
      logEvent('LLM GEMINI WARN', '', 'Falha na API Gemini, tentando próximo provedor...');
    }
  }

  // 2. Tentar Groq API (Llama 3 70B)
  if (GROQ_API_KEY) {
    try {
      const payload = JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...chatHistory.map(h => ({ role: 'user', content: h })),
          { role: 'user', content: userMessage }
        ],
        temperature: 0.6,
        max_tokens: 150
      });

      const resText = await makeHttpRequest(
        'https://api.groq.com/openai/v1/chat/completions',
        'POST',
        { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        payload
      );

      const parsed = JSON.parse(resText);
      const reply = parsed?.choices?.[0]?.message?.content;
      if (reply) return reply.trim();
    } catch (e) {
      logEvent('LLM GROQ WARN', '', 'Falha na API Groq, tentando Ollama local...');
    }
  }

  // 3. Tentar Ollama Local (http://127.0.0.1:11434)
  try {
    const payload = JSON.stringify({
      model: 'llama3',
      prompt: `${SYSTEM_PROMPT}\n\nCliente: ${userMessage}\nResposta:`,
      stream: false
    });

    const resText = await makeHttpRequest(OLLAMA_URL, 'POST', { 'Content-Type': 'application/json' }, payload, 2500);
    const parsed = JSON.parse(resText);
    if (parsed && parsed.response) return parsed.response.trim();
  } catch (e) {
    // Ollama não está rodando localmente, prosseguir para o motor nativo dinâmico
  }

  // 4. Fallback: Motor Nativo Dinâmico com variação algorítmica
  return generateDynamicFallbackResponse(userMessage, chatHistory);
}

// Helper para requisições HTTP/HTTPS nativas sem dependência externa
function makeHttpRequest(urlStr, method, headers, body, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(urlStr);
    const transport = parsedUrl.protocol === 'https:' ? https : http;

    const req = transport.request(urlStr, { method, headers, timeout: timeoutMs }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout de requisição LLM'));
    });

    if (body) req.write(body);
    req.end();
  });
}

// ----------------------------------------------------------------------
// MOTOR NATIVO DINÂMICO DE RESPOSTAS SINTETIZADAS (FALLBACK DE ALTA RIGOROSIDADE)
// ----------------------------------------------------------------------
function generateDynamicFallbackResponse(text, history) {
  const lower = String(text || '').toLowerCase().trim();

  // Rejeição
  if (/não quero|nao quero|sem interesse|pare|remover|remova|cancela|sair/i.test(lower)) {
    return 'Compreendido. Agradecemos a atenção e desejamos excelente sucesso nos seus negócios.';
  }

  // Preço / Orçamento
  if (/caro|preço|preco|valor|quanto é|quanto e|quanto custa|custa|investimento|tabela/i.test(lower)) {
    const priceVariants = [
      'Nossos projetos são desenvolvidos sob medida de acordo com o escopo necessário para a sua empresa. Qual é o principal objetivo ou sistema que você busca implementar no momento?',
      'Trabalhamos com soluções engenheiradas sob medida para garantir o máximo retorno sobre o investimento. Qual é o ramo da sua empresa e o principal desafio atual?'
    ];
    return priceVariants[Math.floor(Math.random() * priceVariants.length)];
  }

  // Pedido de Site / Automação / Sistema
  if (/site|plataforma|sistema|automação|automacao|criar|desenvolver|fazer um site|aplicativo|app/i.test(lower)) {
    const serviceVariants = [
      'Excelente! Desenvolvemos ecossistemas web e soluções sob medida com foco exclusivo em alta conversão e performance. Qual é o nome da sua empresa?',
      'Perfeito. Construímos plataformas web e automações de atendimento de alta performance. Para direcionar melhor, qual é o seu segmento de mercado?'
    ];
    return serviceVariants[Math.floor(Math.random() * serviceVariants.length)];
  }

  // Cumprimento Inicial
  if (/^oi\b|^olá\b|^ola\b|^bom dia\b|^boa tarde\b|^boa noite\b/i.test(lower)) {
    return 'Olá! Seja bem-vindo à Dactyla Code. Sou o assistente executivo dos fundadores, Gabriel e Matheus. Como podemos impulsionar o seu negócio hoje?';
  }

  // Padrão Consultivo
  const defaultVariants = [
    'Entendido perfeitamente. É exatamente o escopo que cobrimos com a nossa engenharia de software.',
    'Excelente. Nós desenvolvemos a infraestrutura sob medida para resolver exatamente esse tipo de demanda na sua operação.'
  ];
  return defaultVariants[Math.floor(Math.random() * defaultVariants.length)];
}

// ----------------------------------------------------------------------
// DIGITAÇÃO DINÂMICA ELEGANTE
// ----------------------------------------------------------------------
function calculateTypingDuration(text) {
  const charCount = text ? text.length : 15;
  const duration = Math.round(charCount * 30);
  return Math.min(Math.max(duration, 1000), 2200);
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
        logEvent('CRM SYNC OK', formattedPhone, `Card movido para '${stage}' no Kanban Vercel`);
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
  console.log(`${LOG_COLORS.green} [OK] MOTOR LLM CONVERSACIONAL DACTYLA CODE OPERACIONAL!${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.green}=====================================================${LOG_COLORS.reset}\n`);
});

// ----------------------------------------------------------------------
// FLUXO DE DIÁLOGO INTELIGENTE CONVERSACIONAL (IA CONVERSA DE VERDADE)
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
      history: [],
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

    // Registrar histórico de conversa
    state.history = state.history || [];
    state.history.push(`Cliente: ${msg.body}`);
    if (state.history.length > 8) state.history.shift();

    // 1. Gerar Resposta via Motor Inteligente (LLM Generativo ou Algorítmico Sintetizado)
    const aiReply = await fetchLLMResponse(msg.body, state.history);

    state.history.push(`Assistente Dactyla: ${aiReply}`);
    state.stage = 'QUALIFYING';
    userState.set(userId, state);
    savePersistedStates(userState);

    logEvent('RESPOSTA IA CONVERSACIONAL', cleanPhone, aiReply);

    // Enviar mensagem gerada pela IA
    await sendHumanizedMessage(msg, chat, aiReply);

    // Se for momento propício de fechamento, oferecer link da agenda
    if (state.history.length >= 4 && !state.history.some(h => h.includes('cal.com'))) {
      await sleep(1500);
      const scheduleMsg = "Se desejar antecipar seu diagnóstico técnico com o Gabriel e o Matheus, você pode agendar um horário direto na nossa agenda oficial:\nhttps://cal.com/agenciadactylacode-ddyia5/30min 📅";
      await sendHumanizedMessage(msg, chat, scheduleMsg);
      state.history.push(`Assistente Dactyla: ${scheduleMsg}`);
      syncLeadStageToCloud(state.companyName, cleanPhone, 'reuniao');
    } else {
      syncLeadStageToCloud(state.companyName, cleanPhone, 'abordados');
    }

  } catch (error) {
    console.error(`${LOG_COLORS.red} [!] Erro no Motor Conversacional LLM: ${error.stack || error}${LOG_COLORS.reset}`);
  } finally {
    const userId = msg.from;
    processingUsers.delete(userId);
  }
});

client.initialize();
