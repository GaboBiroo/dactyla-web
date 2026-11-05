/**
 * DACTYLA CODE // AGÊNCIA DE TECNOLOGIA & ENGENHARIA DE RECEITA
 * ASSISTENTE EXECUTIVO DE VENDAS B2B COM INTELIGÊNCIA ARTIFICIAL CONVERSACIONAL (LLM HYBRID ENGINE)
 * Foco: Productized Service B2B Local-First em Caraguatatuba/SP ("Protocolo Caixa Primeiro em 48h").
 * Suporta: Gemini API / Groq API / Ollama Local (Llama 3) com Fallback Inteligente.
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Carregamento manual seguro de .env
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envLines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of envLines) {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim();
        if (key && !process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch (e) {}

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
Você é o Consultor Executivo de Vendas B2B da Dactyla Code — Engenharia de Receita e Automação em Caraguatatuba/SP, fundada pelos engenheiros Gabriel Hatakeyama (CTO) e Matheus.

DIRETRIZES DE PERSONA E OFERTA (PRODUCTIZED SERVICE LOCAL-FIRST):
1. TOM DE VOZ: Executivo, humano, direto e focado em dinheiro no caixa do lojista. NUNCA seja prolixo ou robótico.
2. TAMANHO DA RESPOSTA: No máximo 2 a 3 frases curtas e diretas. Responda como um especialista humano digitando no WhatsApp.
3. OFERTA CENTRAL ("Motor de Reativação WhatsApp em 48h"):
   - Fazemos um Disparo de Validação em 48h para 60 clientes inativos da loja (Oficina/Troca de Óleo, Pet Shop/Banho & Tosa ou Barbearia) direto no WhatsApp atual da loja.
   - Cláusula de Risco Zero: O lojista SÓ paga o Setup de R$ 400,00 DEPOIS de ver os clientes respondendo e agendando no próprio celular.
   - Mensalidade Recorrente (MRR): R$ 130,00/mês (com R$ 0,00 de taxa por mensagem, aviso de serviço pronto com 1 clique e campanha de horários ociosos de terça e quarta-feira).
   - Se o cliente também precisar de Site de Alta Conversão + Motor IA, temos o plano "Presença Prime + Motor IA" (Setup R$ 1.350 + R$ 147/mês) ou projetos "Dactyla Custom & Big Data" (Sob Consulta).
4. CONDUÇÃO DE FECHAMENTO: Pergunte qual é o ramo da loja (Oficina, Pet Shop ou Barbearia) para liberar o Teste de 48h com Risco Zero, ou envie a agenda técnica (https://cal.com/agenciadactylacode-ddyia5/30min).
5. RESPEITO: Se o cliente disser que não tem interesse ou pedir para parar, encerre com polidez imediata.
`;

const { sanitizeLLMPromptInput } = require('./security_sanitizer.cjs');

// ----------------------------------------------------------------------
// MOTOR DE INTELIGÊNCIA ARTIFICIAL HYBRID (GEMINI / GROQ / OLLAMA / NATIVE)
// ----------------------------------------------------------------------
async function fetchLLMResponse(rawUserMessage, chatHistory = []) {
  const userMessage = sanitizeLLMPromptInput(rawUserMessage);
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
      if (reply) {
        logEvent('LLM GEMINI OK', '', 'Resposta gerada via Gemini API 1.5 Flash');
        return reply.trim();
      }
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
        max_tokens: 180
      });

      const resText = await makeHttpRequest(
        'https://api.groq.com/openai/v1/chat/completions',
        'POST',
        { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        payload
      );

      const parsed = JSON.parse(resText);
      const reply = parsed?.choices?.[0]?.message?.content;
      if (reply) {
        logEvent('LLM GROQ OK', '', 'Resposta gerada via Groq Llama 3 70B');
        return reply.trim();
      }
    } catch (e) {
      logEvent('LLM GROQ WARN', '', 'Falha na API Groq, tentando Ollama local...');
    }
  }

  // 3. Tentar Ollama Local (http://127.0.0.1:11434)
  try {
    const payload = JSON.stringify({
      model: process.env.OLLAMA_MODEL || 'llama3.2:1b',
      prompt: `${SYSTEM_PROMPT}\n\nCliente: ${userMessage}\nResposta:`,
      stream: false
    });

    const resText = await makeHttpRequest(OLLAMA_URL, 'POST', { 'Content-Type': 'application/json' }, payload, 2500);
    const parsed = JSON.parse(resText);
    if (parsed && parsed.response) {
      logEvent('LLM OLLAMA OK', '', 'Resposta gerada via Ollama Local');
      return parsed.response.trim();
    }
  } catch (e) {
    // Ollama não está ativo
  }

  // 4. Fallback: Motor Nativo Dinâmico com variação algorítmica
  logEvent('LLM SYNTHESIS', '', 'Sintetizando resposta executiva avançada...');
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
// MOTOR NATIVO DINÂMICO DE RESPOSTAS SINTETIZADAS (MULTIDIMENSIONAL)
// ----------------------------------------------------------------------
function generateDynamicFallbackResponse(text, history) {
  const lower = String(text || '').toLowerCase().trim();

  // Rejeição
  if (/não quero|nao quero|sem interesse|pare|remover|remova|cancela|sair/i.test(lower)) {
    return 'Compreendido perfeitamente. Agradecemos a atenção e desejamos excelentes negócios aí em Caraguá!';
  }

  // Preço / Orçamento / Risco Zero
  if (/caro|preço|preco|valor|quanto é|quanto e|quanto custa|custa|investimento|tabela|400|130/i.test(lower)) {
    const priceVariants = [
      'O nosso Motor de Reativação WhatsApp em 48h tem Setup de R$ 400 (com Risco Zero: você só paga após ver 60 clientes inativos respondendo no seu WhatsApp) + R$ 130/mês sem taxa por mensagem. Qual é o ramo da sua loja hoje?',
      'Trabalhamos com o Protocolo Risco Zero em Caraguá: fazemos o disparo para 60 clientes sumidos da sua loja em 48h e você só paga os R$ 400 de implantação depois do resultado no caixa (mensalidade de R$ 130/mês). Quer testar essa semana?'
    ];
    return priceVariants[Math.floor(Math.random() * priceVariants.length)];
  }

  // Pedido de Site / Automação / Sistema / Reativação
  if (/site|plataforma|sistema|automação|automacao|reativa|inativo|oficina|pet|barbearia|clientes/i.test(lower)) {
    const serviceVariants = [
      'Excelente! Conectamos o Motor de Reativação direto no WhatsApp atual da sua loja em 2 minutos para resgatar clientes inativos e lotar sua terça e quarta-feira. Qual é o nome do seu estabelecimento?',
      'Perfeito! Além do Motor de Reativação em 48h (Setup R$ 400 + R$ 130/mês), temos o Presença Prime + Motor IA (R$ 1.350 + R$ 147/mês) com site ultrarrápido no Google. Qual dos dois faz mais sentido para o seu momento?'
    ];
    return serviceVariants[Math.floor(Math.random() * serviceVariants.length)];
  }

  // Cumprimento Inicial
  if (/^oi\b|^olá\b|^ola\b|^bom dia\b|^boa tarde\b|^boa noite\b|^opa\b/i.test(lower)) {
    return 'Opa, tudo bem? Seja bem-vindo à Dactyla Code em Caraguatatuba. Sou o assistente executivo do Gabriel e do Matheus. Você gostaria de testar nosso Motor de Reativação de Clientes em 48h com Risco Zero?';
  }

  // Padrão Consultivo
  const defaultVariants = [
    'Perfeito! Com o nosso Motor de Reativação em 48h, nós reativamos 60 clientes sumidos do seu balcão antes de você pagar qualquer centavo do setup de R$ 400. Qual é o nome da sua empresa para o Gabriel preparar o seu teste?',
    'Entendido!1 carro recuperado na oficina ou 2 banhos no Pet Shop já pagam toda a mensalidade de R$ 130/mês do nosso motor. Como está o movimento de terça e quarta-feira aí na loja?'
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

    req.on('error', () => {});
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
// SYSTEM PROMPT EXECUTIVO DACTYLA DIAGNOSTIC AI (ROLE-PROMPTING + COT)
// ----------------------------------------------------------------------
const DIAGNOSTIC_AI_SYSTEM_PROMPT = `
Você é o Consultor B2B Sênior da Dactyla Code — autoridade em Engenharia de Receita e Automação Comercial no Litoral Norte de SP (Caraguatatuba).

Você recebeu a auditoria digital recém-concluída pelo cliente no nosso site.

REGRAS RIGOROSAS DE RESPOSTA DA IA:
1. ANÁLISE CONDICIONAL DE SCORE:
   - Se o Score for MENOR que 50 (< 50): Aja com tom de alerta cirúrgico. Alerte com urgência sobre o dinheiro deixado na mesa todos os meses com clientes inativos esquecidos e demora no WhatsApp. Recomende o fechamento imediato do "Motor de Reativação WhatsApp em 48h (Setup R$ 400 + R$ 130/mês com Teste de Risco Zero)", explicando que reativamos 60 clientes sumidos antes de ele pagar o setup.
   - Se o Score for MAIOR OU IGUAL a 50 (>= 50): Elogie a base atual da empresa, mas aponte como blindar a recorrência na baixa temporada combinando o "Motor de Reativação WhatsApp em 48h (Setup R$ 400 + R$ 130/mês com Teste de Risco Zero)" ou o pacote completo "Presença Prime + Motor IA (Setup R$ 1.350 + R$ 147/mês)".
2. REGRAS DE ESTILO E TAMANHO:
   - Resposta em no máximo 2 parágrafos curtos, executivos, focados em retorno financeiro imediato no balcão e sem jargões complexos.
3. FECHAMENTO MANDATÓRIO (OBRIGATÓRIO INCLUIR NO FINAL):
   - SEMPRE termine o segundo parágrafo com a frase exata: "O nosso Diretor Técnico (Gabriel Hatakeyama) já assumirá a linha em instantes para te passar o plano técnico de adequação."
`;

function parseAuditoriaTrigger(text) {
  if (!text || !String(text).includes('#AUDITORIA_DACTYLA')) return null;

  // 1. Tenta regex resiliente com espaços opcionais antes e depois de cada pipe (\s*\|\s*)
  const regexMatch = String(text).match(
    /#AUDITORIA_DACTYLA\s*\|\s*Nome:\s*([^|]+?)\s*\|\s*Path:\s*([^|]+?)\s*\|\s*Score:\s*(\d+)\s*\/\s*100\s*\|\s*Resumo:\s*(.+)/is
  );
  if (regexMatch) {
    return {
      empresa: regexMatch[1].trim(),
      path: regexMatch[2].trim(),
      score: parseInt(regexMatch[3].trim(), 10),
      resumo: regexMatch[4].trim()
    };
  }

  // 2. Fallback resiliente via .split('|') igual ao test_diagnostic_ai.cjs
  const parts = String(text).split('|').map(p => p.trim());
  if (parts.length < 5) return null;

  const empresa = (parts.find(p => /^Nome:/i.test(p)) || parts[1] || '').replace(/^Nome:\s*/i, '').trim();
  const pathVal = (parts.find(p => /^Path:/i.test(p)) || parts[2] || '').replace(/^Path:\s*/i, '').trim();
  const scorePart = parts.find(p => /^Score:/i.test(p)) || parts[3] || '';
  const scoreMatch = scorePart.match(/(\d+)\s*\/\s*100/);
  const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 45;
  const resumoIdx = parts.findIndex(p => /^Resumo:/i.test(p));
  const resumo = resumoIdx >= 0
    ? parts.slice(resumoIdx).join(' | ').replace(/^Resumo:\s*/i, '').trim()
    : parts.slice(4).join(' | ').trim();

  if (!empresa) return null;
  return { empresa, path: pathVal || 'Rápida', score, resumo };
}

// ----------------------------------------------------------------------
// FLUXO DE DIÁLOGO INTELIGENTE CONVERSACIONAL
// ----------------------------------------------------------------------
client.on('message', async (msg) => {
  try {
    if (msg.from.endsWith('@g.us')) return;
    if (msg.from.endsWith('@newsletter')) return;
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

    // Interceptador de Gatilho Inbound #AUDITORIA_DACTYLA
    if (msg.body && msg.body.includes('#AUDITORIA_DACTYLA')) {
      const parsedAudit = parseAuditoriaTrigger(msg.body);
      if (parsedAudit) {
        logEvent('INBOUND AUDITORIA DETECTADO', cleanPhone, `Empresa: ${parsedAudit.empresa} | Score: ${parsedAudit.score}/100`);

        state.companyName = parsedAudit.empresa;
        state.stage = 'QUALIFIED_INBOUND';

        const promptText = `
${DIAGNOSTIC_AI_SYSTEM_PROMPT}

DADOS DA AUDITORIA RECEBIDA DO CLIENTE:
- Nome da Empresa: ${parsedAudit.empresa}
- Modalidade da Auditoria: ${parsedAudit.path}
- Score de Performance: ${parsedAudit.score}/100
- Resumo das Respostas: ${parsedAudit.resumo}

Gere o diagnóstico executivo agora (máximo 2 parágrafos):`;

        let diagnosticResponse = "";
        const mandatoryEnding = "O nosso Diretor Técnico (Gabriel Hatakeyama) já assumirá a linha em instantes para te passar o plano técnico de adequação.";

        try {
          diagnosticResponse = await fetchLLMResponse(promptText, []);
          if (!diagnosticResponse.includes("Gabriel Hatakeyama")) {
            diagnosticResponse = `${diagnosticResponse.trim()}\n\n${mandatoryEnding}`;
          }
        } catch (e) {
          if (parsedAudit.score < 50) {
            diagnosticResponse = `Olá! Analisamos a auditoria da *${parsedAudit.empresa}* (Score ${parsedAudit.score}/100) e identificamos um alerta crítico de receita ficando na mesa com clientes inativos e demora no WhatsApp. Recomendamos ativar imediatamente o nosso *Motor de Reativação WhatsApp em 48h (Setup R$ 400 + R$ 130/mês com Teste de Risco Zero)*: nós disparamos para 60 clientes sumidos da sua loja primeiro, e você só paga o setup depois de ver o pessoal agendando no seu próprio WhatsApp.\n\n${mandatoryEnding}`;
          } else {
            diagnosticResponse = `Olá! Recebemos a auditoria da *${parsedAudit.empresa}* com excelente base operacional (Score ${parsedAudit.score}/100). Para blindar o seu caixa fora de temporada e automatizar o retorno de clientes, recomendamos o *Motor de Reativação WhatsApp em 48h (Setup R$ 400 + R$ 130/mês com Teste de Risco Zero)* ou o ecossistema *Presença Prime + Motor IA (R$ 1.350 + R$ 147/mês)*.\n\n${mandatoryEnding}`;
          }
        }

        userState.set(userId, state);
        savePersistedStates(userState);

        await sendHumanizedMessage(msg, chat, diagnosticResponse);
        syncLeadStageToCloud(parsedAudit.empresa, cleanPhone, 'abordados');
        return;
      }
    }

    state.history = state.history || [];
    state.history.push(`Cliente: ${msg.body}`);
    if (state.history.length > 8) state.history.shift();

    const aiReply = await fetchLLMResponse(msg.body, state.history);

    state.history.push(`Assistente Dactyla: ${aiReply}`);
    state.stage = 'QUALIFYING';
    userState.set(userId, state);
    savePersistedStates(userState);

    logEvent('RESPOSTA IA CONVERSACIONAL', cleanPhone, aiReply);

    await sendHumanizedMessage(msg, chat, aiReply);

    if (state.history.length >= 4 && !state.history.some(h => h.includes('cal.com'))) {
      await sleep(1500);
      const scheduleMsg = "Se quiser já travar o seu Teste de 48h com Risco Zero direto com o Gabriel e o Matheus, você também pode escolher um horário rápido aqui:\nhttps://cal.com/agenciadactylacode-ddyia5/30min 📅";
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

client.on('disconnected', (reason) => {
  logEvent('DISCONNECTED WARN', '', `WhatsApp desconectado: ${reason}. Tentando reconexão em 5 segundos...`);
  setTimeout(() => {
    try { client.initialize(); } catch(e) {}
  }, 5000);
});

if (require.main === module) {
  client.initialize();
}

module.exports = {
  parseAuditoriaTrigger,
  SYSTEM_PROMPT,
  DIAGNOSTIC_AI_SYSTEM_PROMPT
};
