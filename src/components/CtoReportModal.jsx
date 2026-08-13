import React, { useState } from 'react';
import { X, Terminal, Shield, Zap, DollarSign, Layers, Cpu, Code, ArrowUpRight, Copy, Check } from 'lucide-react';

export default function CtoReportModal({ isOpen, onClose, setCursorState }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('audit'); // audit | architecture | risk | code | proposal

  if (!isOpen) return null;

  const copyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeSnippet = `// Dactyla Code - Enterprise Multi-Tenant RLS & Fastify Bootstrap
import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

// Multi-tenant Tenant Isolation Hook via Request Header & RLS
fastify.addHook('onRequest', async (request, reply) => {
  const tenantId = request.headers['x-tenant-id'];
  if (!tenantId) {
    return reply.status(401).send({ error: 'UNAUTHORIZED: Tenant Identification Required' });
  }
  
  // Set PostgreSQL Row-Level Security Session Variable
  await prisma.$executeRaw\`SET LOCAL app.current_tenant_id = \${tenantId}\`;
  request.tenantId = tenantId;
});

// High-Throughput Public API Route with p95 < 150ms SLA
fastify.get('/api/v1/tenant/metrics', async (req, res) => {
  const metrics = await prisma.metrics.findMany({
    where: { tenant_id: req.tenantId },
    take: 50
  });
  return { status: 'SUCCESS', count: metrics.length, data: metrics };
});`;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-[#1A1A1A] border border-[#D4AF37]/50 rounded-2xl p-6 md:p-10 text-left space-y-8 shadow-[0_0_60px_rgba(212,175,55,0.25)]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          onMouseEnter={() => setCursorState({ hovered: true })}
          onMouseLeave={() => setCursorState({ hovered: false })}
          className="absolute top-6 right-6 p-2 rounded-full border border-neutral-800 text-neutral-400 hover:text-white hover:border-[#D4AF37] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-3 border-b border-neutral-800 pb-6">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] animate-ping" />
            <span className="font-mono-code text-xs text-[#D4AF37] tracking-widest uppercase font-bold">
              [SYSTEM_PROMPT_CORE_V3.0] // CTO ENTERPRISE REPORT
            </span>
          </div>
          <h2 className="font-editorial text-4xl md:text-5xl font-semibold text-[#F8F9FA]">
            Dossiê de Arquitetura & Proposta Godfather.
          </h2>
          <p className="font-sans text-xs md:text-sm text-neutral-400">
            Relatório técnico completo emitido pelo CTO e Arquiteto Chefe da Dactyla Code.
          </p>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-4">
          {[
            { id: 'audit', label: '1. Auditoria & Diagnóstico' },
            { id: 'architecture', label: '2. Desenho Arquitetural' },
            { id: 'risk', label: '3. Riscos & SLAs' },
            { id: 'code', label: '4. Engenharia de Código' },
            { id: 'proposal', label: '5. Proposta Godfather' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              onMouseEnter={() => setCursorState({ hovered: true })}
              onMouseLeave={() => setCursorState({ hovered: false })}
              className={`px-4 py-2 rounded font-mono-code text-xs transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#D4AF37] text-[#1A1A1A] font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Auditoria & Diagnóstico */}
        {activeTab === 'audit' && (
          <div className="space-y-6 text-neutral-300 font-sans text-sm leading-relaxed">
            <div className="p-6 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-4">
              <h3 className="font-editorial text-2xl text-[#F8F9FA] font-semibold flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-[#D4AF37]" />
                <span>1. Auditoria e Diagnóstico (O Racional do CTO)</span>
              </h3>
              <p>
                A análise técnica do ecossistema revelou um gargalo estrutural crítico em plataformas convencionais: o acoplamento monolítico ineficiente entre regras de negócio e renderização de frontend. A maioria das aplicações de mercado sofre de latência excessiva no Time to First Byte (TTFB &gt; 1.8s) decorrente do uso excessivo de plugins legados e requisições síncronas bloqueantes de banco de dados.
              </p>
              <p>
                A visão de longo prazo exige o desacoplamento imediato em <strong className="text-[#D4AF37]">Domain-Driven Design (DDD)</strong> e a implementação de isolamento lógico de multi-tenancy nativo com <strong className="text-[#D4AF37]">Row-Level Security (RLS)</strong> no PostgreSQL, garantindo escalabilidade ilimitada sem elevar os custos operacionais (OpEx).
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Desenho Arquitetural */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-4 text-left">
              <h3 className="font-editorial text-2xl text-[#F8F9FA] font-semibold flex items-center space-x-2">
                <Layers className="w-5 h-5 text-[#D4AF37]" />
                <span>2. Desenho Arquitetural (High-Level Design)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded bg-black/60 border border-neutral-800 space-y-2">
                  <span className="font-mono-code text-xs text-[#D4AF37] font-bold">FRONTEND & CDN EDGE</span>
                  <p className="text-xs text-neutral-400">
                    Next.js (React) rodando Server-Side Rendering (SSR) dinâmico com Subdomínios Curinga (Wildcard Domains), roteamento de layout por tenant e assets servidos via Cloudflare CDN Edge (TTFB &lt; 50ms).
                  </p>
                </div>
                <div className="p-4 rounded bg-black/60 border border-neutral-800 space-y-2">
                  <span className="font-mono-code text-xs text-[#D4AF37] font-bold">BACKEND CORE & APIS</span>
                  <p className="text-xs text-neutral-400">
                    Monólito Modular em Node.js (NestJS / Fastify) desacoplado via Ports and Adapters (Hexagonal), utilizando Prisma ORM para queries fortemente tipadas.
                  </p>
                </div>
                <div className="p-4 rounded bg-black/60 border border-neutral-800 space-y-2">
                  <span className="font-mono-code text-xs text-[#D4AF37] font-bold">BANCO DE DADOS & CACHE</span>
                  <p className="text-xs text-neutral-400">
                    Cluster PostgreSQL 16 com políticas RLS (Row-Level Security) ativas por `tenant_id` + Redis 7 Distribuído para cinto de cache de leitura frequente.
                  </p>
                </div>
                <div className="p-4 rounded bg-black/60 border border-neutral-800 space-y-2">
                  <span className="font-mono-code text-xs text-[#D4AF37] font-bold">AUTOMAÇÃO & WORKERS</span>
                  <p className="text-xs text-neutral-400">
                    Orquestração assíncrona com n8n (self-hosted no Coolify/Hetzner) acoplado a LLMs via OpenAI API e disparadores oficiais WhatsApp Cloud API (WABA).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Riscos & SLAs */}
        {activeTab === 'risk' && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-4">
              <h3 className="font-editorial text-2xl text-[#F8F9FA] font-semibold flex items-center space-x-2">
                <Shield className="w-5 h-5 text-[#D4AF37]" />
                <span>3. Matriz de Riscos e SLAs de Infraestrutura</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded bg-black/60 border border-neutral-800 space-y-1 text-left">
                  <span className="font-mono-code text-xs text-emerald-400">LATÊNCIA p95</span>
                  <p className="font-editorial text-2xl font-bold text-white">&lt; 150 ms</p>
                  <p className="text-[11px] text-neutral-500">Métricas em tempo real via Redis Edge</p>
                </div>
                <div className="p-4 rounded bg-black/60 border border-neutral-800 space-y-1 text-left">
                  <span className="font-mono-code text-xs text-amber-400">CONCORRÊNCIA C10K</span>
                  <p className="font-editorial text-2xl font-bold text-white">10.000 req/s</p>
                  <p className="text-[11px] text-neutral-500">Event-loop não bloqueante com HAProxy</p>
                </div>
                <div className="p-4 rounded bg-black/60 border border-neutral-800 space-y-1 text-left">
                  <span className="font-mono-code text-xs text-cyan-400">SEGURANÇA SECOPS</span>
                  <p className="font-editorial text-2xl font-bold text-white">AES-256 + TLS 1.3</p>
                  <p className="text-[11px] text-neutral-500">OAuth 2.0 / JWT assimétrico com RBAC</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Engenharia de Código */}
        {activeTab === 'code' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-neutral-900 px-4 py-2 rounded-t-xl border-t border-x border-neutral-800">
              <span className="font-mono-code text-xs text-[#D4AF37]">Fastify + Prisma RLS Tenant Middleware</span>
              <button
                onClick={() => copyCode(codeSnippet)}
                className="flex items-center space-x-1.5 font-mono-code text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
              </button>
            </div>
            <pre className="p-6 rounded-b-xl bg-black font-mono-code text-xs text-neutral-200 overflow-x-auto border border-neutral-800 leading-relaxed text-left">
              {codeSnippet}
            </pre>
          </div>
        )}

        {/* Tab 5: Proposta Godfather */}
        {activeTab === 'proposal' && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-neutral-900/90 border border-[#D4AF37]/40 space-y-6 text-left">
              <div className="flex justify-between items-start border-b border-neutral-800 pb-4">
                <div>
                  <span className="font-mono-code text-xs text-[#D4AF37] font-bold uppercase">PROPOSTA COMERCIAL &quot;GODFATHER&quot;</span>
                  <h3 className="font-editorial text-3xl font-semibold text-[#F8F9FA]">Oferta Irrecusável Dactyla Code</h3>
                </div>
                <span className="px-3 py-1 rounded bg-[#D4AF37]/20 border border-[#D4AF37] font-mono-code text-xs text-[#D4AF37]">
                  DISCOUNT STRATEGY APPLIED
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded bg-black/60 border border-neutral-800 space-y-2">
                  <span className="font-mono-code text-xs text-neutral-400 uppercase">TCO TETO DE MERCADO (AGÊNCIAS TRADICIONAIS)</span>
                  <p className="font-editorial text-3xl font-bold text-red-400 line-through">R$ 45.000,00</p>
                  <p className="text-xs text-neutral-500">Squad de 4 devs por 3 meses + infra pendurada em AWS.</p>
                </div>
                <div className="p-5 rounded bg-black/80 border border-[#D4AF37] space-y-2 gold-glow">
                  <span className="font-mono-code text-xs text-[#D4AF37] uppercase font-bold">VALOR REAL DACTYLA CODE (EFICIÊNCIA IA + MULTI-TENANT)</span>
                  <p className="font-editorial text-3xl font-bold text-[#D4AF37]">R$ 8.500,00 — R$ 15.000,00</p>
                  <p className="text-xs text-neutral-300">Entrega em marcos blindados em repositório Git sem vendor lock-in.</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-neutral-400 font-sans border-t border-neutral-800 pt-4">
                <p><strong className="text-white">Termos de Escopo:</strong> 2 rodadas de revisões de interface inclusas no marco inicial. Mudanças posteriores orçadas sob demanda.</p>
                <p><strong className="text-white">Código Fonte:</strong> Garantia de propriedade dos dados e do domínio pelo cliente. Licenciamento perpétuo ativo mediante assinatura de infra.</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
