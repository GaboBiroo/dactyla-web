/**
 * DACTYLA CODE // DISPARO EM MASSA ANTI-BAN B2B
 * Script autônomo em Node.js usando whatsapp-web.js para envio passivo cadenciado de cold messages.
 * Implementa pausa aleatória de 35 a 75 segundos por mensagem e histórico anti-duplicação.
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

// Caminhos dos arquivos de dados
const LEADS_FILE = path.join(__dirname, 'mined_leads.json');
const DISPARO_HISTORY_FILE = path.join(__dirname, 'disparo_history.json');

// Cores ANSI para terminal corporativo
const LOG_COLORS = {
  reset: '\x1b[0m',
  gold: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  gray: '\x1b[90m'
};

function logMsg(status, text) {
  const time = new Date().toLocaleTimeString('pt-BR');
  console.log(`${LOG_COLORS.gray}[${time}]${LOG_COLORS.reset} ${LOG_COLORS.gold}[${status}]${LOG_COLORS.reset} ${text}`);
}

// Utilitário para gerar tempo aleatório de pausa anti-ban (entre 35 e 75 segundos)
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

// Formata e sanitiza número de telefone brasileiro para o formato MSISDN JID do WhatsApp
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

// Template da Mensagem Fria focado na Auditoria Digital Gratuita
function buildColdMessage(companyName) {
  const cleanName = companyName || 'Empresa';
  return `Olá! Tudo bem? Sou o Gabriel, fundador da Dactyla Code aqui de Caraguá. Criei uma ferramenta gratuita que avalia em 60 segundos a velocidade do atendimento e a presença digital das empresas locais.

Fiz um diagnóstico prévio da ${cleanName} e notei alguns pontos que podem estar fazendo vocês perderem clientes para concorrentes no Google.

Posso te mandar o link gratuito da ferramenta para você ver a pontuação da sua empresa?`;
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
  console.log(`${LOG_COLORS.gold}   DACTYLA CODE // DISPARO EM MASSA ANTI-BAN JID${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.gold}=====================================================${LOG_COLORS.reset}\n`);
  qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
  console.log(`\n${LOG_COLORS.green}=====================================================${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.green} [OK] CLIENTE WHATSAPP PRONTO! INICIANDO MOTOR ANTI-BAN...${LOG_COLORS.reset}`);
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

    const messageText = buildColdMessage(companyName);

    try {
      logMsg('ENVIANDO', `[${i + 1}/${leads.length}] Disparando para ${companyName} (${jid})...`);
      
      // Simula digitação humana antes de enviar
      const chat = await client.getChatById(jid).catch(() => null);
      if (chat && typeof chat.sendStateTyping === 'function') {
        await chat.sendStateTyping();
        await sleep(3000);
      }

      await client.sendMessage(jid, messageText);
      
      history.add(jid);
      saveDisparoHistory(history);
      sentCount++;

      logMsg('SUCESSO', `[✅] Mensagem enviada para ${companyName}!`);

      // Pausa estrita anti-ban entre 35 e 75 segundos
      const delayMs = getRandomDelayMs(35, 75);
      const delaySec = Math.round(delayMs / 1000);
      logMsg('PAUSA ANTI-BAN', `Aguardando ${delaySec} segundos antes do próximo disparo para simular comportamento humano...\n`);
      await sleep(delayMs);

    } catch (err) {
      logMsg('ERRO', `[❌] Falha no disparo para ${companyName} (${jid}): ${err.message}`);
    }
  }

  logMsg('CONCLUÍDO', `Campanha de disparo em massa finalizada. Total enviado nesta sessão: ${sentCount}`);
  process.exit(0);
});

client.initialize();
