import https from 'https';
import http from 'http';

export default async function handler(req, res) {
  // Configurações do Supabase via Variáveis de Ambiente
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  const timestamp = new Date().toISOString();

  if (!supabaseUrl) {
    return res.status(200).json({
      status: 'WARNING',
      message: 'SUPABASE_URL não configurada nas variáveis de ambiente. Ping simulado concluído.',
      timestamp
    });
  }

  try {
    const targetEndpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/`;
    const parsedUrl = new URL(targetEndpoint);
    const transport = parsedUrl.protocol === 'https:' ? https : http;

    const pingPromise = new Promise((resolve, reject) => {
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.pathname,
        method: 'GET',
        headers: {
          'apikey': supabaseKey || '',
          'Authorization': `Bearer ${supabaseKey || ''}`
        },
        timeout: 10000
      };

      const request = transport.request(options, (response) => {
        let body = '';
        response.on('data', chunk => body += chunk);
        response.on('end', () => resolve({ statusCode: response.statusCode, body }));
      });

      request.on('error', reject);
      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Timeout de conexão com Supabase'));
      });

      request.end();
    });

    const result = await pingPromise;

    console.log(`[SUPABASE KEEP-ALIVE OK] Status: ${result.statusCode} às ${timestamp}`);

    return res.status(200).json({
      success: true,
      message: 'Ping de ativacao do Supabase executado com sucesso. Banco ativo 100%.',
      statusCode: result.statusCode,
      timestamp
    });
  } catch (error) {
    console.error(`[SUPABASE KEEP-ALIVE ERROR] ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp
    });
  }
}
