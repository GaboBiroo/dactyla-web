/**
 * DACTYLA CODE // HYPER-LOCAL OUTBOUND AI SANDBOX (CARAGUATATUBA)
 * Emulador de Prospecção Passiva com IA Local (Llama 3.2 1B via Ollama).
 * Gera 100 leads hiperlocalizados do Litoral Norte e testa copies de abordagem humana em 5 amostras.
 */

const http = require('http');

// Cores ANSI para Terminal Corporativo
const LOG_COLORS = {
  reset: '\x1b[0m',
  gold: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  yellow: '\x1b[33m',
  bold: '\x1b[1m',
  gray: '\x1b[90m'
};

// DATASETS HIPERLOCALIZADOS DE CARAGUATATUBA / SP
const BAIRROS_CARAGUA = [
  'Martim de Sá',
  'Centro',
  'Pontal de Santa Marina',
  'Indaiá',
  'Massaguaçu',
  'Porto Novo'
];

const NICHOS_B2B = [
  'Quiosque de Praia',
  'Pousada',
  'Clínica Odontológica',
  'Delivery de Lanches',
  'Adega/Bebidas',
  'Imobiliária'
];

const DORES_LOCAIS = [
  'Demora no atendimento via WhatsApp na alta temporada de verão',
  'Queda de vendas e baixo movimento na baixa temporada',
  'Perda de orçamentos de turistas por demorar a responder',
  'Agenda de clientes vazia no inverno',
  'Controle manual de clientes no caderno'
];

const NOMES_FANTASIA = [
  'Sol & Mar', 'Mariscos do Litoral', 'Sabor Caiçara', 'Caraguá Prime',
  'Brisa Marinha', 'Sorriso Praiano', 'Estrela do Mar', 'Cantinho Caiçara',
  'Litoral Norte', 'Costa Branca', 'Mar de Minas', 'Oasis Caraguá',
  'Vista Verde', 'Mar Azul', 'Pé na Areia', 'Portal das Mares'
];

// Gerador de Mock de 100 Leads Hiperlocalizados
function generate100CaraguaLeads() {
  const leads = [];
  for (let i = 1; i <= 100; i++) {
    const bairro = BAIRROS_CARAGUA[Math.floor(Math.random() * BAIRROS_CARAGUA.length)];
    const nicho = NICHOS_B2B[Math.floor(Math.random() * NICHOS_B2B.length)];
    const dor = DORES_LOCAIS[Math.floor(Math.random() * DORES_LOCAIS.length)];
    const nomeBase = NOMES_FANTASIA[Math.floor(Math.random() * NOMES_FANTASIA.length)];
    
    leads.push({
      id: i,
      empresa: `${nicho} ${nomeBase}`,
      nicho: nicho,
      bairro: bairro,
      dor: dor,
      cidade: 'Caraguatatuba/SP'
    });
  }
  return leads;
}

// System Prompt Executivo para Llama 3.2 1B (Gabriel - Dactyla Code Caraguá)
const SYSTEM_PROMPT_SDR_LOCAL = `
Você é o Gabriel, desenvolvedor da Dactyla Code em Caraguatatuba/SP.
Escreva uma mensagem amigável no WhatsApp para um comerciante local de Caraguatatuba.

INSTRUÇÕES DE ESCRITA:
1. Cumprimento humano e amigável: "Opa, tudo bem?" ou "Olá, tudo bem?".
2. Mencione que você é da Dactyla Code aqui em Caraguá e notou a empresa dele no bairro especificado. NUNCA mencione onde você mora ou o seu endereço pessoal.
3. Comente sobre o desafio local do negócio (como o movimento de turistas no verão, queda na baixa temporada ou lentidão no WhatsApp).
4. Convide ele para testar a ferramenta gratuita da cidade: dactylacode.com.br/auditoria.
5. Escreva de forma curta (máximo 2 parágrafos simples), como um humano digitando rápido do próprio celular.
`;

// Requisição HTTP nativa para a API local do Ollama (127.0.0.1:11434/api/generate)
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
      timeout: 20000
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
      reject(new Error('Timeout na resposta do Ollama'));
    });

    req.write(payload);
    req.end();
  });
}

// Embaralhador Fisher-Yates
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Suíte de Teste Sandbox Outbound Hiperlocal
async function runOutboundCaraguaSandbox() {
  console.log(`\n${LOG_COLORS.bold}${LOG_COLORS.gold}=========================================================================${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.bold}${LOG_COLORS.gold} DACTYLA CODE // HIPER-LOCAL OUTBOUND AI SANDBOX (CARAGUATATUBA/SP) ${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.bold}${LOG_COLORS.gold}=========================================================================${LOG_COLORS.reset}\n`);

  // 1. Gerar os 100 leads de Caraguatatuba
  const allLeads = generate100CaraguaLeads();
  console.log(`${LOG_COLORS.green}[✅] 100 Leads Hiperlocalizados gerados com sucesso (Bairros + Nichos + Dores)!${LOG_COLORS.reset}`);

  // 2. Embaralhar e selecionar os 5 primeiros para teste
  const sampledLeads = shuffleArray(allLeads).slice(0, 5);
  console.log(`${LOG_COLORS.cyan}[📊] Amostra selecionada para teste de copy com Llama 3.2 1B (5 Leads):\n${LOG_COLORS.reset}`);

  for (let i = 0; i < sampledLeads.length; i++) {
    const lead = sampledLeads[i];

    console.log(`${LOG_COLORS.gray}-------------------------------------------------------------------------${LOG_COLORS.reset}`);
    console.log(`${LOG_COLORS.bold}${LOG_COLORS.magenta} 🎯 LEAD ${i + 1}/5: ${lead.empresa}${LOG_COLORS.reset}`);
    console.log(`${LOG_COLORS.cyan} 📍 Bairro: ${lead.bairro} | Nicho: ${lead.nicho}${LOG_COLORS.reset}`);
    console.log(`${LOG_COLORS.yellow} ⚠️  Dor Identificada: ${lead.dor}${LOG_COLORS.reset}`);
    console.log(`${LOG_COLORS.gray}-------------------------------------------------------------------------${LOG_COLORS.reset}`);

    const promptText = `
${SYSTEM_PROMPT_SDR_LOCAL}

DADOS DO COMERCIANTE DE CARAGUATATUBA:
- Empresa: ${lead.empresa}
- Bairro em Caraguá: ${lead.bairro}
- Nicho: ${lead.nicho}
- Desafio Local: ${lead.dor}

Mensagem de WhatsApp:`;

    console.log(`${LOG_COLORS.gray}⏳ Gerando mensagem hiperlocal com Llama 3.2 (Ollama Local)...${LOG_COLORS.reset}`);

    try {
      const startTime = Date.now();
      const copyResponse = await callOllamaAPI(promptText);
      const durationMs = Date.now() - startTime;

      console.log(`\n${LOG_COLORS.bold}${LOG_COLORS.green}💬 [COPY GERADA PELO LLAMA 3.2 - ${durationMs}ms]:${LOG_COLORS.reset}\n`);
      console.log(`${LOG_COLORS.bold}${copyResponse.trim()}${LOG_COLORS.reset}\n`);

    } catch (err) {
      console.log(`${LOG_COLORS.bold}\x1b[31m❌ [ERRO NO PROCESSAMENTO]: ${err.message}${LOG_COLORS.reset}\n`);
    }
  }

  console.log(`${LOG_COLORS.bold}${LOG_COLORS.gold}=========================================================================${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.bold}${LOG_COLORS.green} 🏆 TESTE SANDBOX DE OUTBOUND HIPERLOCAL CONCLUÍDO COM SUCESSO!${LOG_COLORS.reset}`);
  console.log(`${LOG_COLORS.bold}${LOG_COLORS.gold}=========================================================================${LOG_COLORS.reset}\n`);
}

runOutboundCaraguaSandbox();
