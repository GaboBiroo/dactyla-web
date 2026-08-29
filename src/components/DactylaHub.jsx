import React, { useState, useEffect } from 'react';
import { 
  Lock, Shield, User, Key, LogOut, Upload, Search, MessageSquare, 
  CheckCircle2, ArrowRight, ExternalLink, RefreshCw, Layers, Phone, Mail, Building
} from 'lucide-react';

const STAGES = [
  { id: 'novos', title: '📌 Leads Novos', color: 'border-[#EAB308]', badgeBg: 'bg-[#EAB308]/10 text-[#EAB308] border-[#EAB308]/30' },
  { id: 'abordados', title: '💬 Abordados / Em Conversa', color: 'border-blue-500', badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  { id: 'reuniao', title: '📅 Reunião Agendada', color: 'border-purple-500', badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  { id: 'fechados', title: '🏆 Fechados / Cliente Dactyla', color: 'border-emerald-500', badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
];

function sanitizeCsvValue(val) {
  if (!val) return '';
  const str = String(val).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    return "'" + str;
  }
  return str;
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

export default function DactylaHub({ onBack }) {
  const [session, setSession] = useState(() => {
    try {
      const saved = sessionStorage.getItem('dactyla_crm_session');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed && parsed.token && parsed.token.includes('.')) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [loginForm, setLoginForm] = useState({ usuario: '', senha: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [leads, setLeads] = useState(() => {
    try {
      const savedLeads = sessionStorage.getItem('dactyla_crm_leads_session');
      return savedLeads ? JSON.parse(savedLeads) : [];
    } catch {
      return [];
    }
  });

  const [searchTerm, setSearchTerm] = useState('');

  const fetchCloudLeads = async () => {
    try {
      const res = await fetch('/api/leads-sync');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.leads) && data.leads.length > 0) {
          setLeads((prev) => {
            const cloudMap = new Map(data.leads.map((l) => [l.empresa.toLowerCase(), l]));
            const merged = [...prev];
            cloudMap.forEach((cLead, name) => {
              const idx = merged.findIndex((m) => m.empresa.toLowerCase() === name);
              if (idx >= 0) {
                merged[idx] = { ...cLead, stage: merged[idx].stage };
              } else {
                merged.push(cLead);
              }
            });
            return merged.length > 0 ? merged : data.leads;
          });
        }
      }
    } catch (e) {
      console.error('Erro ao buscar leads da nuvem:', e);
    }
  };

  useEffect(() => {
    if (session) {
      fetchCloudLeads();
    }
  }, [session]);

  useEffect(() => {
    try {
      sessionStorage.setItem('dactyla_crm_leads_session', JSON.stringify(leads));
    } catch (e) {
      console.error('Erro ao salvar leads na sessão:', e);
    }
  }, [leads]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const response = await fetch('/api/auth-crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Credenciais inválidas.');
      }

      const sessionData = { user: data.user, token: data.token };
      sessionStorage.setItem('dactyla_crm_session', JSON.stringify(sessionData));
      setSession(sessionData);
    } catch (err) {
      setLoginError(err.message || 'Erro ao realizar login.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('dactyla_crm_session');
    sessionStorage.removeItem('dactyla_crm_leads_session');
    setSession(null);
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length < 2) return;

      const newLeads = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
        if (!row || row.length < 2) continue;

        const getVal = (idx) => (row[idx] ? sanitizeCsvValue(row[idx].replace(/^"|"$/g, '').trim()) : '');

        const empresa = getVal(0) || 'Empresa Sem Nome';
        const categoria = getVal(1) || 'B2B';
        const telefone = getVal(2);
        const email = getVal(3);
        const website = getVal(4);
        const statusCampanha = getVal(5);
        const mensagemPitch = getVal(6);
        const rawWaLink = getVal(7);
        const safeWaLink = sanitizeWaLink(rawWaLink, telefone);

        const safeLeadObj = Object.create(null);
        safeLeadObj.id = `lead_${Date.now()}_${i}`;
        safeLeadObj.empresa = empresa;
        safeLeadObj.categoria = categoria;
        safeLeadObj.telefone = telefone;
        safeLeadObj.email = email;
        safeLeadObj.website = website;
        safeLeadObj.statusCampanha = statusCampanha;
        safeLeadObj.mensagemPitch = mensagemPitch;
        safeLeadObj.waLink = safeWaLink;
        safeLeadObj.stage = 'novos';
        safeLeadObj.addedAt = new Date().toLocaleDateString('pt-BR');

        newLeads.push(safeLeadObj);
      }

      setLeads((prev) => {
        const existingNames = new Set(prev.map((l) => l.empresa.toLowerCase()));
        const filteredNew = newLeads.filter((l) => !existingNames.has(l.empresa.toLowerCase()));
        return [...prev, ...filteredNew];
      });
    };
    reader.readAsText(file);
  };

  const moveStage = (leadId, newStage) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, stage: newStage } : lead))
    );
  };

  const clearKanban = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os leads do Kanban da sessão?')) {
      setLeads([]);
      sessionStorage.removeItem('dactyla_crm_leads_session');
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-[#050706] text-[#E5E7EB] flex items-center justify-center p-4 selection:bg-[#EAB308] selection:text-black">
        <div className="w-full max-w-md bg-[#090B0A] border border-[#1A2E22] rounded-2xl p-8 space-y-6 shadow-[0_0_50px_rgba(234,179,8,0.15)] relative overflow-hidden">
          
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#EAB308] to-transparent" />

          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#EAB308]/10 border border-[#EAB308]/30 text-[#EAB308] mb-2">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="font-editorial text-2xl font-bold text-white tracking-tight">
              Dactyla Code // CRM
            </h1>
            <p className="text-xs text-neutral-400 font-mono-code">
              [AUTENTICAÇÃO EXCLUSIVA DE FUNDADORES]
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded bg-red-950/50 border border-red-500/40 text-red-300 text-xs text-center font-mono-code">
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono-code text-neutral-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#EAB308]" /> USUÁRIO
              </label>
              <input
                type="text"
                required
                placeholder="ex: gabrieldev"
                value={loginForm.usuario}
                onChange={(e) => setLoginForm({ ...loginForm, usuario: e.target.value })}
                className="w-full px-4 py-3 rounded bg-[#050706] border border-[#1A2E22] focus:border-[#EAB308] text-sm text-white focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono-code text-neutral-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#EAB308]" /> SENHA DE ACESSO
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={loginForm.senha}
                onChange={(e) => setLoginForm({ ...loginForm, senha: e.target.value })}
                className="w-full px-4 py-3 rounded bg-[#050706] border border-[#1A2E22] focus:border-[#EAB308] text-sm text-white focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 rounded bg-[#EAB308] text-black font-bold font-mono-code text-xs hover:bg-[#CA8A04] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.25)] cursor-pointer disabled:opacity-50 mt-2"
            >
              {loginLoading ? (
                <span>VALIDANDO...</span>
              ) : (
                <>
                  <span>ACESSAR CENTRO DE COMANDO</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={onBack}
              className="text-xs text-neutral-500 hover:text-neutral-300 underline font-mono-code transition-colors"
            >
              ← Voltar ao site público
            </button>
          </div>

        </div>
      </div>
    );
  }

  const filteredLeads = leads.filter((l) =>
    l.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050706] text-[#E5E7EB] flex flex-col font-sans selection:bg-[#EAB308] selection:text-black">
      
      <header className="bg-[#090B0A] border-b border-[#1A2E22] px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <div className="w-3 h-3 rounded-full bg-[#EAB308] animate-pulse" />
          <div>
            <h1 className="font-editorial text-xl font-bold text-white tracking-wide flex items-center gap-2">
              Dactyla Code <span className="text-[#EAB308] text-xs font-mono-code px-2 py-0.5 rounded bg-[#EAB308]/10 border border-[#EAB308]/30">CRM HUB v5.1 SECURE</span>
            </h1>
            <p className="text-xs text-neutral-400 font-mono-code">
              Sessão ativa: <strong className="text-white">{session.user}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Buscar lead ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded bg-[#050706] border border-[#1A2E22] text-xs text-white focus:outline-none focus:border-[#EAB308] w-48 md:w-64"
            />
          </div>

          <label className="px-3.5 py-1.5 rounded bg-[#1A2E22] hover:bg-[#223F2E] text-xs font-mono-code font-semibold text-[#EAB308] border border-[#EAB308]/40 transition-colors flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Importar CSV</span>
            <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
          </label>

          {leads.length > 0 && (
            <button
              onClick={clearKanban}
              className="p-1.5 rounded bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-900/50 text-xs transition-colors"
              title="Limpar Kanban Local"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-xs text-neutral-300 font-mono-code transition-colors"
          >
            Site
          </button>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Sair da sessão"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-x-auto">
        
        {leads.length === 0 ? (
          <div className="max-w-xl mx-auto my-20 text-center space-y-6 bg-[#090B0A] border border-[#1A2E22] p-10 rounded-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#EAB308]/10 border border-[#EAB308] text-[#EAB308] flex items-center justify-center">
              <Upload className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white font-editorial">Nenhum Lead Carregado</h2>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                Os leads minerados pelo robô Python aparecerão aqui automaticamente via sincronização cloud.
              </p>
            </div>

            <label className="inline-flex items-center gap-2 px-6 py-3 rounded bg-[#EAB308] text-black font-bold text-xs font-mono-code cursor-pointer hover:bg-[#CA8A04] transition-all shadow-[0_0_20px_rgba(234,179,8,0.25)]">
              <Upload className="w-4 h-4" />
              <span>CARREGAR LEADS_QUENTES_WHATSAPP.CSV</span>
              <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start min-w-[1000px]">
            {STAGES.map((stage) => {
              const stageLeads = filteredLeads.filter((l) => l.stage === stage.id);

              return (
                <div key={stage.id} className="bg-[#090B0A] border border-[#1A2E22] rounded-xl overflow-hidden flex flex-col max-h-[85vh]">
                  
                  <div className={`p-4 border-t-4 ${stage.color} bg-[#0D110F] border-b border-[#1A2E22] flex items-center justify-between`}>
                    <h2 className="text-sm font-bold text-white font-editorial flex items-center gap-2">
                      {stage.title}
                    </h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-mono-code font-bold border ${stage.badgeBg}`}>
                      {stageLeads.length}
                    </span>
                  </div>

                  <div className="p-3 overflow-y-auto space-y-3 flex-1 min-h-[400px]">
                    {stageLeads.length === 0 ? (
                      <div className="p-6 text-center text-xs text-neutral-600 font-mono-code border border-dashed border-neutral-900 rounded-lg">
                        Nenhum lead nesta etapa
                      </div>
                    ) : (
                      stageLeads.map((lead) => (
                        <div
                          key={lead.id}
                          className="bg-[#050706] border border-[#1A2E22] hover:border-[#EAB308]/50 p-4 rounded-lg space-y-3 transition-all group shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm text-white group-hover:text-[#EAB308] transition-colors leading-snug">
                              {lead.empresa}
                            </h3>
                            <span className="text-[10px] font-mono-code uppercase px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800 shrink-0">
                              {lead.categoria}
                            </span>
                          </div>

                          <div className="space-y-1 text-xs text-neutral-400 font-mono-code">
                            {lead.telefone && (
                              <div className="flex items-center gap-1.5 text-neutral-300">
                                <Phone className="w-3 h-3 text-[#EAB308]" />
                                <span>{lead.telefone}</span>
                              </div>
                            )}
                            {lead.email && lead.email !== 'N/A' && (
                              <div className="flex items-center gap-1.5 truncate">
                                <Mail className="w-3 h-3 text-neutral-500" />
                                <span className="truncate">{lead.email}</span>
                              </div>
                            )}
                          </div>

                          {lead.waLink && (
                            <a
                              href={lead.waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2 px-3 rounded bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-black font-bold text-xs font-mono-code transition-all border border-[#25D366]/30 flex items-center justify-center gap-2 group/wa"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Falar no WhatsApp</span>
                              <ExternalLink className="w-3 h-3 opacity-60 group-hover/wa:opacity-100" />
                            </a>
                          )}

                          <div className="pt-2 border-t border-neutral-900 flex items-center justify-between">
                            <span className="text-[10px] font-mono-code text-neutral-500">Mover para:</span>
                            <select
                              value={lead.stage}
                              onChange={(e) => moveStage(lead.id, e.target.value)}
                              className="bg-[#090B0A] border border-[#1A2E22] text-[11px] text-[#EAB308] font-mono-code rounded px-2 py-1 focus:outline-none"
                            >
                              <option value="novos">📌 Novos</option>
                              <option value="abordados">💬 Abordados</option>
                              <option value="reuniao">📅 Reunião</option>
                              <option value="fechados">🏆 Fechados</option>
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>

    </div>
  );
}
