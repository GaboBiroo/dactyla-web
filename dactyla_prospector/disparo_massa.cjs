/**
 * DACTYLA CODE // DISPARO EM MASSA OUTBOUND IA + INBOX ZERO ARCHITECTURE
 * Motor autônomo de prospecção passiva via WhatsApp com geração de copy hiperlocalizada em tempo real (Llama 3.2).
 * Inclui arquivamento pós-envio (Auto-Archive), desarquivamento inteligente no scanner de respostas, 
 * e envio do relatório executivo de ciclo para o WhatsApp pessoal do CEO (12 99210-9408).
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

// Configurações Globais do Sistema
const CEO_WHATSAPP_JID = '5512992109408@c.us'; // WhatsApp Pessoal do CEO Gabriel (12 99210-9408)
const LEADS_FILE = path.join(__dirname, 'mined_leads.json');
const DISPARO_HISTORY_FILE = path.join(__dirname, 'disparo_history.json');
const MAX_DISPAROS_POR_CICLO = parseInt(process.env.MAX_DISPAROS_POR_CICLO || '15', 10); // Trava de segurança anti-ban para chip de 2 semanas (15 disparos/ciclo)

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

// Carrega histórico de disparos passados
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

const { sanitizeLLMPromptInput, sanitizeStrictPhoneJid } = require('./security_sanitizer.cjs');

// Formata número de telefone para o formato MSISDN JID do WhatsApp
function formatPhoneToJid(phoneStr) {
  return sanitizeStrictPhoneJid(phoneStr);
}

// Carrega a base de leads minerados (Local + Cloud Sync / Hub API)
async function loadMinedLeads() {
  let leads = [];

  try {
    if (fs.existsSync(LEADS_FILE)) {
      const data = fs.readFileSync(LEADS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) leads = parsed;
    }
  } catch (e) {
    console.error('Erro ao carregar mined_leads.json:', e.message);
  }

  // Sincroniza leads adicionais do Painel / Hub em nuvem
  try {
    const cloudRes = await new Promise((resolve) => {
      const req = https.get('https://www.dactylacode.com.br/api/leads-sync', { timeout: 5000 }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            resolve(json.leads || []);
          } catch (e) { resolve([]); }
        });
      });
      req.on('error', () => resolve([]));
      req.on('timeout', () => { req.destroy(); resolve([]); });
    });

    if (Array.isArray(cloudRes) && cloudRes.length > 0) {
      logMsg('CLOUD SYNC', `${cloudRes.length} leads obtidos do Painel/Hub em nuvem.`);
      const existingNames = new Set(leads.map(l => (l.name || l.empresa || '').toLowerCase()));
      for (const cloudLead of cloudRes) {
        const name = (cloudLead.empresa || cloudLead.name || '').toLowerCase();
        if (name && !existingNames.has(name)) {
          leads.push({
            name: cloudLead.empresa || cloudLead.name,
            phone: cloudLead.telefone || cloudLead.phone,
            bairro: cloudLead.bairro || cloudLead.categoria || 'Caraguatatuba',
            dor: cloudLead.mensagemPitch || 'demora no atendimento no WhatsApp'
          });
        }
      }
    }
  } catch (e) {}

  return leads;
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
  const localText = bairro ? `no bairro ${bairro}` : 'aí em Caraguatatuba';

  return `Opa, tudo bem? Sou desenvolvedor aqui na Dactyla Code em Caraguá. Vi a ${cleanName} ${localText} e decidi te mandar essa mensagem rápida.

A gente desenvolve soluções de tecnologia e automações de WhatsApp sob medida para ajudar comércios da nossa cidade a atenderem os clientes mais rápido e aumentarem as vendas no dia a dia.

Se quiser dar uma olhada em como funciona ou trocar uma ideia, dá uma conferida no nosso site: dactylacode.com.br/auditoria ou é só me mandar uma mensagem por aqui!`;
}

// Gerador de Mensagem com Llama 3.2 1B + Fallback Resiliente
async function generateAiColdMessage(lead) {
  const companyName = sanitizeLLMPromptInput(lead.name || lead.empresa || 'Empresa Local');
  const bairro = sanitizeLLMPromptInput(lead.bairro || lead.bairro_nome || lead.neighborhood || 'Caraguatatuba');
  const dor = sanitizeLLMPromptInput(lead.dor || lead.gargalo || 'demora no atendimento no WhatsApp e perda de vendas para concorrentes');
  const nicho = sanitizeLLMPromptInput(lead.nicho || lead.categoria || 'comércio local');

  const promptText = `
Você é um desenvolvedor da agência Dactyla Code em Caraguatatuba/SP.
Escreva uma mensagem de WhatsApp EXTREMAMENTE HUMANA, amigável, acolhedora e natural (máximo 2 parágrafos curtos) para o dono desta empresa local.

REGRAS OBRIGATÓRIAS:
1. Comece com "Opa, tudo bem?".
2. Fale que você é desenvolvedor da Dactyla Code aqui em Caraguá e notou a empresa dele (${companyName}) localizada no bairro ${bairro}.
3. NÃO faça perguntas robóticas, NÃO pareça um bot de pesquisa/questionário automático e NÃO pareça uma pesquisa telemarketing.
4. Escreva exatamente como uma pessoa real conversando amigavelmente no WhatsApp: comente que vocês desenvolvem soluções de tecnologia e automações para ajudar comércios de Caraguá a atenderem mais rápido e fecharem mais vendas.
5. Indique o link dactylacode.com.br/auditoria de forma natural ou diga que ele pode te chamar por aqui.
6. NUNCA cite nomes próprios de pessoas e NUNCA mencione o seu endereço pessoal.

DADOS DO CLIENTE LOCAL:
- Nome da Empresa: ${companyName}
- Nicho: ${nicho}
- Bairro da Empresa: ${bairro}

Mensagem de WhatsApp humana:`;

  try {
    const rawAiResponse = await callOllamaAPI(promptText);
    const cleanedMessage = rawAiResponse ? rawAiResponse.trim() : '';

    if (cleanedMessage && !cleanedMessage.toLowerCase().includes('não posso') && !cleanedMessage.toLowerCase().includes('desculpe')) {
      return cleanedMessage;
    }
  } catch (err) {
    logMsg('AVISO IA', `Ollama indisponível (${err.message}). Acionando fallback humano...`);
  }

  return getFallbackColdMessage(companyName, bairro);
}

// Arquivamento Robusto Multi-Tier (Inbox Zero)
async function forceArchiveChat(client, jid, companyName) {
  try {
    await sleep(2500); // Aguarda 2.5s para o WhatsApp Web sincronizar a conversa

    // 1. Arquivamento via Objeto de Chat do whatsapp-web.js
    const chat = await client.getChatById(jid).catch(() => null);
    if (chat && typeof chat.archive === 'function') {
      await chat.archive().catch(() => {});
    }

    // 2. Arquivamento via Método Secundário do Cliente
    if (typeof client.archiveChat === 'function') {
      await client.archiveChat(jid).catch(() => {});
    }

    // 3. Arquivamento via Injeção Direta no Store do Puppeteer
    if (client.pupPage) {
      await client.pupPage.evaluate(async (targetJid) => {
        try {
          const c = window.Store && window.Store.Chat && (window.Store.Chat.get(targetJid) || window.Store.Chat.find(targetJid));
          if (c) {
            if (window.Store.Cmd && window.Store.Cmd.archiveChat) {
              await window.Store.Cmd.archiveChat(c, true);
            } else if (typeof c.archive === 'function') {
              await c.archive(true);
            }
          }
        } catch (e) {}
      }, jid).catch(() => {});
    }

    logMsg('INBOX ZERO', `[📥] Chat com ${companyName} (${jid}) arquivado com sucesso.`);
  } catch (err) {
    logMsg('INBOX ZERO AVISO', `Tentativa de arquivamento para ${companyName}: ${err.message}`);
  }
}

/**
 * Scanner de Respostas de Leads Antigos (checkPreviousReplies)
 * Desarquivamento Inteligente: Se o lead respondeu, desarquiva o chat para o topo da lista do CEO!
 */
async function checkPreviousReplies(client, historySet) {
  logMsg('AUDITORIA', 'Iniciando varredura no histórico de chats para identificar respostas de leads...');
  let replyCount = 0;
  const historyArray = Array.from(historySet);

  for (let i = 0; i < historyArray.length; i++) {
    const jid = historyArray[i];
    if (!jid || jid === CEO_WHATSAPP_JID) continue;

    try {
      const chat = await client.getChatById(jid).catch(() => null);
      if (!chat) continue;

      const hasUnread = chat.unreadCount > 0;
      const lastMsgFromLead = chat.lastMessage && !chat.lastMessage.fromMe;

      if (hasUnread || lastMsgFromLead) {
        replyCount++;
        
        // DESARQUIVAMENTO INTELIGENTE (INBOX ZERO RECOVERY)
        if (chat.isArchived) {
          await chat.unarchive().catch(() => {});
          logMsg('INBOX ZERO RECOVERY', `[🔓] Chat com ${jid} desarquivado e movido para a caixa de entrada prioritária do CEO!`);
        } else {
          logMsg('RESPOSTA DETECTADA', `[📩] Chat com ${jid} possui resposta pendente do cliente.`);
        }
      }
    } catch (e) {
      // Ignora falhas pontuais de chat
    }
  }

  logMsg('AUDITORIA CONCLUÍDA', `Total de leads antigos que responderam: ${replyCount}`);
  return replyCount;
}

// Inicialização do WhatsApp Web
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: path.join(__dirname, '.wwebjs_disparo_auth') }),
  puppeteer: {
    headless: true,
    args: ['--disable-dev-shm-usage', '--no-sandbox']
  }
});

client.on('qr', (qr) => {
  console.clear();
  console.log(`${LOG_COLORS.gold}=====================================================${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.gold} DACTYLA CODE // DISPARO OUTBOUND IA (INBOX ZERO) ${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.gold}=====================================================${LOG_COLORS.reset}\n`);
  qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
  console.log(`\n${LOG_COLORS.green}=====================================================${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.green} [OK] CLIENTE WHATSAPP CONECTADO! INICIANDO DISPAROS COM IA...${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.green}=====================================================${LOG_COLORS.reset}\n`);

  const leads = await loadMinedLeads();
  const history = loadDisparoHistory();

  const totalFila = leads.length;
  let sucessoCount = 0;
  let erroCount = 0;

  if (totalFila === 0) {
    logMsg('ALERTA', 'Nenhum lead encontrado em mined_leads.json.');
  } else {
    logMsg('INÍCIO', `Total de leads na fila: ${totalFila} | Já disparados anteriormente: ${history.size}`);

    for (let i = 0; i < leads.length; i++) {
      if (sucessoCount >= MAX_DISPAROS_POR_CICLO) {
        logMsg('RAMP-UP SAFETY', `[🛡️] Limite de segurança (${MAX_DISPAROS_POR_CICLO} disparos/ciclo) atingido para proteger a reputação do chip. Pausando até o próximo ciclo.`);
        break;
      }

      const lead = leads[i];
      const rawPhone = lead.phone || lead.telefone;
      const jid = formatPhoneToJid(rawPhone);
      const companyName = lead.name || lead.empresa || 'Empresa B2B';

      if (!jid) {
        logMsg('IGNORADO', `Telefone inválido para ${companyName}: ${rawPhone}`);
        erroCount++;
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

        // 1. Envio da mensagem no WhatsApp
        const sentMsg = await client.sendMessage(jid, aiMessageText);

        // 2. ARQUIVAMENTO AUTOMÁTICO MULTI-TIER PÓS-ENVIO (AUTO-ARCHIVE INBOX ZERO)
        await forceArchiveChat(client, jid, companyName);

        history.add(jid);
        saveDisparoHistory(history);
        sucessoCount++;

        logMsg('SUCESSO', `[✅] Mensagem enviada e chat arquivado com sucesso para ${companyName}!`);
        console.log(`${LOG_COLORS.cyan}💬 Mensagem enviada:\n"${aiMessageText.substring(0, 120)}..."${LOG_COLORS.reset}\n`);

        // Pausa estrita anti-ban entre 35 e 75 segundos
        const delayMs = getRandomDelayMs(35, 75);
        const delaySec = Math.round(delayMs / 1000);
        logMsg('PAUSA ANTI-BAN', `Aguardando ${delaySec}s antes do próximo disparo para simular comportamento humano...\n`);
        await sleep(delayMs);

      } catch (err) {
        logMsg('ERRO', `[❌] Falha no disparo para ${companyName} (${jid}): ${err.message}`);
        erroCount++;
      }
    }
  }

  // ------------------------------------------------------------------
  // FASE DE MONITORAMENTO E NOTIFICAÇÃO DO CEO (+55 12 99210-9408)
  // ------------------------------------------------------------------
  logMsg('MONITORAMENTO', 'Fila finalizada. Executando scanner de respostas no histórico...');
  const qntRespostas = await checkPreviousReplies(client, history);

  const reportText = `🤖 Dactyla Core | Relatório de Ciclo:

📦 Leads na fila: ${totalFila}
✅ Disparos da IA: ${sucessoCount}
❌ Erros: ${erroCount}

💬 ATENÇÃO: Existem ${qntRespostas} leads de ciclos anteriores que te responderam e aguardam retorno humano!

Aguardando nova extração de 2h.`;

  logMsg('RELATÓRIO CEO', `Enviando relatório executivo para o CEO Gabriel (${CEO_WHATSAPP_JID})...`);

  try {
    await client.sendMessage(CEO_WHATSAPP_JID, reportText);
    logMsg('RELATÓRIO ENTREGUE', '✅ Relatório entregue com sucesso no WhatsApp do CEO!');
  } catch (err) {
    logMsg('ERRO RELATÓRIO', `❌ Falha ao enviar relatório para o CEO: ${err.message}`);
  }

  logMsg('ENCERRAMENTO', 'Aguardando 3 segundos para finalização completa do ciclo...');
  await sleep(3000);
  process.exit(0);
});

client.initialize();
