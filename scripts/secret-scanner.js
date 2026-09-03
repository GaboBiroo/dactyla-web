#!/usr/bin/env node

/**
 * DACTYLA DEVSECOPS // PRE-COMMIT SECRET SCANNER
 * Intercepta o git commit e vasculha os arquivos em stage procurando padrões de chaves e segredos.
 */

import fs from 'fs';
import path from 'path';

// Padrões Regex de Chaves de API e Segredos Críticos
const SECRET_PATTERNS = [
  { name: 'Google Cloud API Key', regex: /AIzaSy[A-Za-z0-9_\-]{33}/g },
  { name: 'Resend API Key', regex: /re_[A-Za-z0-9_]{32,}/g },
  { name: 'OpenAI API Key', regex: /sk-[A-Za-z0-9]{32,}/g },
  { name: 'AWS Access Key ID', regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g },
  { name: 'GitHub Personal Access Token', regex: /ghp_[A-Za-z0-9]{36}/g },
  { name: 'Generic Secret Pattern', regex: /(?:secret|password|api_key|private_key)\s*[:=]\s*["'][A-Za-z0-9_\-]{16,}["']/gi }
];

// Arquivos isentos de varredura (ex: documentações ou o próprio scanner)
const EXEMPT_FILES = ['scripts/secret-scanner.js', 'package-lock.json', '.gitignore'];

const filesToScan = process.argv.slice(2);
let hasSecretError = false;

console.log('🛡️ [DACTYLA DEVSECOPS] Executando varredura de segredos nos arquivos em stage...');

filesToScan.forEach((filePath) => {
  const normalizedPath = filePath.replace(/\\/g, '/');
  if (EXEMPT_FILES.some(e => normalizedPath.endsWith(e))) return;

  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf-8');

  SECRET_PATTERNS.forEach(({ name, regex }) => {
    const matches = content.match(regex);
    if (matches && matches.length > 0) {
      console.error(`\n❌ [BLOQUEIO DE SEGURANÇA] Segredo detectado no arquivo: ${filePath}`);
      console.error(`   Padrão: ${name}`);
      console.error(`   Trecho encontrado: ${matches[0].substring(0, 8)}... [OCULTO]`);
      hasSecretError = true;
    }
  });
});

if (hasSecretError) {
  console.error('\n⛔ COMMIT CANCELADO AUTOMATICAMENTE!');
  console.error('   Remova o segredo do código ou mova-o para o arquivo .env antes de tentar novamente.\n');
  process.exit(1);
} else {
  console.log('✅ [OK] Nenhum segredo detectado. Commit liberado com segurança!');
  process.exit(0);
}
