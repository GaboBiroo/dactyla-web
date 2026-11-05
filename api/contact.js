import resend from 'resend';

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default async function handler(req, res) {
  const allowedOrigins = [
    'https://www.dactylacode.com.br',
    'https://dactylacode.com.br',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ];
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
    const { nome, empresa, whatsapp, faturamento, escopo, gargalo, nicho, clientesInativos } = req.body || {};

    if (!nome || !whatsapp) {
      return res.status(400).json({ error: 'Nome e WhatsApp são campos obrigatórios.' });
    }

    const cleanNome = escapeHTML(nome).slice(0, 100);
    const cleanEmpresa = escapeHTML(empresa || 'Não informada').slice(0, 100);
    const rawDigits = String(whatsapp).replace(/\D/g, '').slice(0, 20);
    const cleanWhatsapp = rawDigits.startsWith('55') ? rawDigits : `55${rawDigits}`;
    const cleanFaturamento = escapeHTML(faturamento || 'Não informado').slice(0, 100);
    const cleanEscopo = escapeHTML(escopo || 'Motor de Reativação 48h (R$ 400 + R$ 130/mês)').slice(0, 120);
    const cleanNicho = escapeHTML(nicho || 'Comércio Local — Caraguatatuba').slice(0, 100);
    const cleanInativos = escapeHTML(clientesInativos || 'Validação de 60 clientes inativos').slice(0, 100);
    const cleanGargalo = escapeHTML(gargalo || 'Reativação de clientes inativos e preenchimento de horários ociosos').slice(0, 1000);

    const isReactivationOffer = /reativa|48h|400|risco zero/i.test(cleanEscopo);
    const badgeLabel = isReactivationOffer
      ? 'PROTOCOLO CAIXA PRIMEIRO EM 48H // RISCO ZERO (SETUP R$ 400 + R$ 130/MÊS)'
      : 'DACTYLA CODE // PROJETO DE ARQUITETURA & ENGENHARIA B2B';

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('CRÍTICO: RESEND_API_KEY não configurada no servidor.');
      return res.status(500).json({ error: 'Erro de configuração do servidor de e-mail.' });
    }

    const resendClient = new resend.Resend(apiKey);
    const senderEmail = process.env.RESEND_SENDER_EMAIL || 'contato@dactylacode.com.br';
    const notificationEmail = process.env.MY_NOTIFICATION_EMAIL || 'agenciadactylacode@gmail.com';

    const waGreeting = isReactivationOffer
      ? `Olá ${cleanNome}! Recebemos sua solicitação do Teste de 48h (Risco Zero) para a ${cleanEmpresa} no site da Dactyla Code. Vamos separar os 60 clientes inativos para iniciar a validação?`
      : `Olá ${cleanNome}! Recebemos o briefing técnico da ${cleanEmpresa} (${cleanEscopo}) no site da Dactyla Code.`;

    const waLink = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(waGreeting)}`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 20px; background-color: #050706; font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;">
      <div style="max-width: 620px; margin: 0 auto; background-color: #0A140E; border: 1px solid #28593B; border-radius: 8px; overflow: hidden; color: #E8F0EA;">
        <div style="background-color: #070E0A; border-top: 4px solid #D4AF37; padding: 25px 30px;">
          <p style="color: #D4AF37; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0;">
            ${badgeLabel}
          </p>
          <h2 style="color: #E8F0EA; font-family: Georgia, serif; margin: 0; font-size: 22px;">
            🔥 Novo Lead Comercial: ${cleanEmpresa}
          </h2>
        </div>
        <div style="padding: 30px;">
          <table style="width: 100%; border-collapse: collapse; color: #E8F0EA; font-size: 14px;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #1A2E22; width: 150px; font-weight: bold; color: #D4AF37;">Responsável:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #1A2E22; color: #FFFFFF;">${cleanNome}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #1A2E22; font-weight: bold; color: #D4AF37;">Estabelecimento:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #1A2E22; color: #FFFFFF;">${cleanEmpresa}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #1A2E22; font-weight: bold; color: #D4AF37;">WhatsApp:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #1A2E22; color: #FFFFFF;">+${cleanWhatsapp}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #1A2E22; font-weight: bold; color: #D4AF37;">Plano / Escopo:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #1A2E22; color: #D4AF37; font-weight: bold;">${cleanEscopo}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #1A2E22; font-weight: bold; color: #D4AF37;">Subnicho Local:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #1A2E22; color: #FFFFFF;">${cleanNicho}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #1A2E22; font-weight: bold; color: #D4AF37;">Base Inativa:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #1A2E22; color: #FFFFFF;">${cleanInativos}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #1A2E22; font-weight: bold; color: #D4AF37;">Faturamento:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #1A2E22; color: #FFFFFF;">${cleanFaturamento}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #D4AF37;">Gargalo / Contexto:</td>
              <td style="padding: 10px 0; color: #FFFFFF;">${cleanGargalo}</td>
            </tr>
          </table>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${waLink}" target="_blank" style="background-color: #25D366; color: #FFFFFF; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">
              💬 Chamar ${cleanNome} no WhatsApp Agora ➔
            </a>
          </div>
        </div>
        <div style="background-color: #070E0A; padding: 15px 30px; text-align: center; border-top: 1px solid #1A2E22; font-size: 12px; color: #9CA3AF;">
          Dactyla Code © 2026 • Engenharia de Receita &amp; Automação Local-First (Caraguatatuba/SP)
        </div>
      </div>
    </body>
    </html>
    `;

    const subjectPrefix = isReactivationOffer
      ? '⚡ [MOTOR 48H - R$ 400]'
      : '🔥 [PROJETO B2B]';

    const data = await resendClient.emails.send({
      from: `Dactyla Lead Bot <${senderEmail}>`,
      to: [notificationEmail],
      subject: `${subjectPrefix} ${cleanEmpresa} — ${cleanEscopo}`,
      html: htmlContent
    });

    return res.status(200).json({
      success: true,
      message: 'Solicitação recebida com sucesso! Entraremos em contato no seu WhatsApp em instantes.',
      id: data?.id || null
    });

  } catch (error) {
    console.error('Erro na API de contato:', error);
    return res.status(500).json({ error: 'Erro interno no servidor de envio.' });
  }
}
