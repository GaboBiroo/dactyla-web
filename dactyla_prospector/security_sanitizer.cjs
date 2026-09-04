/**
 * DACTYLA CODE // DEVSECOPS SECURITY SANITIZER MODULE
 * Utilitários de Sanitização de Inputs, Prevenção de Path Traversal, Prototype Pollution,
 * Injeção de Comandos e Defesa de Prompt Injection para LLM (Llama 3.2).
 */

const path = require('path');

// 1. Defesa de Prompt Injection para o Llama 3.2 (LLM Local)
function sanitizeLLMPromptInput(text) {
  if (!text) return '';
  let str = String(text);

  // Remove tentativas de instrução adversária (Prompt Injection Bypasses)
  const injectionPatterns = [
    /ignore\s+(all\s+)?(previous\s+)?instructions/gi,
    /system\s* prompt/gi,
    /you\s+are\s+now/gi,
    /developer\s+mode/gi,
    /disregard\s+rules/gi,
    /resposta\s+como\s+admin/gi,
    /forget\s+all\s+rules/gi
  ];

  injectionPatterns.forEach(pattern => {
    str = str.replace(pattern, '[REDACTED_PROMPT_INJECTION]');
  });

  // Sanitiza delimitadores markdown e caracteres de escape maliciosos
  return str.replace(/`/g, "'").replace(/\$/g, '\\$').trim();
}

// 2. Prevenção de Path Traversal (CWE-22)
function sanitizeSafePath(baseDir, targetRelPath) {
  if (!targetRelPath || typeof targetRelPath !== 'string') {
    throw new Error('Path inválido fornecido.');
  }

  const baseDirResolved = path.resolve(baseDir);
  const resolvedPath = path.resolve(baseDirResolved, targetRelPath);
  const baseWithSep = baseDirResolved.endsWith(path.sep) ? baseDirResolved : baseDirResolved + path.sep;

  if (!resolvedPath.startsWith(baseWithSep) && resolvedPath !== baseDirResolved) {
    throw new Error(`[VIOLAÇÃO DE SEGURANÇA] Tentativa de Path Traversal bloqueada: ${targetRelPath}`);
  }

  return resolvedPath;
}

// 3. Prevenção de Prototype Pollution (CWE-1321)
function safeJsonParse(jsonString) {
  if (!jsonString) return null;
  const parsed = JSON.parse(jsonString, (key, value) => {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return undefined; // Bloqueia chaves que poluam o protótipo do Object
    }
    return value;
  });
  return parsed;
}

// 4. Prevenção de Injeção de Comandos (CWE-78)
function sanitizeShellArg(arg) {
  if (!arg) return "''";
  return `'${String(arg).replace(/'/g, "'\\''")}'`;
}

// 5. Sanitização Estrita de Telefones e JIDs do WhatsApp
function sanitizeStrictPhoneJid(phoneStr) {
  if (!phoneStr) return null;
  const digits = String(phoneStr).replace(/\D/g, '');

  let cleanDigits = digits;
  if (cleanDigits.startsWith('0')) cleanDigits = cleanDigits.substring(1);
  if (cleanDigits.length in [8, 9]) cleanDigits = '12' + cleanDigits; // DDD 12 Caraguá
  if (cleanDigits.length in [10, 11] && !cleanDigits.startsWith('55')) cleanDigits = '55' + cleanDigits;

  // Validação matemática de tamanho (deve possuir entre 12 e 13 dígitos)
  if (cleanDigits.length < 12 || cleanDigits.length > 13) {
    return null;
  }

  return `${cleanDigits}@c.us`;
}

// 6. Sanitização de Texto HTML/XSS (CWE-79)
function escapeXssHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

module.exports = {
  sanitizeLLMPromptInput,
  sanitizeSafePath,
  safeJsonParse,
  sanitizeShellArg,
  sanitizeStrictPhoneJid,
  escapeXssHtml
};
