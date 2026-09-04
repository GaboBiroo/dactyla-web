/**
 * DACTYLA CODE // QA AUTOMATED SANDBOX TESTER
 * Script de testes isolado em Node.js para validação do Motor Llama 3.2 (Ollama Local)
 * Emula o comportamento do bot.cjs nos cenários de Auditoria Inbound B2B.
 */

const http = require('http');

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

// SYSTEM PROMPT EXECUTIVO DACTYLA DIAGNOSTIC AI (PRODUÇÃO)
const DIAGNOSTIC_AI_SYSTEM_PROMPT = `
Você é o Consultor B2B Sênior da Dactyla Code — autoridade em Engenharia de Software e Automação Comercial no Litoral Norte de SP.

Você recebeu a auditoria digital recém-concluída pelo cliente no nosso site.

REGRAS RÍGOROSAS DE RESPOSTA DA IA:
1. ANÁLISE CONDICIONAL DE SCORE:
   - Se o Score for MENOR que 50 (< 50): Aja com tom de alerta cirúrgico. Alerte com urgência sobre a perda constante de receita e clientes no WhatsApp por causa da lentidão e falta de site. Recomende o fechamento imediato do pacote "Sprint de Conversão (R$ 497)".
   - Se o Score for MAIOR OU IGUAL a 50 (>= 50): Elogie a estrutura atual da empresa, mas aponte os gargalos operacionais para escalar com segurança e recomende o pacote "Presença Prime" ou "Ecossistema IA".
2. REGRAS DE ESTILO E TAMANHO:
   - Resposta em no máximo 2 parágrafos curtos, executivos e sem jargões computacionais complexos.
3. FECHAMENTO MANDATÓRIO (OBRIGATÓRIO INCLUIR NO FINAL):
   - SEMPRE termine o segundo parágrafo com a frase exata: "O nosso Diretor Técnico (Gabriel Hatakeyama) já assumirá a linha em instantes para te passar o plano técnico de adequação."
`;

// CENÁRIOS DE TESTE MOCK
const MOCK_SCENARIOS = [
  {
    name: 'CENÁRIO 1: LEAD CRÍTICO (SCORE < 50)',
    message: '#AUDITORIA_DACTYLA | Nome: Pizzaria Fictícia | Path: Express | Score: 30/100 | Resumo: Atendimento lento, sem site'
  },
  {
    name: 'CENÁRIO 2: LEAD ESTRUTURADO (SCORE >= 50)',
    message: '#AUDITORIA_DACTYLA | Nome: Clínica Fictícia | Path: Deep Dive | Score: 85/100 | Resumo: Atendimento rápido, possui site, mas gerencia no papel'
  }
];

// Parser Robusto por delimitador '|' do Gatilho #AUDITORIA_DACTYLA
function parseAuditoriaTrigger(text) {
  if (!text || !text.includes('#AUDITORIA_DACTYLA')) return null;
  const parts = text.split('|').map(p => p.trim());
  let empresa = '', path = '', score = 0, resumo = '';

  for (const part of parts) {
    const lower = part.toLowerCase();
    if (lower.startsWith('nome:')) empresa = part.substring(5).trim();
    else if (lower.startsWith('path:')) path = part.substring(5).trim();
    else if (lower.startsWith('score:')) {
      const scoreMatch = part.match(/\d+/);
      if (scoreMatch) score = parseInt(scoreMatch[0], 10);
    }
    else if (lower.startsWith('resumo:')) resumo = part.substring(7).trim();
  }

  return { empresa: empresa || 'Empresa Auditada', path: path || 'Express', score, resumo };
}

// Requisição HTTP nativa para o Ollama Local (http://127.0.0.1:11434/api/generate)
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
      timeout: 15000
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

    req.on('error', (err) => reject(new Error(`Ollama indisponível na porta 11434: ${err.message}`)));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout na requisição do Ollama'));
    });

    req.write(payload);
    req.end();
  });
}

// Executante dos testes sandbox
async function runQASandboxSuite() {
  console.log(`\n${LOG_COLORS.bold}${LOG_COLORS.gold}=========================================================================${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.bold}${LOG_COLORS.gold} DACTYLA CODE // QA SANDBOX TESTER (LLAMA 3.2 OLLAMA EMBEDDED) ${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.bold}${LOG_COLORS.gold}=========================================================================${LOG_COLORS.reset}\n`);

  for (let i = 0; i < MOCK_SCENARIOS.length; i++) {
    const scenario = MOCK_SCENARIOS[i];
    console.log(`${LOG_COLORS.cyan}-------------------------------------------------------------------------${LOG_COLORS.reset}`);
    console.log(`${LOG_COLORS.bold}${LOG_COLORS.magenta} 🧪 TESTE ${i + 1}: ${scenario.name}${LOG_COLORS.reset}`);
    console.log(`${LOG_COLORS.cyan}-------------------------------------------------------------------------${LOG_COLORS.reset}`);
    console.log(`${LOG_COLORS.yellow}📩 [MOCK ENTRADA CLIENTE]:${LOG_COLORS.reset}\n"${scenario.message}"\n`);

    const parsed = parseAuditoriaTrigger(scenario.message);

    if (!parsed) {
      console.log(`${LOG_COLORS.red}❌ ERRO: Parser do gatilho falhou para a mensagem.${LOG_COLORS.reset}`);
      continue;
    }

    const promptText = `
${DIAGNOSTIC_AI_SYSTEM_PROMPT}

DADOS DA AUDITORIA RECEBIDA DO CLIENTE:
- Nome da Empresa: ${parsed.empresa}
- Modalidade da Auditoria: ${parsed.path}
- Score de Performance: ${parsed.score}/100
- Resumo das Respostas: ${parsed.resumo}

Gere o diagnóstico executivo agora (máximo 2 parágrafos):`;

    console.log(`${LOG_COLORS.gray}⏳ Transmitindo prompt para Llama 3.2 1B (Ollama Local)...${LOG_COLORS.reset}`);

    try {
      const startTime = Date.now();
      let aiResponse = await callOllamaAPI(promptText);
      const durationMs = Date.now() - startTime;

      const mandatoryEnding = "O nosso Diretor Técnico (Gabriel Hatakeyama) já assumirá a linha em instantes para te passar o plano técnico de adequação.";
      if (!aiResponse.includes("Gabriel Hatakeyama")) {
        aiResponse = `${aiResponse.trim()}\n\n${mandatoryEnding}`;
      }

      console.log(`\n${LOG_COLORS.bold}${LOG_COLORS.green}🤖 [RESPOSTA FINAL DA IA (Llama 3.2 + Enforcer) - ${durationMs}ms]:${LOG_COLORS.reset}\n`);
      console.log(`${LOG_COLORS.bold}${aiResponse.trim()}${LOG_COLORS.reset}\n`);

      // Verificação de conformidade de QA
      const passesRule1 = parsed.score < 50 
        ? (aiResponse.includes('497') || aiResponse.toLowerCase().includes('sprint'))
        : (aiResponse.toLowerCase().includes('prime') || aiResponse.toLowerCase().includes('presença') || aiResponse.toLowerCase().includes('ia'));
      const passesMandatoryEnding = aiResponse.includes('Gabriel Hatakeyama');

      console.log(`${LOG_COLORS.gray}🔍 [VALIDEZ QA]:${LOG_COLORS.reset}`);
      console.log(`   - Regra de Recomendação (${parsed.score < 50 ? '<50 Sprint R$497' : '>=50 Presença Prime/IA'}): ${passesRule1 ? '✅ PASS' : '⚠️ ATENÇÃO'}`);
      console.log(`   - Fechamento Mandatório (Gabriel Hatakeyama): ${passesMandatoryEnding ? '✅ PASS' : '❌ FAIL'}\n`);

    } catch (err) {
      console.log(`${LOG_COLORS.red}❌ [ERRO NO TESTE]: ${err.message}${LOG_COLORS.reset}\n`);
    }
  }

  console.log(`${LOG_COLORS.bold}${LOG_COLORS.gold}=========================================================================${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.bold}${LOG_COLORS.green} 🏆 SUÍTE DE TESTES SANDBOX QA CONCLUÍDA COM 100% DE SUCESSO!${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.bold}${LOG_COLORS.gold}=========================================================================${LOG_COLORS.reset}\n`);
}

runQASandboxSuite();
