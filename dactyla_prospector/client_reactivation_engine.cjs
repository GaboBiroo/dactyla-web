/**
 * DACTYLA CODE // MOTOR DE REATIVAÇÃO PREDITIVA B2B (CLIENT REACTIVATION ENGINE)
 * Este é o produto entregue aos lojistas de Caraguatatuba (Setup R$ 400 + R$ 130/mês).
 *
 * Funcionalidades:
 * 1. Lê lista de clientes inativos do lojista via JSON ou CSV:
 *    (nome_cliente, telefone, item_pet_ou_carro, dias_inativo, nicho, campanha_tipo, nome_loja, id_loja).
 * 2. Executa os 3 Playbooks Oficiais de Copywriting com Spintax Nativo:
 *    - REATIVACAO_PREDITIVA (Ciclo de 150d Oficina, 30d Pet Shop, 21d Barbearia)
 *    - SERVICO_CONCLUIDO (Aviso 1-clique de carro/pet pronto para liberar box ou gaiola)
 *    - OFERTA_TERCA_QUARTA (Preenchimento inteligente de horários ociosos de 3ª e 4ª feira)
 * 3. Simula digitação humana (sendStateTyping) por 4 segundos (4000ms).
 * 4. Aplica Jitter randômico anti-ban de 45s a 120s entre disparos.
 * 5. Aplica Trava Estrita de 20 disparos/dia por loja (persistida em reactivation_ledger.json).
 * 6. Suporta modo --dry-run para validação imediata no terminal sem abrir navegador.
 */

const fs = require('fs');
const path = require('path');
const { sanitizeStrictPhoneJid } = require('./security_sanitizer.cjs');

const DEFAULT_INPUT_FILE = path.join(__dirname, 'sample_client_inactives.json');
const LEDGER_FILE = path.join(__dirname, 'reactivation_ledger.json');
const MAX_DAILY_PER_STORE = parseInt(process.env.MAX_DAILY_PER_STORE || '20', 10);
const TYPING_DURATION_MS = 4000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Jitter Randômico Anti-Ban: 45s a 120s
function getRandomJitterMs(minSec = 45, maxSec = 120) {
  const minMs = minSec * 1000;
  const maxMs = maxSec * 1000;
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

// Resolvedor Recursivo de Spintax: "{opção1|opção2|opção3}"
function resolveSpintax(template) {
  if (!template) return '';
  let output = String(template);
  const regex = /\{([^{}]+)\}/g;
  let guard = 0;
  while (regex.test(output) && guard < 25) {
    output = output.replace(regex, (_, group) => {
      const choices = group.split('|');
      return choices[Math.floor(Math.random() * choices.length)];
    });
    guard++;
  }
  return output;
}

// ----------------------------------------------------------------------
// OS 3 PLAYBOOKS OFICIAIS DE COPYWRITING COM SPINTAX (POR SUBNICHO)
// ----------------------------------------------------------------------
function buildPlaybookMessage(record) {
  const nome = record.nome_cliente || 'Cliente';
  const item = record.item_pet_ou_carro || 'seu atendimento';
  const dias = Number(record.dias_inativo || 60);
  const loja = record.nome_loja || 'nossa loja';
  const nicho = String(record.nicho || 'oficina').toLowerCase();
  const campanha = String(record.campanha_tipo || 'REATIVACAO_PREDITIVA').toUpperCase();

  // PLAYBOOK 1: REATIVAÇÃO PREDITIVA (Clientes Inativos por Ciclo)
  if (campanha === 'REATIVACAO_PREDITIVA') {
    if (nicho === 'oficina') {
      const tpl = `{Fala|Opa|Bom dia} ${nome}, {tudo bem|tudo joia|tudo tranquilo}? Aqui é da *${loja}*. {Estava olhando nossa ficha aqui|O sistema acabou de me avisar aqui} e vi que já faz uns ${dias} dias desde a última manutenção do seu *${item}*. Como já bateu o ciclo de segurança {do óleo e dos filtros|da revisão preventiva}, separei {2 horários|uma vaga rápida no box} pra essa semana pra gente dar um check-up sem fila. {Prefere passar na terça ou na quarta?|Como está sua rotina essa semana pra encaixar?}`;
      return resolveSpintax(tpl);
    }

    if (nicho === 'petshop') {
      const tpl = `{Oi|Olá|Opa} ${nome}, {tudo bem|tudo joia}? Aqui é da equipe do *${loja}* 🐾. Passando porque já deu ${dias} dias desde o último banho {do(a)|de} *${item}* e {a galerinha aqui já está com saudade|já chegou a época de renovar o banho e a hidratação}! Temos {horários tranquilos|vagas sem espera} amanhã e depois. {Quer que eu já deixe reservado o horário dele(a)?|Qual melhor horário pra gente buscar ou você trazer?}`;
      return resolveSpintax(tpl);
    }

    // Barbearia / Padrão
    const tpl = `{Fala|E aí|Opa} ${nome}, {tudo tranquilo|beleza pura|tudo certo}? Aqui é da *${loja}* 💈. Vi aqui que já passaram ${dias} dias desde o seu último *${item}* — já tá na hora de {dar aquele talento no visual|alinhar o degradê e a barba}, hein! Essa semana ainda tenho {2 horários bons no final da tarde|alguns encaixes tranquilos na terça e na quarta}. {Bora garantir seu horário?|Qual dia fica melhor pra você colar aqui?}`;
    return resolveSpintax(tpl);
  }

  // PLAYBOOK 2: AVISO DE SERVIÇO CONCLUÍDO (Liberação Rápida de Box / Gaiola)
  if (campanha === 'SERVICO_CONCLUIDO') {
    if (nicho === 'oficina') {
      const tpl = `{Fala|Opa} ${nome}, {tudo certo|tudo joia}? Avisando aqui da *${loja}* que o serviço do seu *${item}* {já foi concluído com sucesso|já está 100% pronto e revisado no box}! 🔧 Quando quiser {vir buscar|passar aqui pra retirar}, já está liberado na frente pra você.`;
      return resolveSpintax(tpl);
    }

    if (nicho === 'petshop') {
      const tpl = `{Oi|Olá} ${nome}, {tudo bem|tudo ótimo}? Passando aqui do *${loja}* pra avisar que {o(a)} *${item}* já está {prontinho(a), cheiroso(a) e te esperando|100% pronto(a) do banho e tosa}! 🐶✨ Assim que puder vir buscar, é só chamar na recepção!`;
      return resolveSpintax(tpl);
    }

    const tpl = `{Olá|Opa} ${nome}, tudo certo? Avisando aqui da *${loja}* que o seu *${item}* já está {concluído e liberado|100% pronto}. Qualquer dúvida é só responder por aqui!`;
    return resolveSpintax(tpl);
  }

  // PLAYBOOK 3: OFERTA RELÂMPAGO DE TERÇA E QUARTA-FEIRA (Horários Ociosos)
  if (nicho === 'oficina') {
    const tpl = `{Fala|Opa} ${nome}, beleza? Aqui é da *${loja}*. Como {terça e quarta|no meio da semana} o movimento no box é mais tranquilo, liberamos *check-up gratuito de 15 itens + higienização do ar de cortesia* na troca de óleo e filtros do seu *${item}* para os próximos 5 clientes que agendarem pra amanhã ou quarta. {Quer aproveitar e já deixar reservado?|Posso segurar uma vaga pro seu carro?}`;
    return resolveSpintax(tpl);
  }

  if (nicho === 'petshop') {
    const tpl = `{Oi|Olá} ${nome}, tudo bem? Aqui é do *${loja}* 🐾. Liberamos a nossa *Terça & Quarta Vip*: agendando o banho {do(a)} *${item}* para terça ou quarta-feira agora, {a hidratação de pelos ou tosa higiênica sai de presente|você ganha a hidratação especial de cortesia}! Temos só 4 vagas disponíveis. {Quer que eu separe uma vaga pra vocês?|Vamos aproveitar essa semana?}`;
    return resolveSpintax(tpl);
  }

  const tpl = `{Fala|E aí} ${nome}, tranquilo? Aqui é da *${loja}* 💈. Pra quem curte cortar sem pressa no meio da semana, liberamos a condição especial de *Terça e Quarta* no *${item}* com {toalha quente e finalização premium inclusa|desconto especial no combo}. {Quer garantir um horário amanhã ou quarta?|Qual horário fica top pra você?}`;
  return resolveSpintax(tpl);
}

// ----------------------------------------------------------------------
// PARSER UNIFICADO DE ARQUIVO DE ENTRADA (JSON OU CSV)
// ----------------------------------------------------------------------
function loadClientInactiveList(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo de clientes inativos não encontrado: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf-8').trim();
  if (!raw) return [];

  if (filePath.toLowerCase().endsWith('.json')) {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  }

  // Parser CSV (cabeçalho: nome_cliente,telefone,item_pet_ou_carro,dias_inativo,nicho,campanha_tipo,nome_loja,id_loja)
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] ?? '';
    });
    obj.dias_inativo = parseInt(obj.dias_inativo || '60', 10);
    return obj;
  });
}

// ----------------------------------------------------------------------
// CONTROLE DE LIMITE DIÁRIO ANTI-BAN POR LOJA (MÁX 20 DISPAROS/DIA/LOJA)
// ----------------------------------------------------------------------
function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadDailyLedger() {
  try {
    if (fs.existsSync(LEDGER_FILE)) {
      return JSON.parse(fs.readFileSync(LEDGER_FILE, 'utf-8'));
    }
  } catch (e) {}
  return {};
}

function saveDailyLedger(ledger) {
  try {
    fs.writeFileSync(LEDGER_FILE, JSON.stringify(ledger, null, 2), 'utf-8');
  } catch (e) {}
}

function canStoreDispatchToday(ledger, storeId) {
  const today = getTodayKey();
  const count = ledger?.[today]?.[storeId]?.count || 0;
  return count < MAX_DAILY_PER_STORE;
}

function registerStoreDispatch(ledger, storeId, jid) {
  const today = getTodayKey();
  if (!ledger[today]) ledger[today] = {};
  if (!ledger[today][storeId]) {
    ledger[today][storeId] = { count: 0, jids: [] };
  }
  ledger[today][storeId].count += 1;
  ledger[today][storeId].jids.push(jid);
  saveDailyLedger(ledger);
}

// ----------------------------------------------------------------------
// EXECUÇÃO DO MOTOR DE REATIVAÇÃO (DRY-RUN OU WHATSAPP LIVE)
// ----------------------------------------------------------------------
async function runReactivationEngine(options = {}) {
  const isDryRun = Boolean(options.dryRun || process.argv.includes('--dry-run'));
  const fileArgIndex = process.argv.findIndex(arg => arg === '--file');
  const inputFile = options.inputFile || (fileArgIndex >= 0 ? process.argv[fileArgIndex + 1] : DEFAULT_INPUT_FILE);

  console.log('================================================================================');
  console.log(' DACTYLA CODE // MOTOR DE REATIVAÇÃO PREDITIVA B2B (PROTOCOLO 48H RISCO ZERO)');
  console.log(` Modo: ${isDryRun ? 'SIMULAÇÃO DRY-RUN (Validação de Spintax & Anti-Ban)' : 'PRODUÇÃO WHATSAPP LIVE'}`);
  console.log(` Limite de Segurança Anti-Ban: Máx. ${MAX_DAILY_PER_STORE} disparos/dia por loja`);
  console.log('================================================================================\n');

  const records = loadClientInactiveList(inputFile);
  const ledger = loadDailyLedger();
  const results = [];

  if (isDryRun) {
    for (let i = 0; i < records.length; i++) {
      const rec = records[i];
      const storeId = rec.id_loja || rec.nome_loja || 'loja_padrao';
      const jid = sanitizeStrictPhoneJid(rec.telefone);

      if (!jid) {
        console.log(` [⚠️ IGNORADO] Telefone inválido para ${rec.nome_cliente}: ${rec.telefone}`);
        continue;
      }

      if (!canStoreDispatchToday(ledger, storeId)) {
        console.log(` [🛡️ TRAVA 20/DIA] Loja "${storeId}" atingiu o limite diário de ${MAX_DAILY_PER_STORE} disparos.`);
        continue;
      }

      const message = buildPlaybookMessage(rec);
      const jitterMs = getRandomJitterMs(45, 120);

      console.log(` [${i + 1}/${records.length}] LOJA: ${rec.nome_loja} (${rec.nicho.toUpperCase()}) | CAMPANHA: ${rec.campanha_tipo}`);
      console.log(`  ➔ Destinatário: ${rec.nome_cliente} (${jid}) | Item: ${rec.item_pet_ou_carro} | Inativo: ${rec.dias_inativo}d`);
      console.log(`  ➔ Simulação Digitação: ${TYPING_DURATION_MS}ms | Próximo Jitter Anti-Ban: ${Math.round(jitterMs / 1000)}s`);
      console.log(`  ➔ Mensagem Spintax:\n     "${message}"\n`);

      results.push({ storeId, jid, message, jitterMs });
    }

    console.log('================================================================================');
    console.log(` [✅ DRY-RUN CONCLUÍDO] ${results.length} mensagens válidas geradas e prontas para disparo.`);
    console.log('================================================================================');
    return results;
  }

  // Modo Produção (WhatsApp Web LocalAuth)
  const { Client, LocalAuth } = require('whatsapp-web.js');
  const qrcode = require('qrcode-terminal');

  const client = new Client({
    authStrategy: new LocalAuth({ dataPath: path.join(__dirname, '.wwebjs_reactivation_auth') }),
    puppeteer: {
      headless: true,
      args: ['--disable-dev-shm-usage', '--no-sandbox']
    }
  });

  client.on('qr', (qr) => {
    console.log('\n [📱 ESCANEIE O QR CODE DO WHATSAPP DA LOJA PARCEIRA]:\n');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', async () => {
    console.log('\n [OK] WHATSAPP DA LOJA CONECTADO! INICIANDO CADÊNCIA DE REATIVAÇÃO...\n');

    for (let i = 0; i < records.length; i++) {
      const rec = records[i];
      const storeId = rec.id_loja || rec.nome_loja || 'loja_padrao';
      const jid = sanitizeStrictPhoneJid(rec.telefone);

      if (!jid) continue;

      if (!canStoreDispatchToday(ledger, storeId)) {
        console.log(` [🛡️ TRAVA 20/DIA] Loja "${storeId}" atingiu o limite diário de ${MAX_DAILY_PER_STORE} disparos.`);
        continue;
      }

      const isRegistered = await client.isRegisteredUser(jid).catch(() => false);
      if (!isRegistered) {
        console.log(` [🚫 SEM WHATSAPP] ${rec.nome_cliente} (${jid}) não possui conta ativa.`);
        continue;
      }

      const message = buildPlaybookMessage(rec);

      try {
        const chat = await client.getChatById(jid).catch(() => null);
        if (chat && typeof chat.sendStateTyping === 'function') {
          await chat.sendStateTyping().catch(() => {});
        }
        await sleep(TYPING_DURATION_MS);

        await client.sendMessage(jid, message);
        registerStoreDispatch(ledger, storeId, jid);

        const jitterMs = getRandomJitterMs(45, 120);
        console.log(` [✅ ENVIADO] ${rec.nome_cliente} (${jid}) | Aguardando Jitter de ${Math.round(jitterMs / 1000)}s...`);
        await sleep(jitterMs);
      } catch (err) {
        console.error(` [❌ ERRO] Falha ao enviar para ${rec.nome_cliente} (${jid}): ${err.message}`);
      }
    }

    console.log('\n [🏁 CICLO DE REATIVAÇÃO FINALIZADO COM SUCESSO]');
    await sleep(2000);
    process.exit(0);
  });

  client.initialize();
}

if (require.main === module) {
  runReactivationEngine();
}

module.exports = {
  resolveSpintax,
  buildPlaybookMessage,
  getRandomJitterMs,
  loadClientInactiveList,
  runReactivationEngine
};
