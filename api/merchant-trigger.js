/**
 * DACTYLA CODE // API DE BALCÃO DO LOJISTA (/api/merchant-trigger)
 * Endpoint Serverless para o Painel Plug-and-Play de Balcão (/balcao):
 * - Aviso de Serviço Pronto c/ 1 clique (libera box da oficina ou gaiola do pet shop)
 * - Agendamento automático do ciclo de reativação preditiva (150d Oficina / 30d Pet / 21d Barbearia)
 * - Disparo de lotes de validação 48h (60 inativos) via Evolution API / Webhook n8n ou WhatsApp Direct
 */

let merchantEventsStore = [];

function sanitizeText(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim();
}

function normalizePhoneBr(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return '';
  let clean = digits.startsWith('0') ? digits.slice(1) : digits;
  if ([8, 9].includes(clean.length)) clean = `12${clean}`;
  if ([10, 11].includes(clean.length) && !clean.startsWith('55')) clean = `55${clean}`;
  return clean;
}

const NICHE_CYCLES = {
  oficina: 150,
  petshop: 30,
  barbearia: 21
};

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        count: merchantEventsStore.length,
        events: merchantEventsStore.slice(-50).reverse()
      });
    }

    if (req.method === 'POST') {
      const {
        storeName,
        niche,
        campaignType,
        customerName,
        customerPhone,
        itemPetOrCar,
        daysInactive,
        messagePreview
      } = req.body || {};

      if (!customerName || !customerPhone) {
        return res.status(400).json({
          success: false,
          error: 'Nome do cliente e telefone são obrigatórios.'
        });
      }

      const cleanStore = sanitizeText(storeName || 'Loja Parceira Caraguá').slice(0, 120);
      const cleanNiche = ['oficina', 'petshop', 'barbearia'].includes(String(niche).toLowerCase())
        ? String(niche).toLowerCase()
        : 'oficina';
      const cleanCampaign = sanitizeText(campaignType || 'SERVICO_CONCLUIDO').slice(0, 50);
      const cleanCustomer = sanitizeText(customerName).slice(0, 100);
      const cleanPhone = normalizePhoneBr(customerPhone);
      const cleanItem = sanitizeText(itemPetOrCar || 'atendimento').slice(0, 100);
      const cleanMsg = sanitizeText(messagePreview || '').slice(0, 1000);

      const cycleDays = NICHE_CYCLES[cleanNiche] || 60;
      const nextReactivationDate = new Date(Date.now() + cycleDays * 86400000)
        .toISOString()
        .slice(0, 10);

      const eventRecord = {
        id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        storeName: cleanStore,
        niche: cleanNiche,
        campaignType: cleanCampaign,
        customerName: cleanCustomer,
        customerPhone: cleanPhone,
        itemPetOrCar: cleanItem,
        daysInactive: Number(daysInactive || 0),
        cycleDays,
        nextReactivationDate,
        messagePreview: cleanMsg,
        waDirectLink: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messagePreview || '')}`,
        createdAt: new Date().toISOString()
      };

      merchantEventsStore.push(eventRecord);
      if (merchantEventsStore.length > 200) {
        merchantEventsStore.shift();
      }

      return res.status(200).json({
        success: true,
        message: 'Disparo registrado e retorno preditivo agendado com sucesso.',
        event: eventRecord
      });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (err) {
    console.error('Erro em /api/merchant-trigger:', err);
    return res.status(500).json({ error: 'Erro interno ao processar gatilho do lojista.' });
  }
}
