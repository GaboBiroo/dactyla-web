const fs = require('fs');
const path = require('path');

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

let mdOutput = `# 🏖️ DACTYLA CODE // MOCK DATABASE DE 100 LEADS HIPERLOCALIZADOS (CARAGUATATUBA / SP)\n\n`;
mdOutput += `**Gerado em**: ${new Date().toLocaleString('pt-BR')}\n\n`;
mdOutput += `| # | Nome do Negócio | Bairro | Nicho | Gargalo Operacional |\n`;
mdOutput += `|---|---|---|---|---|\n`;

for (let i = 1; i <= 100; i++) {
  const bairro = BAIRROS_CARAGUA[(i - 1) % BAIRROS_CARAGUA.length];
  const nicho = NICHOS_B2B[(i * 3) % NICHOS_B2B.length];
  const dor = DORES_LOCAIS[(i * 7) % DORES_LOCAIS.length];
  const nomeBase = NOMES_FANTASIA[(i * 5) % NOMES_FANTASIA.length];
  const empresa = `${nicho} ${nomeBase}`;

  mdOutput += `| ${String(i).padStart(3, '0')} | **${empresa}** | ${bairro} | ${nicho} | ${dor} |\n`;
}

const artifactPath = path.join(__dirname, '..', '100_leads_caragua.md');
fs.writeFileSync(artifactPath, mdOutput, 'utf-8');
console.log('✅ 100 leads gerados em 100_leads_caragua.md');
