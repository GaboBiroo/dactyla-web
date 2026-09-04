/**
 * DACTYLA CODE // DISPARO EM MASSA OUTBOUND IA (LLAMA 3.2 OLLAMA EMBEDDED)
 * Motor autônomo de prospecção passiva via WhatsApp com geração de copy hiperlocalizada em tempo real.
 * Integração com whatsapp-web.js, Ollama (Llama 3.2 1B), pausa anti-ban (35s-75s) e fallback resiliente.
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Caminhos dos arquivos de dados
const LEADS_FILE = path.join(__dirname, 'mined_leads.json');
const DISPARO_HISTORY_FILE = path.join(__dirname, 'disparo_history.json');

// Cores ANSI para Terminal Corporativo
const LOG_COLORS = {
  reset: '\x1b[0m',
  gold: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  bold: '\x1b[1m',
  gray: '\x1b[90m'
};

function logMsg(status, text) {
  const time = new Date().toLocaleTimeString('pt-BR');
  console.log(`${LOG_COLORS.gray}[${time}]${LOG_COLORS.reset} ${LOG_COLORS.gold}[${status}]${LOG_COLORS.reset} ${text}`);
}

// Utilitário de pausa aleatória anti-ban entre 35 e 75 segundos
function getRandomDelayMs(minSec = 35, maxSec = 75) {
  const minMs = minSec * 1000;
  const maxMs = maxSec * 1000;
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Carrega histórico de disparos passados para impedir duplicidade
function loadDisparoHistory() {
  try {
    if (fs.existsSync(DISPARO_HISTORY_FILE)) {
      const data = fs.readFileSync(DISPARO_HISTORY_FILE, 'utf-8');
      return new Set(JSON.parse(data));
    }
  } catch (e) {
    console.error('Erro ao ler histórico de disparos:', e);
  }
  return new Set();
}

function saveDisparoHistory(historySet) {
  try {
    const arrayData = Array.from(historySet);
    fs.writeFileSync(DISPARO_HISTORY_FILE, JSON.stringify(arrayData, null, 2), 'utf-8');
  } catch (e) {
    console.error('Erro ao salvar histórico de disparos:', e);
  }
}

// Formata e sanitiza número de telefone para o formato MSISDN JID do WhatsApp
function formatPhoneToJid(phoneStr) {
  if (!phoneStr) return null;
  let digits = String(phoneStr).replace(/\D/g, '');
  
  if (digits.startsWith('0')) digits = digits.substring(1);
  if (digits.length in [8, 9]) digits = '12' + digits; // DDD 12 Caraguá
  if (digits.length in [10, 11] && !digits.startsWith('55')) digits = '55' + digits;

  if (digits.length >= 12 && digits.length <= 13) {
    return `${digits}@c.us`;
  }
  return null;
}

// Carrega a base de leads minerados
function loadMinedLeads() {
  try {
    if (fs.existsSync(LEADS_FILE)) {
      const data = fs.readFileSync(LEADS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Erro ao carregar mined_leads.json:', e);
  }
  return [];
}

// Chamada HTTP nativa para o Ollama Local (http://127.0.0.1:11434/api/generate)
function callOllamaAPI(promptText) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: 'llama3.2:1b',
      prompt: promptText,
      stream: false
    });

    const options = {
      hostname: '127.0.0.1',
      port: 11434,
      path: '/api/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 18000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.response || data);
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', (err) => reject(new Error(`Ollama API offline: ${err.message}`)));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout na resposta do Llama 3.2'));
    });

    req.write(payload);
    req.end();
  });
}

// Fallback de segurança humano caso o Ollama fique indisponível
function getFallbackColdMessage(companyName, bairro) {
  const cleanName = companyName || 'Empresa';
  const localText = bairro ? `no bairro ${bairro} aí em Caraguá` : 'aí em Caraguatatuaba';

  return `Opa, tudo bem? Sou o Gabriel, morador aqui do bairro Pontal de Santa Marina em Caraguá. Vi a ${cleanName} ${localText} e decidi mandar essa mensagem rápida.

Criei uma ferramenta local e gratuita que avalia em 60 segundos se o WhatsApp da sua empresa está perdendo clientes ou demorando para responder orçamentos.

Você pode testar a pontuação da sua empresa direto pelo link: dactylacode.com.br/auditoria

Se precisar de qualquer apoio técnico, estou por aqui!`;
}

// Gerador de Mensagem com Llama 3.2 1B + Fallback Resiliente
async function generateAiColdMessage(lead) {
  const companyName = lead.name || lead.empresa || 'Empresa Local';
  const bairro = lead.bairro || lead.bairro_nome || lead.neighborhood || 'Caraguatatuba';
  const dor = lead.dor || lead.gargalo || 'demora no atendimento no WhatsApp e perda de clientes para concorrentes';
  const nicho = lead.nicho || lead.categoria || 'comércio local';

  const promptText = `
Você é o Gabriel, desenvolvedor da Dactyla Code, morador do bairro Pontal de Santa Marina em Caraguatatuba/SP.
Escreva uma mensagem curta de WhatsApp (máximo 2 parágrafos) para o dono deste negócio local.

REGRA 1: Diga "Opa, tudo bem?"
REGRA 2: Fale que você mora em Caraguá e viu a empresa dele no bairro ${bairro}. Se não tiver bairro específico, mencione a cidade de Caraguatatuba.
REGRA 3: Comente sobre a dor: ${dor}.
REGRA 4: Ofereça a ferramenta gratuita (dactylacode.com.br/auditoria) para medir se ele está perdendo vendas no Zap.
REGRA 5: Pareça um humano digitando rápido. Zero jargões computacionais complexos.

DADOS DA EMPRESA:
- Nome: ${companyName}
- Nicho: ${nicho}
- Bairro: ${bairro}

Mensagem de WhatsApp:`;

  try {
    const rawAiResponse = await callOllamaAPI(promptText);
    const cleanedMessage = rawAiResponse ? rawAiResponse.trim() : '';

    // Valida se a IA não gerou recusas de filtro
    if (cleanedMessage && !cleanedMessage.toLowerCase().includes('não posso') && !cleanedMessage.toLowerCase().includes('desculpe')) {
      return cleanedMessage;
    }
  } catch (err) {
    logMsg('AVISO IA', `Ollama indisponível (${err.message}). Acionando fallback humano...`);
  }

  return getFallbackColdMessage(companyName, bairro);
}

// Inicialização do WhatsApp Web
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './.wwebjs_disparo_auth' }),
  puppeteer: {
    headless: true,
    args: ['--disable-dev-shm-usage', '--no-sandbox']
  }
});

client.on('qr', (qr) => {
  console.clear();
  console.log(`${LOG_COLORS.gold}=====================================================${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.gold} DACTYLA CODE // DISPARO OUTBOUND IA (LLAMA 3.2) ${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.gold}=====================================================${LOG_COLORS.reset}\n`);
  qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
  console.log(`\n${LOG_COLORS.green}=====================================================${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.green} [OK] CLIENTE WHATSAPP CONECTADO! INICIANDO DISPAROS COM IA...${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.green}=====================================================${LOG_COLORS.reset}\n`);

  const leads = loadMinedLeads();
  const history = loadDisparoHistory();

  if (leads.length === 0) {
    logMsg('ALERTA', 'Nenhum lead encontrado em mined_leads.json.');
    process.exit(0);
  }

  logMsg('INÍCIO', `Total de leads carregados: ${leads.length} | Já disparados: ${history.size}`);

  let sentCount = 0;

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    const rawPhone = lead.phone || lead.telefone;
    const jid = formatPhoneToJid(rawPhone);
    const companyName = lead.name || lead.empresa || 'Empresa B2B';

    if (!jid) {
      logMsg('IGNORADO', `Telefone inválido para ${companyName}: ${rawPhone}`);
      continue;
    }

    if (history.has(jid)) {
      logMsg('DUPLICADO', `Lead ${companyName} (${jid}) já recebeu disparo anterior. Pulando.`);
      continue;
    }

    logMsg('GERANDO IA', `[${i + 1}/${leads.length}] Gerando copy hiperlocal para ${companyName}...`);
    const aiMessageText = await generateAiColdMessage(lead);

    try {
      logMsg('ENVIANDO', `Disparando mensagem para ${companyName} (${jid})...`);
      
      // Simula digitação humana antes de enviar
      const chat = await client.getChatById(jid).catch(() => null);
      if (chat && typeof chat.sendStateTyping === 'function') {
        await chat.sendStateTyping();
        await sleep(3000);
      }

      await client.sendMessage(jid, aiMessageText);
      
      history.add(jid);
      saveDisparoHistory(history);
      sentCount++;

      logMsg('SUCESSO', `[✅] Mensagem com IA enviada para ${companyName}!`);
      console.log(`${LOG_COLORS.cyan}💬 Mensagem enviada:\n"${aiMessageText.substring(0, 120)}..."${LOG_COLORS.reset}\n`);

      // Pausa estrita anti-ban entre 35 e 75 segundos
      const delayMs = getRandomDelayMs(35, 75);
      const delaySec = Math.round(delayMs / 1000);
      logMsg('PAUSA ANTI-BAN', `Aguardando ${delaySec}s antes do próximo disparo para simular comportamento humano...\n`);
      await sleep(delayMs);

    } catch (err) {
      logMsg('ERRO', `[❌] Falha no disparo para ${companyName} (${jid}): ${err.message}`);
    }
  }

  logMsg('CONCLUÍDO', `Campanha de disparo outbound com IA finalizada. Total enviado nesta sessão: ${sentCount}`);
  process.exit(0);
});

client.initialize();
