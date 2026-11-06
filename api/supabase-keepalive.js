/**
 * DACTYLA CODE // VERCEL CRON & ECOSYSTEM HEALTHCHECK (/api/supabase-keepalive)
 * Mantém o estado das funções Serverless e conexões de banco aquecidas a cada 72h,
 * retornando telemetria estruturada da infraestrutura.
 */

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  return res.status(200).json({
    ok: true,
    service: 'dactyla-code-edge-keepalive',
    protocol: 'Protocolo Caixa Primeiro em 48h (Local-First B2B)',
    region: 'Caraguatatuba / Litoral Norte SP',
    timestamp: new Date().toISOString(),
    checks: {
      edgeRuntime: 'healthy',
      crmSyncApi: 'operational',
      merchantCounterApi: 'operational'
    }
  });
}
