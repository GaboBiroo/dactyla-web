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
    const { nome, empresa, whatsapp, faturamento, escopo, gargalo } = req.body || {};

    if (!nome || !whatsapp) {
      return res.status(400).json({ error: 'Nome e WhatsApp são campos obrigatórios.' });
    }

    const cleanNome = escapeHTML(nome).slice(0, 100);
    const cleanEmpresa = escapeHTML(empresa || 'Não informada').slice(0, 100);
    const cleanWhatsapp = escapeHTML(whatsapp).replace(/\D/g, '').slice(0, 20);
    const cleanFaturamento = escapeHTML(faturamento || 'Não informado').slice(0, 100);
    const cleanEscopo = escapeHTML(escopo || 'Geral').slice(0, 100);
    const cleanGargalo = escapeHTML(gargalo || 'Sem detalhes').slice(0, 1000);

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('CRÍTICO: RESEND_API_KEY não configurada no servidor.');
      return res.status(500).json({ error: 'Erro de configuração do servidor de e-mail.' });
    }

    const resendClient = new resend.Resend(apiKey);
    const senderEmail = process.env.RESEND_SENDER_EMAIL || "contato@dactylacode.com.br";
    const notificationEmail = process.env.MY_NOTIFICATION_EMAIL || "agenciadactylacode@gmail.com";

    const waLink = `https://wa.me/${cleanWhatsapp}?text=Olá%20${encodeURIComponent(cleanNome)}!%20Recebemos%20sua%20solicitação%20no%20site%20da%20Dactyla%20Code.`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 20px; background-color: #050706; font-family: 'Inter', sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #090B0A; border: 1px solid #1A2E22; border-radius: 8px; overflow: hidden; color: #E5E7EB;">
        <div style="background-color: #0D110F; border-top: 4px solid #EAB308; padding: 25px 30px;">
          <p style="color: #EAB308; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0;">
            DACTYLA CODE // ALERTA DE NOVO LEAD DO SITE
          </p>
          <h2 style="color: #FFFFFF; font-family: Georgia, serif; margin: 0; font-size: 22px;">
            🔥 Solicitação de Briefing Recebida!
          </h2>
        </div>
        <div style="padding: 30px;">
          <table style="width: 100%; border-collapse: collapse; color: #D1D5DB; font-size: 14px;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #1A1F1C; width: 130px; font-weight: bold; color: #EAB308;">Nome:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #1A1F1C; color: #FFFFFF;">${cleanNome}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #1A1F1C; font-weight: bold; color: #EAB308;">Empresa:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #1A1F1C; color: #FFFFFF;">${cleanEmpresa}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #1A1F1C; font-weight: bold; color: #EAB308;">WhatsApp:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #1A1F1C; color: #FFFFFF;">+${cleanWhatsapp}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #1A1F1C; font-weight: bold; color: #EAB308;">Faturamento:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #1A1F1C; color: #FFFFFF;">${cleanFaturamento}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #1A1F1C; font-weight: bold; color: #EAB308;">Escopo:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #1A1F1C; color: #FFFFFF;">${cleanEscopo}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #EAB308;">Desafio / Gargalo:</td>
              <td style="padding: 10px 0; color: #FFFFFF;">${cleanGargalo}</td>
            </tr>
          </table>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${wa_link}" target="_blank" style="background-color: #25D366; color: #FFFFFF; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">
              💬 Falar com ${cleanNome} no WhatsApp ➔
            </a>
          </div>
        </div>
        <div style="background-color: #050706; padding: 15px 30px; text-align: center; border-top: 1px solid #1A1F1C; font-size: 12px; color: #6B7280;">
          Dactyla Code © 2026 • Captura Automática de Leads via Resend API
        </div>
      </div>
    </body>
    </html>
    `;

    const data = await resendClient.emails.send({
      from: `Dactyla Lead Bot <${senderEmail}>`,
      to: [notificationEmail],
      subject: `🔥 NOVO LEAD HIGH-TICKET: ${cleanEmpresa} (${cleanFaturamento})`,
      html: htmlContent
    });

    return res.status(200).json({
      success: true,
      message: 'Briefing enviado com sucesso! Entraremos em contato em instantes.',
      id: data.id
    });

  } catch (error) {
    console.error('Erro na API de contato:', error);
    return res.status(500).json({ error: 'Erro interno no servidor de envio.' });
  }
}
