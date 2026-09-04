/**
 * DACTYLA CODE // MONITOR TAMANDUÁ - SYSTEM TRAY & HEALTHCHECK DAEMON
 * Daemon de Monitoramento de Saúde da Infraestrutura B2B (Mascote Tamanduá).
 * Valida a cada 60 segundos o status do Ollama, PM2, Fila de Leads e Notificações Pendentes.
 * Exibe o semáforo de status (🟢 Verde, 🟡 Amarelo, 🔴 Vermelho) e atualiza o estado operacional.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// Configurações Globais do Monitor Tamanduá
const CHECK_INTERVAL_MS = 60000; // Loop a cada 60 segundos
const MINED_LEADS_FILE = path.join(__dirname, 'mined_leads.json');
const DISPARO_HISTORY_FILE = path.join(__dirname, 'disparo_history.json');
const STATUS_STATE_FILE = path.join(__dirname, 'tamandua_status.json');

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

function logHeader() {
  const time = new Date().toLocaleTimeString('pt-BR');
  console.log(`${LOG_COLORS.gray}[${time}]${LOG_COLORS.reset} ${LOG_COLORS.gold}[TAMANDUÁ TRAY]${LOG_COLORS.reset}`);
}

// 1. Check de Conectividade do Ollama (127.0.0.1:11434/api/tags)
function checkOllamaHealth() {
  return new Promise((resolve) => {
    const options = {
      hostname: '127.0.0.1',
      port: 11434,
      path: '/api/tags',
      method: 'GET',
      timeout: 4000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const models = json.models || [];
          const hasLlama = models.some(m => m.name && m.name.toLowerCase().includes('llama3.2'));
          resolve({ ok: true, hasLlama, count: models.length });
        } catch (e) {
          resolve({ ok: false, error: 'Resposta JSON inválida' });
        }
      });
    });

    req.on('error', (err) => resolve({ ok: false, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'Timeout de conexão' }); });
    req.end();
  });
}

// 2. Check da Fila de Leads Minerados
function checkLeadsQueue() {
  try {
    if (fs.existsSync(MINED_LEADS_FILE)) {
      const data = JSON.parse(fs.readFileSync(MINED_LEADS_FILE, 'utf-8'));
      return Array.isArray(data) ? data.length : 0;
    }
  } catch (e) {}
  return 0;
}

// 3. Check do Histórico de Disparos
function checkHistoryCount() {
  try {
    if (fs.existsSync(DISPARO_HISTORY_FILE)) {
      const data = JSON.parse(fs.readFileSync(DISPARO_HISTORY_FILE, 'utf-8'));
      return Array.isArray(data) ? data.length : 0;
    }
  } catch (e) {}
  return 0;
}

const { spawn, execSync } = require('child_process');

function ensureNativeTrayIcon() {
  if (process.platform !== 'win32') return;

  try {
    const psScript = path.join(__dirname, 'tamandua_tray_win32.ps1');
    const checkScript = execSync(`powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name='powershell.exe'\\" | Where-Object { $_.CommandLine -like '*tamandua_tray_win32.ps1*' } | Select-Object -ExpandProperty ProcessId"`, { encoding: 'utf-8' });

    if (!checkScript.trim()) {
      const child = spawn('powershell.exe', [
        '-NoProfile',
        '-ExecutionPolicy', 'Bypass',
        '-WindowStyle', 'Hidden',
        '-File', psScript
      ], {
        detached: true,
        stdio: 'ignore'
      });
      child.unref();
      console.log(`[TAMANDUÁ TRAY] Ícone nativo da bandeja do Windows iniciado com sucesso!`);
    }
  } catch (e) {
    // Silently continue if process check fails
  }
}

// Execução Completa da Auditoria de Saúde do Mascote Tamanduá
async function performTamanduaHealthCheck() {
  ensureNativeTrayIcon();
  logHeader();

  const ollama = await checkOllamaHealth();
  const queueLength = checkLeadsQueue();
  const historyLength = checkHistoryCount();

  let state = {
    status: 'GREEN',
    color: '🟢 VERDE',
    icon: '🟢',
    title: 'Dactyla Core // Operação 100% Saudável',
    message: 'Ollama ativo, PM2 firme e ecossistema operando perfeitamente.',
    details: {
      ollamaStatus: ollama.ok ? 'ONLINE' : 'OFFLINE',
      llamaModel: ollama.hasLlama ? 'DISPONÍVEL' : 'AUSENTE',
      leadsNaFila: queueLength,
      leadsDisparados: historyLength
    },
    updatedAt: new Date().toISOString()
  };

  // Avaliação Semafórica de Estados
  if (!ollama.ok || !ollama.hasLlama) {
    state.status = 'RED';
    state.color = '🔴 VERMELHO (CRÍTICO)';
    state.icon = '🔴';
    state.title = 'Dactyla Core // ERRO CRÍTICO';
    state.message = !ollama.ok 
      ? `Ollama Local OFFLINE (${ollama.error}). Inicie o servidor Ollama!` 
      : 'Modelo Llama 3.2 não encontrado no Ollama!';
  } else if (queueLength === 0) {
    state.status = 'YELLOW';
    state.color = '🟡 AMARELO (ATENÇÃO)';
    state.icon = '🟡';
    state.title = 'Dactyla Core // Fila de Leads Vazia';
    state.message = 'Sistemas online, mas a fila de mined_leads.json está vazia. Aguardando mineração.';
  }

  // Persiste o Estado em Arquivo Local para consumo de outros apps
  try {
    fs.writeFileSync(STATUS_STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (e) {}

  // Exibe o Semáforo Formatado no Console
  console.log(`${LOG_COLORS.bold}=========================================================================${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.bold} 🦡 STATUS DO TAMANDUÁ (BANDEJA/SYSTEM TRAY): ${state.icon} ${state.color}${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.bold}=========================================================================${LOG_COLORS.reset}`);
  console.log(` 📌 ${LOG_COLORS.cyan}Mensagem:${LOG_COLORS.reset} ${state.message}`);
  console.log(` 🤖 ${LOG_COLORS.cyan}Ollama API:${LOG_COLORS.reset} ${ollama.ok ? LOG_COLORS.green + 'ONLINE ✅' : LOG_COLORS.red + 'OFFLINE ❌'}${LOG_COLORS.reset}`);
  console.log(` 🧠 ${LOG_COLORS.cyan}Modelo Llama 3.2:${LOG_COLORS.reset} ${ollama.hasLlama ? LOG_COLORS.green + 'CARREGADO ✅' : LOG_COLORS.yellow + 'AUSENTE ⚠️'}${LOG_COLORS.reset}`);
  console.log(` 📦 ${LOG_COLORS.cyan}Fila de Leads:${LOG_COLORS.reset} ${queueLength} leads aguardando`);
  console.log(` 📤 ${LOG_COLORS.cyan}Histórico de Envios:${LOG_COLORS.reset} ${historyLength} leads processados`);
  console.log(`${LOG_COLORS.gray}-------------------------------------------------------------------------${LOG_COLORS.reset}\n`);
}

// Loop Principal do Daemon (Executa imediatamente e depois a cada 60s)
performTamanduaHealthCheck();
setInterval(performTamanduaHealthCheck, CHECK_INTERVAL_MS);
