let cloudLeadsStore = [];
const INTERNAL_API_KEY = process.env.PROSPECTOR_API_KEY || "dactyla_prospector_secret_2026";

function sanitizeString(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

function sanitizeWaLink(url, phone) {
  const cleanPhone = String(phone || '').replace(/\D/g, '');
  const fallback = `https://wa.me/${cleanPhone}`;
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (trimmed.startsWith('https://wa.me/') || trimmed.startsWith('https://api.whatsapp.com/')) {
    return trimmed;
  }
  return fallback;
}

export default async function handler(req, res) {
  const allowedOrigins = ['https://www.dactylacode.com.br', 'http://localhost:5173'];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-prospector-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const prospectorKey = req.headers['x-prospector-key'];
      if (prospectorKey !== INTERNAL_API_KEY) {
        return res.status(401).json({ error: 'Acesso Não Autorizado: Chave de API inválida.' });
      }

      const { leads } = req.body || {};
      if (!Array.isArray(leads)) {
        return res.status(400).json({ error: 'Payload inválido. Esperado array de leads.' });
      }

      let addedCount = 0;
      let updatedCount = 0;

      for (const item of leads) {
        if (!item || !item.empresa) continue;

        const empresa = sanitizeString(item.empresa);
        const categoria = sanitizeString(item.categoria || 'B2B');
        const telefone = sanitizeString(item.telefone || '');
        const email = sanitizeString(item.email || '');
        const website = sanitizeString(item.website || '');
        const statusCampanha = sanitizeString(item.status_campanha || 'NOVO');
        const mensagemPitch = sanitizeString(item.mensagem_pitch || '');
        const waLink = sanitizeWaLink(item.wa_link_1clique || item.waLink, telefone);
        const stage = sanitizeString(item.stage || 'novos');

        const existingIdx = cloudLeadsStore.findIndex(
          (l) => l.empresa.toLowerCase() === empresa.toLowerCase()
        );

        if (existingIdx >= 0) {
          cloudLeadsStore[existingIdx] = {
            ...cloudLeadsStore[existingIdx],
            telefone: telefone || cloudLeadsStore[existingIdx].telefone,
            email: email !== 'N/A' ? email : cloudLeadsStore[existingIdx].email,
            website: website !== 'N/A' ? website : cloudLeadsStore[existingIdx].website,
            waLink: waLink || cloudLeadsStore[existingIdx].waLink,
            statusCampanha,
            updatedAt: new Date().toISOString()
          };
          updatedCount++;
        } else {
          cloudLeadsStore.push({
            id: `cloud_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            empresa,
            categoria,
            telefone,
            email,
            website,
            statusCampanha,
            mensagemPitch,
            waLink,
            stage,
            addedAt: new Date().toLocaleDateString('pt-BR'),
            updatedAt: new Date().toISOString()
          });
          addedCount++;
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Sincronização concluída com sucesso.',
        totalCloudLeads: cloudLeadsStore.length,
        added: addedCount,
        updated: updatedCount
      });
    }

    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        count: cloudLeadsStore.length,
        leads: cloudLeadsStore
      });
    }

    if (req.method === 'PATCH') {
      const { leadId, newStage } = req.body || {};
      if (!leadId || !newStage) {
        return res.status(400).json({ error: 'leadId e newStage são obrigatórios.' });
      }

      const leadIdx = cloudLeadsStore.findIndex((l) => l.id === leadId);
      if (leadIdx >= 0) {
        cloudLeadsStore[leadIdx].stage = sanitizeString(newStage);
        cloudLeadsStore[leadIdx].updatedAt = new Date().toISOString();
        return res.status(200).json({ success: true, lead: cloudLeadsStore[leadIdx] });
      }

      return res.status(404).json({ error: 'Lead não encontrado na nuvem.' });
    }

    return res.status(405).json({ error: 'Método não permitido.' });

  } catch (error) {
    console.error('Erro na rota Serverless api/leads-sync:', error);
    return res.status(500).json({ error: 'Erro interno na sincronização de nuvem.' });
  }
}
