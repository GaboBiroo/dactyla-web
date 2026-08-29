import crypto from 'crypto';

function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

function createSignedToken(payloadObj) {
  const secret = process.env.CRM_JWT_SECRET || process.env.RESEND_API_KEY || 'DACTYLA_SERVERLESS_HMAC_SECRET_2026';
  const payloadStr = JSON.stringify(payloadObj);
  const base64Payload = Buffer.from(payloadStr).toString('base64');
  const hmacSignature = crypto.createHmac('sha256', secret).update(base64Payload).digest('hex');
  return `${base64Payload}.${hmacSignature}`;
}

export default async function handler(req, res) {
  const allowedOrigins = ['https://www.dactylacode.com.br', 'http://localhost:5173'];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const { usuario, senha } = req.body || {};

    if (!usuario || !senha) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
    }

    const gabrielUser = process.env.CRM_USER_GABRIEL || "gabrieldev";
    const gabrielPass = process.env.CRM_PASS_GABRIEL || "Dactyla2026@Gabriel";

    const matheusUser = process.env.CRM_USER_MATHEUS || "matheuspadre";
    const matheusPass = process.env.CRM_PASS_MATHEUS || "Dactyla2026@Matheus";

    const cleanUser = String(usuario).trim().toLowerCase();
    const cleanPass = String(senha).trim();

    let authenticatedUser = null;

    if (safeCompare(cleanUser, gabrielUser.toLowerCase()) && safeCompare(cleanPass, gabrielPass)) {
      authenticatedUser = "Gabriel Hatakeyama (CTO)";
    } else if (safeCompare(cleanUser, matheusUser.toLowerCase()) && safeCompare(cleanPass, matheusPass)) {
      authenticatedUser = "Matheus (Co-Founder)";
    }

    if (!authenticatedUser) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return res.status(401).json({
        success: false,
        error: 'Acesso Negado: Credenciais inválidas.'
      });
    }

    const signedSessionToken = createSignedToken({
      user: authenticatedUser,
      role: "ADMIN",
      authenticatedAt: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      user: authenticatedUser,
      token: signedSessionToken,
      message: 'Autenticação realizada com sucesso.'
    });

  } catch (error) {
    console.error('Erro na autenticação CRM:', error);
    return res.status(500).json({ error: 'Erro interno no servidor de autenticação.' });
  }
}
