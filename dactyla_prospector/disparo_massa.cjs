/**
 * DACTYLA CODE // DISPARO EM MASSA OUTBOUND IA + INBOX ZERO ARCHITECTURE (V2 - RISCO ZERO 48H)
 * Motor autônomo de prospecção B2B focado nos 3 subnichos de Caraguatatuba/SP:
 * 1. Oficinas Mecânicas / Troca de Óleo (Ticket R$ 320 | Ciclo 150 dias)
 * 2. Pet Shops / Banho & Tosa (Ticket R$ 85 | Ciclo 30 dias)
 * 3. Barbearias (Ticket R$ 75 | Ciclo 21 dias)
 * Inclui Spintax nativo, trava de horário comercial, simulação de digitação de 4s e Jitter de 45s a 120s.
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

// Configurações Globais do Sistema
const CEO_WHATSAPP_NUMBER = process.env.VITE_DACTYLA_WHATSAPP || process.env.DACTYLA_WHATSAPP || '5512992109408';
const CEO_WHATSAPP_JID = `${CEO_WHATSAPP_NUMBER.replace(/\D/g, '')}@c.us`;
const LEADS_FILE = path.join(__dirname, 'mined_leads.json');
const UNUSED_LEADS_FILE = path.join(__dirname, 'mined_leads_unused.json');
const DISPARO_HISTORY_FILE = path.join(__dirname, 'disparo_history.json');
const MAX_DISPAROS_POR_CICLO = parseInt(process.env.MAX_DISPAROS_POR_CICLO || '15', 10);
const TYPING_SIMULATION_MS = 4000;

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

// Jitter Randômico Anti-Ban atualizado: 45s a 120s
function getRandomDelayMs(minSec = 45, maxSec = 120) {
  const minMs = minSec * 1000;
  const maxMs = maxSec * 1000;
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Trava de Horário Comercial (Seg-Sáb das 08:30 às 18:30, ou override via --force / FORCE_OUTSIDE_HOURS=true)
function isWithinBusinessHours() {
  if (process.argv.includes('--force') || process.env.FORCE_OUTSIDE_HOURS === 'true') {
    return true;
  }
  const now = new Date();
  const day = now.getDay(); // 0 = Domingo
  if (day === 0) return false;
  const decimalHour = now.getHours() + now.getMinutes() / 60;
  return decimalHour >= 8.5 && decimalHour <= 18.5;
}

// Motor Recursivo de Spintax: converte "{Olá|Opa|Fala}" em uma escolha aleatória natural
function resolveSpintax(template) {
  if (!template) return '';
  let result = String(template);
  const pattern = /\{([^{}]+)\}/g;
  let safetyCounter = 0;
  while (pattern.test(result) && safetyCounter < 20) {
    result = result.replace(pattern, (_, group) => {
      const options = group.split('|');
      return options[Math.floor(Math.random() * options.length)];
    });
    safetyCounter++;
  }
  return result;
}

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

function formatPhoneToJid(phoneStr) {
  return sanitizeStrictPhoneJid(phoneStr);
}

// Validação estrita de número celular (DDD 12 + 9º dígito 9)
function isMobilePhone(phoneStr) {
  if (!phoneStr) return false;
  const digits = String(phoneStr).replace(/\D/g, '');
  if (digits.startsWith('5512')) {
    return digits.length === 13 && digits.charAt(4) === '9';
  }
  if (digits.startsWith('12')) {
    return digits.length === 11 && digits.charAt(2) === '9';
  }
  if (digits.startsWith('55')) {
    return digits.length === 13 && digits.charAt(4) === '9';
  }
  if (digits.length === 11) {
    return digits.charAt(2) === '9';
  }
  return false;
}

// Carrega base de leads não usados (Prioriza mined_leads_unused.json)
async function loadMinedLeads() {
  let leads = [];
  const fileToLoad = fs.existsSync(UNUSED_LEADS_FILE) ? UNUSED_LEADS_FILE : LEADS_FILE;

  try {
    if (fs.existsSync(fileToLoad)) {
      const data = fs.readFileSync(fileToLoad, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) leads = parsed;
    }
  } catch (e) {
    console.error('Erro ao carregar arquivo de leads:', e.message);
  }

  try {
    const cloudRes = await new Promise((resolve) => {
      const req = https.get('https://www.dactylacode.com.br/api/leads-sync', { timeout: 4000 }, (res) => {
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
            category: cloudLead.categoria || 'Comércio Local',
            bairro: cloudLead.bairro || 'Caraguatatuba',
            dor: cloudLead.mensagemPitch || 'reativação de clientes inativos'
          });
        }
      }
    }
  } catch (e) {}

  return leads;
}

function saveUnusedLeads(remainingUnusedLeads) {
  try {
    fs.writeFileSync(UNUSED_LEADS_FILE, JSON.stringify(remainingUnusedLeads, null, 2), 'utf-8');
    fs.writeFileSync(LEADS_FILE, JSON.stringify(remainingUnusedLeads, null, 2), 'utf-8');
    logMsg('QUEUE SYNC', `[💾] Fila de leads não usados salva: ${remainingUnusedLeads.length} leads pendentes.`);
  } catch (e) {
    console.error('Erro ao salvar fila de leads não usados:', e.message);
  }
}

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

function detectNicheType(category = '', companyName = '') {
  const combined = `${category} ${companyName}`.toLowerCase();
  if (/oficina|auto|óleo|oleo|mecânic|mecanic|pneu|alinhamento/i.test(combined)) return 'oficina';
  if (/pet|banho|tosa|vet|cão|cao|gato/i.test(combined)) return 'petshop';
  if (/barbearia|barber|cabelo|barba/i.test(combined)) return 'barbearia';
  return 'geral';
}

function getFallbackColdMessage(companyName, bairro, category = '') {
  const cleanName = companyName || 'sua loja';
  const localText = bairro ? `aí em ${bairro}` : 'aqui em Caraguatatuba';
  const niche = detectNicheType(category, cleanName);

  if (niche === 'oficina') {
    const spintaxOficina = `{Opa, tudo bem?|Fala campeão, tudo joia?|Bom dia, tudo tranquilo?} Sou {engenheiro|desenvolvedor} da Dactyla Code aqui em Caraguá. Vi a *${cleanName}* ${localText} e resolvi te mandar um alô rápido.

A gente criou um motor que conecta no WhatsApp da própria oficina e chama automaticamente aqueles clientes de {troca de óleo|revisão preventiva|alinhamento e freios} que sumiram há mais de 5 meses. Pra você ver funcionando na prática, nós fazemos um *Teste de 48h com Risco Zero* para 60 clientes inativos seus — você só paga a implantação (R$ 400) depois de ver os carros agendando no box (e 1 carro recuperado no mês já paga os R$ 130 da manutenção!).

{Quer fazer esse teste de 48h sem compromisso essa semana?|Topa testar com 60 clientes sumidos aí da oficina?}`;
    return resolveSpintax(spintaxOficina);
  }

  if (niche === 'petshop') {
    const spintaxPet = `{Opa, tudo bem?|Olá, tudo joia por aí?|Oi, tudo tranquilo?} Sou da Dactyla Code aqui em Caraguá. Vi o *${cleanName}* ${localText} e queria te mostrar uma novidade bem legal pros Pet Shops da cidade.

Diferente de sistemas como o SimplesVet que cobram R$ 0,50 por mensagem, nosso motor conecta direto no seu WhatsApp atual (com R$ 0 de taxa por envio) para avisar com 1 clique quando o pet está pronto e reativar tutores que passaram de 30 dias sem dar banho. Liberamos um *Teste de 48h com Risco Zero* para 60 clientes sumidos da sua loja: você só paga o setup (R$ 400) depois de ver o pessoal agendando (e 2 banhos no mês já pagam os R$ 130 de mensalidade).

{Vamos testar essa semana sem custo inicial?|Posso liberar o teste de 48h aí pro Pet Shop?}`;
    return resolveSpintax(spintaxPet);
  }

  if (niche === 'barbearia') {
    const spintaxBarber = `{Opa, tudo bem?|Fala parceiro, tudo tranquilo?|E aí, tudo joia?} Sou da Dactyla Code aqui de Caraguá. Vi a *${cleanName}* ${localText} e decidi te mandar essa mensagem rápida.

Sabemos que quando o cliente demora 40 dias em vez de 21 pra voltar, a barbearia perde quase metade do lucro no ano. Nosso motor conecta no seu WhatsApp atual e chama de forma 100% humana os clientes sumidos pra lotar sua *terça e quarta-feira*. Fazemos um *Teste de 48h com Risco Zero* abordando 60 clientes inativos seus primeiro — você só paga os R$ 400 de setup depois de ver a cadeira enchendo!

{Bora rodar esse teste de 48h pra lotar a próxima terça e quarta?|Quer testar sem compromisso aí na barbearia?}`;
    return resolveSpintax(spintaxBarber);
  }

  const spintaxGeral = `{Opa, tudo bem?|Olá, tudo joia?} Sou desenvolvedor aqui na Dactyla Code em Caraguá. Vi a *${cleanName}* ${localText} e decidi te mandar essa mensagem rápida.

Nós instalamos um Motor de Reativação direto no seu WhatsApp atual que resgata clientes inativos e preenche os dias de menor movimento. Fazemos uma validação prática de *48h com Risco Zero* para 60 clientes antigos seus: você só paga o setup (R$ 400) depois que o dinheiro entrar no caixa (e a mensalidade é só R$ 130/mês sem taxa por mensagem).

Se quiser testar essa semana, me dá um alô por aqui ou simula seu retorno em: dactylacode.com.br/auditoria`;
  return resolveSpintax(spintaxGeral);
}

async function generateAiColdMessage(lead) {
  const companyName = sanitizeLLMPromptInput(lead.name || lead.empresa || 'Empresa Local');
  const bairro = sanitizeLLMPromptInput(lead.bairro || lead.bairro_nome || lead.neighborhood || 'Caraguatatuba');
  const category = sanitizeLLMPromptInput(lead.category || lead.categoria || 'Comércio Local');

  const promptText = `
Você é um engenheiro da Dactyla Code em Caraguatatuba/SP.
Escreva uma mensagem de WhatsApp EXTREMAMENTE HUMANA, direta e focada em dinheiro no caixa (máximo 2 parágrafos curtos) para o dono da empresa "${companyName}" (${category}) no bairro ${bairro}.

OFERTA OBRIGATÓRIA ("Protocolo Caixa Primeiro em 48h"):
1. Comece com "Opa, tudo bem?" e cite que viu a ${companyName} em ${bairro} aqui em Caraguá.
2. Ofereça o "Teste de 48h com Risco Zero": nós disparamos para 60 clientes inativos da loja direto no WhatsApp deles, e o lojista SÓ paga o setup de R$ 400 depois de ver os clientes respondendo e agendando (mensalidade de R$ 130/mês com zero taxa por mensagem).
3. Termine com uma pergunta curta convidando para fazer o teste de 48h essa semana.

Mensagem de WhatsApp humana:`;

  try {
    const rawAiResponse = await callOllamaAPI(promptText);
    const cleanedMessage = rawAiResponse ? rawAiResponse.trim() : '';

    if (cleanedMessage && cleanedMessage.length > 40 && !cleanedMessage.toLowerCase().includes('desculpe')) {
      return cleanedMessage;
    }
  } catch (err) {
    logMsg('FALLBACK SPINTAX', `Usando Playbook Spintax Nativo para ${companyName} (${category})...`);
  }

  return getFallbackColdMessage(companyName, bairro, category);
}

async function forceArchiveChat(client, jid, companyName) {
  try {
    await sleep(2500);

    const chat = await client.getChatById(jid).catch(() => null);
    if (chat && typeof chat.archive === 'function') {
      await chat.archive().catch(() => {});
    }

    if (typeof client.archiveChat === 'function') {
      await client.archiveChat(jid).catch(() => {});
    }

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
    logMsg('INBOX ZERO AVISO', `Arquivamento para ${companyName}: ${err.message}`);
  }
}

async function checkPreviousReplies(client, historySet) {
  logMsg('AUDITORIA', 'Iniciando varredura no histórico para identificar respostas de leads...');
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
        if (chat.isArchived) {
          await chat.unarchive().catch(() => {});
          logMsg('INBOX ZERO RECOVERY', `[🔓] Chat com ${jid} desarquivado e movido para a caixa de entrada do CEO!`);
        } else {
          logMsg('RESPOSTA DETECTADA', `[📩] Chat com ${jid} possui resposta pendente.`);
        }
      }
    } catch (e) {}
  }

  logMsg('AUDITORIA CONCLUÍDA', `Total de leads antigos que responderam: ${replyCount}`);
  return replyCount;
}

// Inicialização do WhatsApp Web Client
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
  console.log(`${LOG_COLORS.gold} DACTYLA CODE // DISPARO OUTBOUND 3 NICHOS (48H)     ${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.gold}=====================================================${LOG_COLORS.reset}\n`);
  qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
  console.log(`\n${LOG_COLORS.green}=====================================================${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.green} [OK] CLIENTE WHATSAPP CONECTADO! INICIANDO CICLO... ${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.green}=====================================================${LOG_COLORS.reset}\n`);

  if (!isWithinBusinessHours()) {
    logMsg('TRAVA HORÁRIO COMERCIAL', 'Fora do expediente comercial (Seg-Sáb 08:30 às 18:30). Ciclo abortado para proteção anti-ban (use --force para ignorar).');
    process.exit(0);
  }

  const initialLeads = await loadMinedLeads();
  const history = loadDisparoHistory();

  const totalInicial = initialLeads.length;
  let sucessoCount = 0;
  let erroCount = 0;
  const unusedLeadsQueue = [];

  if (totalInicial === 0) {
    logMsg('ALERTA', 'Nenhum lead não usado encontrado na fila.');
  } else {
    logMsg('INÍCIO', `Total de leads na fila de espera: ${totalInicial} | Já disparados historicamente: ${history.size}`);

    for (let i = 0; i < initialLeads.length; i++) {
      const lead = initialLeads[i];
      const rawPhone = lead.phone || lead.telefone;
      const companyName = lead.name || lead.empresa || 'Empresa B2B';

      if (!isMobilePhone(rawPhone)) {
        logMsg('FIXO IGNORADO', `[☎️] ${companyName} (${rawPhone}) é fixo. Removendo da fila.`);
        continue;
      }

      const jid = formatPhoneToJid(rawPhone);
      if (!jid || history.has(jid)) {
        logMsg('DUPLICADO / INVÁLIDO', `Lead ${companyName} (${rawPhone}) já enviado ou inválido. Removendo da fila.`);
        continue;
      }

      if (sucessoCount >= MAX_DISPAROS_POR_CICLO) {
        logMsg('RAMP-UP SAFETY', `[🛡️] Limite de segurança de ${MAX_DISPAROS_POR_CICLO} disparos/ciclo atingido.`);
        unusedLeadsQueue.push(lead);
        continue;
      }

      const isRegistered = await client.isRegisteredUser(jid).catch(() => false);
      if (!isRegistered) {
        logMsg('SEM WHATSAPP', `[🚫] ${companyName} (${rawPhone}) não tem WhatsApp. Removendo da fila.`);
        history.add(jid);
        saveDisparoHistory(history);
        continue;
      }

      logMsg('GERANDO COPY', `[${sucessoCount + 1}/${MAX_DISPAROS_POR_CICLO}] Preparando abordagem 48h para ${companyName}...`);
      const aiMessageText = await generateAiColdMessage(lead);

      try {
        const chat = await client.getChatById(jid).catch(() => null);
        if (chat && typeof chat.sendStateTyping === 'function') {
          await chat.sendStateTyping().catch(() => {});
        }
        await sleep(TYPING_SIMULATION_MS);

        logMsg('ENVIANDO', `Disparando mensagem para ${companyName} (${jid})...`);
        await client.sendMessage(jid, aiMessageText);
        await forceArchiveChat(client, jid, companyName);

        history.add(jid);
        saveDisparoHistory(history);
        sucessoCount++;

        logMsg('SUCESSO', `[✅] Mensagem enviada e chat arquivado para ${companyName}!`);
        console.log(`${LOG_COLORS.cyan}💬 Copy enviada:\n"${aiMessageText.substring(0, 140)}..."${LOG_COLORS.reset}\n`);

        const delayMs = getRandomDelayMs(45, 120);
        const delaySec = Math.round(delayMs / 1000);
        logMsg('PAUSA ANTI-BAN (45s-120s)', `Aguardando ${delaySec}s antes do próximo disparo...\n`);
        await sleep(delayMs);

      } catch (err) {
        logMsg('ERRO', `[❌] Falha no disparo para ${companyName} (${jid}): ${err.message}`);
        erroCount++;
        unusedLeadsQueue.push(lead);
      }
    }
  }

  saveUnusedLeads(unusedLeadsQueue);

  logMsg('MONITORAMENTO', 'Executando scanner de respostas no histórico...');
  const qntRespostas = await checkPreviousReplies(client, history);

  const reportText = `🤖 Dactyla Core | Relatório Outbound 3 Nichos (Protocolo 48h):

📦 Leads na fila de espera: ${unusedLeadsQueue.length}
✅ Disparos neste ciclo: ${sucessoCount}
❌ Erros: ${erroCount}

💬 ATENÇÃO: Existem ${qntRespostas} lojistas que responderam e aguardam retorno humano!`;

  logMsg('RELATÓRIO CEO', `Enviando relatório executivo para o CEO Gabriel (${CEO_WHATSAPP_JID})...`);

  try {
    await client.sendMessage(CEO_WHATSAPP_JID, reportText);
    logMsg('RELATÓRIO ENTREGUE', '✅ Relatório entregue no WhatsApp do CEO!');
  } catch (err) {
    logMsg('ERRO RELATÓRIO', `❌ Falha ao enviar relatório para o CEO: ${err.message}`);
  }

  logMsg('ENCERRAMENTO', 'Aguardando 3 segundos para finalização do ciclo...');
  await sleep(3000);
  process.exit(0);
});

if (require.main === module) {
  client.initialize();
}

module.exports = {
  resolveSpintax,
  getFallbackColdMessage,
  getRandomDelayMs,
  isWithinBusinessHours
};
