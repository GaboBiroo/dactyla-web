/**
 * DACTYLA CODE // SCRIPT DE PRÉ-VOO E SAUDABILIDADE DO SISTEMA (DEVSECOPS)
 * Valida a sessão de autenticação do Puppeteer, integridade dos arquivos JSON e conectividade do Ollama.
 * Retorna exit code 0 para liberar o agendamento no PM2 ou exit code 1 em caso de qualquer inconsistência.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// Caminhos dos Recursos do Sistema
const AUTH_DIR = path.join(__dirname, '.wwebjs_disparo_auth');
const MINED_LEADS_FILE = path.join(__dirname, 'mined_leads.json');
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

function logStep(status, text, isOk = true) {
  const symbol = isOk ? '✅ [OK]' : '❌ [ERRO]';
  const color = isOk ? LOG_COLORS.green : LOG_COLORS.red;
  console.log(`${color}${symbol}${LOG_COLORS.reset} ${LOG_COLORS.bold}${status}:${LOG_COLORS.reset} ${text}`);
}

// 1. Validação e Inicialização de Persistência da Sessão Puppeteer
function checkSessionAuth() {
  try {
    if (!fs.existsSync(AUTH_DIR)) {
      fs.mkdirSync(AUTH_DIR, { recursive: true });
      logStep('SESSÃO WHATSAPP', `Diretório de sessão (.wwebjs_disparo_auth) preparado para persistência LocalAuth.`);
    } else {
      logStep('SESSÃO WHATSAPP', `Pasta de autenticação (.wwebjs_disparo_auth) verificada com sucesso.`);
    }
    return true;
  } catch (err) {
    logStep('SESSÃO WHATSAPP', `Falha ao acessar diretório de autenticação: ${err.message}`, false);
    return false;
  }
}

// 2. Validação e Auto-Correção de Arquivos JSON
function checkJsonIntegrity(filePath, fileName) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf-8');
      logStep('INTEGRIDADE JSON', `Arquivo ${fileName} não existia. Criado automaticamente com array vazio [].`);
      return true;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    JSON.parse(content);
    logStep('INTEGRIDADE JSON', `Arquivo ${fileName} validado com sintaxe JSON correta.`);
    return true;
  } catch (err) {
    logStep('INTEGRIDADE JSON', `Arquivo ${fileName} está CORROMPIDO: ${err.message}`, false);
    return false;
  }
}

// 3. Healthcheck HTTP do Ollama (http://127.0.0.1:11434/api/tags)
function checkOllamaHealth() {
  return new Promise((resolve) => {
    const options = {
      hostname: '127.0.0.1',
      port: 11434,
      path: '/api/tags',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const models = json.models || [];
          const hasLlama = models.some(m => m.name && m.name.toLowerCase().includes('llama3.2'));

          if (hasLlama) {
            logStep('OLLAMA HEALTH', `Daemon ativo na porta 11434. Modelo Llama 3.2 detectado e operacional.`);
            resolve(true);
          } else {
            logStep('OLLAMA HEALTH', `Daemon ativo, mas o modelo 'llama3.2' não foi encontrado nos modelos baixados.`, false);
            resolve(false);
          }
        } catch (e) {
          logStep('OLLAMA HEALTH', `Resposta inválida da API do Ollama: ${e.message}`, false);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      logStep('OLLAMA HEALTH', `Daemon do Ollama offline na porta 11434: ${err.message}`, false);
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      logStep('OLLAMA HEALTH', `Timeout na conexão com o Ollama na porta 11434.`, false);
      resolve(false);
    });

    req.end();
  });
}

// Execução Principal da Suíte Pré-Voo
async function runPreFlightCheck() {
  console.log(`\n${LOG_COLORS.bold}${LOG_COLORS.gold}=========================================================================${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.bold}${LOG_COLORS.gold} DACTYLA CODE // SUÍTE DE CHECAGEM PRÉ-VOO & SAUDABILIDADE (DEVSECOPS) ${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.bold}${LOG_COLORS.gold}=========================================================================${LOG_COLORS.reset}\n`);

  const authOk = checkSessionAuth();
  const leadsJsonOk = checkJsonIntegrity(MINED_LEADS_FILE, 'mined_leads.json');
  const historyJsonOk = checkJsonIntegrity(DISPARO_HISTORY_FILE, 'disparo_history.json');
  const ollamaOk = await checkOllamaHealth();

  console.log(`\n${LOG_COLORS.cyan}-------------------------------------------------------------------------${LOG_COLORS.reset}`);

  if (authOk && leadsJsonOk && historyJsonOk && ollamaOk) {
    console.log(`${LOG_COLORS.bold}${LOG_COLORS.green} [ALL GREEN] SISTEMA PRONTO PARA OPERAÇÃO 24/7! ${LOG_COLORS.reset}`);
    console.log(`${LOG_COLORS.cyan}-------------------------------------------------------------------------${LOG_COLORS.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${LOG_COLORS.bold}${LOG_COLORS.red} ⛔ [FALHA NO PRÉ-VOO] SISTEMA INAPTO PARA DEPLOY NO PM2. CORRIJA OS ERROS ACIMA. ${LOG_COLORS.reset}`);
    console.log(`${LOG_COLORS.cyan}-------------------------------------------------------------------------${LOG_COLORS.reset}\n`);
    process.exit(1);
  }
}

runPreFlightCheck();
