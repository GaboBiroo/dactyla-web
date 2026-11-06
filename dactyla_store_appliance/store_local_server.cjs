/**
 * DACTYLA STORE APPLIANCE // LOCAL-FIRST ON-PREMISE DAEMON (:4848)
 * Micro-servidor HTTP instalado nas dependências do comércio (ou pareado no host local)
 * que integra o Painel de Balcão (/balcao) ao Motor de Reativação e Agenda Preditiva.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const {
  buildPlaybookMessage,
  getRandomJitterMs
} = require('../dactyla_prospector/client_reactivation_engine.cjs');
const { sanitizeStrictPhoneJid } = require('../dactyla_prospector/security_sanitizer.cjs');

const PORT = parseInt(process.env.STORE_DAEMON_PORT || '4848', 10);
const QUEUE_FILE = path.join(__dirname, 'store_inactives_queue.json');
const SCHEDULED_RETURNS_FILE = path.join(__dirname, 'scheduled_returns.json');
const LEDGER_FILE = path.join(__dirname, '..', 'dactyla_prospector', 'reactivation_ledger.json');
const MAX_DAILY_PER_STORE = 20;

const NICHE_CYCLES = {
  oficina: 150,
  petshop: 30,
  barbearia: 21
};

function readJsonSafe(filePath, fallback) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (e) {}
  return fallback;
}

function writeJsonSafe(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {}
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getStoreTodayDispatches(storeId) {
  const ledger = readJsonSafe(LEDGER_FILE, {});
  const today = getTodayKey();
  return ledger?.[today]?.[storeId]?.count || 0;
}

function handleRequest(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://127.0.0.1:${PORT}`);

  // 1. GET /api/status — Telemetria do Appliance Local
  if (req.method === 'GET' && parsedUrl.pathname === '/api/status') {
    const queue = readJsonSafe(QUEUE_FILE, []);
    const scheduled = readJsonSafe(SCHEDULED_RETURNS_FILE, []);
    const storeId = queue[0]?.id_loja || 'oficina_litoral_caragua';
    const dailyUsed = getStoreTodayDispatches(storeId);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        ok: true,
        daemon: 'dactyla-store-appliance-v2',
        port: PORT,
        dailyCap: MAX_DAILY_PER_STORE,
        dailyUsed,
        inactiveQueueCount: queue.length,
        scheduledFutureReturnsCount: scheduled.length,
        timestamp: new Date().toISOString()
      })
    );
    return;
  }

  // 2. POST /api/service-ready — Disparo 1-Clique de Carro/Pet Pronto + Agendamento Preditivo
  if (req.method === 'POST' && parsedUrl.pathname === '/api/service-ready') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const storeName = payload.storeName || 'Loja Parceira Caraguá';
        const niche = String(payload.niche || 'oficina').toLowerCase();
        const customerName = payload.customerName || 'Cliente';
        const customerPhone = payload.customerPhone || '';
        const itemPetOrCar = payload.itemPetOrCar || 'atendimento';
        const campaignType = payload.campaignType || 'SERVICO_CONCLUIDO';

        const jid = sanitizeStrictPhoneJid(customerPhone);
        if (!jid) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'Número de celular inválido.' }));
          return;
        }

        const message = buildPlaybookMessage({
          nome_loja: storeName,
          nicho: niche,
          campanha_tipo: campaignType,
          nome_cliente: customerName,
          telefone: customerPhone,
          item_pet_ou_carro: itemPetOrCar,
          dias_inativo: 0
        });

        const cycleDays = NICHE_CYCLES[niche] || 60;
        const nextReturnDate = new Date(Date.now() + cycleDays * 86400000).toISOString().slice(0, 10);

        const scheduledList = readJsonSafe(SCHEDULED_RETURNS_FILE, []);
        const scheduleEntry = {
          id: `sched_${Date.now()}`,
          storeName,
          niche,
          customerName,
          phoneJid: jid,
          itemPetOrCar,
          serviceCompletedAt: new Date().toISOString(),
          nextReactivationDate: nextReturnDate,
          cycleDays,
          messageSent: message
        };

        scheduledList.push(scheduleEntry);
        writeJsonSafe(SCHEDULED_RETURNS_FILE, scheduledList);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            ok: true,
            message: 'Aviso processado e retorno preditivo agendado localmente.',
            entry: scheduleEntry,
            jitterPreviewMs: getRandomJitterMs(45, 120)
          })
        );
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: false, error: 'Endpoint não encontrado no Store Appliance.' }));
}

function startStoreDaemon(port = PORT) {
  const server = http.createServer(handleRequest);
  server.listen(port, '127.0.0.1', () => {
    console.log('================================================================================');
    console.log(` DACTYLA STORE APPLIANCE // DAEMON LOCAL ATIVO EM http://127.0.0.1:${port}`);
    console.log(' Endpoints: GET /api/status | POST /api/service-ready');
    console.log('================================================================================');
  });
  return server;
}

if (require.main === module) {
  startStoreDaemon();
}

module.exports = {
  startStoreDaemon,
  handleRequest
};
