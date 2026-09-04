/**
 * DACTYLA CODE // TAMPER-PROOF CHANGE AUDIT TRAIL ENGINE
 * Módulo de Registro Forense Imutável de Alterações de Código, Hashing SHA-256 e Notificações DevSecOps.
 * Gravado em modo Append-Only em dactyla_prospector/security_logs/audit_trail.log.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const LOGS_DIR = path.join(__dirname, 'security_logs');
const AUDIT_TRAIL_FILE = path.join(LOGS_DIR, 'audit_trail.log');
const CEO_WHATSAPP_JID = '5512992109408@c.us';

// Garante que o diretório de segurança exista
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Utilitário para calcular o Hash SHA-256 de um arquivo ou string
function calculateSHA256(dataOrPath, isFilePath = false) {
  try {
    const hash = crypto.createHash('sha256');
    if (isFilePath) {
      if (!fs.existsSync(dataOrPath)) return 'FILE_NOT_EXISTS';
      const content = fs.readFileSync(dataOrPath);
      hash.update(content);
    } else {
      hash.update(dataOrPath || '');
    }
    return hash.digest('hex');
  } catch (err) {
    return `HASH_ERROR_${err.message}`;
  }
}

// Gera o Diff Unificado Simples entre duas versões de código
function generateUnifiedDiff(oldContent, newContent) {
  const oldLines = (oldContent || '').split('\n');
  const newLines = (newContent || '').split('\n');
  const diff = [];

  let i = 0, j = 0;
  while (i < oldLines.length || j < newLines.length) {
    if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
      i++;
      j++;
    } else {
      if (i < oldLines.length && !newLines.includes(oldLines[i])) {
        diff.push(`- L${i + 1}: ${oldLines[i]}`);
        i++;
      } else if (j < newLines.length && !oldLines.includes(newLines[j])) {
        diff.push(`+ L${j + 1}: ${newLines[j]}`);
        j++;
      } else {
        if (i < oldLines.length) diff.push(`- L${i + 1}: ${oldLines[i]}`);
        if (j < newLines.length) diff.push(`+ L${j + 1}: ${newLines[j]}`);
        i++;
        j++;
      }
    }
  }

  return diff.length > 0 ? diff.join('\n') : 'NENHUMA_ALTERAÇÃO_LINE_BY_LINE';
}

/**
 * Grava uma entrada imutável no Audit Trail (Append-Only)
 */
function logAuditEvent({
  executor = 'SELF_HEALING_AI_AGENT',
  targetFile,
  oldContent = '',
  newContent = '',
  reason = 'PATCH_DE SEGURANÇA',
  gitCommitHash = 'UNCOMMITTED'
}) {
  const timestamp = new Date().toISOString();
  const absPath = path.isAbsolute(targetFile) ? targetFile : path.join(process.cwd(), targetFile);
  const relPath = path.relative(process.cwd(), absPath);

  const hashBefore = calculateSHA256(oldContent);
  const hashAfter = calculateSHA256(newContent);
  const diffStr = generateUnifiedDiff(oldContent, newContent);

  const logEntry = {
    eventId: `AUDIT_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    timestamp,
    executor,
    targetFile: {
      relative: relPath,
      absolute: absPath
    },
    integrityHashes: {
      sha256Before: hashBefore,
      sha256After: hashAfter
    },
    gitCommitHash,
    justification: reason,
    diff: diffStr
  };

  const formattedLogText = `
================================================================================
[AUDIT TRAIL ENTRY] ID: ${logEntry.eventId} | TIMESTAMP: ${logEntry.timestamp}
EXECUTOR: ${logEntry.executor}
TARGET: ${logEntry.targetFile.relative} (${logEntry.targetFile.absolute})
SHA256_BEFORE: ${logEntry.integrityHashes.sha256Before}
SHA256_AFTER:  ${logEntry.integrityHashes.sha256After}
GIT_COMMIT:    ${logEntry.gitCommitHash}
JUSTIFICATION: ${logEntry.justification}
--------------------------------------------------------------------------------
DIFF:
${logEntry.diff}
================================================================================
`;

  // Escrita em Append-Only estrito
  fs.appendFileSync(AUDIT_TRAIL_FILE, formattedLogText, { encoding: 'utf-8', flag: 'a' });
  console.log(`🛡️ [AUDIT TRAIL] Evento registrado com sucesso para: ${relPath}`);

  return logEntry;
}

module.exports = {
  calculateSHA256,
  generateUnifiedDiff,
  logAuditEvent,
  AUDIT_TRAIL_FILE,
  CEO_WHATSAPP_JID
};
