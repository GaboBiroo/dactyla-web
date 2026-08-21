import React from 'react';

/**
 * POLÍTICA DE PRIVACIDADE & TERMOS DE TRATAMENTO DE DADOS (LGPD & META COMPLIANCE)
 * 
 * Presença Prime - Dactyla Code (Score 90+ Lighthouse Target)
 * App Router Component (Next.js 13+)
 */

export const metadata = {
  title: 'Política de Privacidade & Termos de Uso | Dactyla Code',
  description: 'Política de privacidade e transparência no tratamento de dados pessoais via WhatsApp Cloud API e IA Nativa.',
};

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-[#0A140E] text-[#E8F0EA] font-sans antialiased py-16 px-6 md:py-24">
      <article className="max-w-4xl mx-auto space-y-12">
        
        {/* Cabeçalho Semântico */}
        <header className="border-b border-[#28593B]/40 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#28593B]/20 border border-[#28593B]/40 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] font-semibold">
              COMPLIANCE JURÍDICO // META GRAPH API &amp; LGPD
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#E8F0EA] leading-tight">
            Política de Privacidade e Proteção de Dados Pessoais
          </h1>

          <p className="mt-4 text-sm font-mono text-[#E8F0EA]/60">
            Última atualização: 21 de Agosto de 2026 | Versão 1.0 (Dactyla Code)
          </p>
        </header>

        {/* 1. Visão Geral */}
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-[#D4AF37] flex items-center gap-2 font-mono">
            <span>01 //</span> Visão Geral e Compromisso de Transparência
          </h2>
          <p className="text-base text-[#E8F0EA]/80 font-light leading-relaxed">
            A <strong className="text-[#E8F0EA] font-semibold">Dactyla Code</strong> tem o compromisso de proteger a privacidade e a segurança dos dados pessoais dos usuários e leads que interagem com nossas soluções de tecnologia e automação. Esta Política de Privacidade descreve como coletamos, armazenamos, processamos e protegemos suas informações em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018) e as diretrizes globais da Meta Platforms Inc.
          </p>
        </section>

        {/* 2. Coleta de Dados via Meta WhatsApp Cloud API & Tally */}
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-[#D4AF37] flex items-center gap-2 font-mono">
            <span>02 //</span> Fontes de Coleta de Dados
          </h2>
          <p className="text-base text-[#E8F0EA]/80 font-light leading-relaxed">
            Coletamos informações fornecidas diretamente por você ao interagir com nossos canais automatizados:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[#E8F0EA]/80 font-light pl-4">
            <li>
              <strong className="text-[#E8F0EA]">WhatsApp Cloud API (Meta Graph API v18+)</strong>: Coleta de número de telefone (MSISDN), nome de perfil do WhatsApp, identificador de mensagem único (WAMID) e o conteúdo textual/mídia das interações enviadas voluntariamente.
            </li>
            <li>
              <strong className="text-[#E8F0EA]">Formulários Dinâmicos (Tally Forms)</strong>: Dados preenchidos voluntariamente em questionários de diagnóstico, como e-mail corporativo, empresa, cargo e necessidades de infraestrutura.
            </li>
          </ul>
        </section>

        {/* 3. Processamento por Modelos de IA (OpenAI / Gemini & RAG) */}
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-[#D4AF37] flex items-center gap-2 font-mono">
            <span>03 //</span> Processamento via Inteligência Artificial Generativa
          </h2>
          <p className="text-base text-[#E8F0EA]/80 font-light leading-relaxed">
            Para prover atendimento instantâneo e triagem inteligente, as mensagens recebidas são processadas por provedores de Inteligência Artificial de alta capacidade (Google Gemini API e OpenAI API) utilizando técnicas de Geração Aumentada por Recuperação (RAG):
          </p>
          <ul className="list-disc list-inside space-y-2 text-[#E8F0EA]/80 font-light pl-4">
            <li>
              Os dados enviados para as APIs de IA são utilizados <strong className="text-[#E8F0EA]">exclusivamente para a geração da resposta contextual em tempo real</strong>.
            </li>
            <li>
              Adotamos termos contratuais corporativos que garantem que <strong className="text-[#E8F0EA]">seus dados pessoais NÃO são utilizados para treinamento de modelos públicos de IA</strong> pelos provedores terceiros.
            </li>
          </ul>
        </section>

        {/* 4. Retenção e Máquina de Estados (FSM Engine) */}
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-[#D4AF37] flex items-center gap-2 font-mono">
            <span>04 //</span> Armazenamento e Máquina de Estados Finitos (FSM)
          </h2>
          <p className="text-base text-[#E8F0EA]/80 font-light leading-relaxed">
            O histórico de conversas e o estado da jornada do usuário são mantidos em banco de dados relacional protegido com encriptação em repouso e em trânsito (TLS 1.3 / AES-256).
          </p>
          <div className="bg-[#0E1B13] p-6 rounded-xl border border-[#28593B]/30 font-mono text-sm space-y-2">
            <div className="text-[#D4AF37] font-bold">ESTADOS LÓGICOS DA FSM:</div>
            <div>• Estado 100 (NEW_LEAD): Ingestão inicial e confirmação de consentimento.</div>
            <div>• Estado 200 (AI_QUALIFICATION): Qualificação conversacional automatizada.</div>
            <div>• Estado 300 (FORM_PENDING): Bloqueio temporário de IA para preenchimento de formulário.</div>
            <div>• Estado 400 (HUMAN_HANDOFF): Desativação de IA e transbordo para atendente humano.</div>
          </div>
        </section>

        {/* 5. Direitos do Titular de Dados (LGPD) */}
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-[#D4AF37] flex items-center gap-2 font-mono">
            <span>05 //</span> Direitos do Titular dos Dados (Art. 18 LGPD)
          </h2>
          <p className="text-base text-[#E8F0EA]/80 font-light leading-relaxed">
            Como titular dos dados pessoais, você possui os seguintes direitos garantidos por lei:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[#E8F0EA]/80 font-light pl-4">
            <li>Confirmação da existência de tratamento e acesso aos seus dados.</li>
            <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
            <li>Eliminação definitiva de dados pessoais mediante solicitação (Opt-Out / Direito ao Esquecimento).</li>
            <li>Revogação do consentimento para tratamento de dados a qualquer momento.</li>
          </ul>
        </section>

        {/* 6. Encarregado de Dados (DPO) & Contato */}
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-[#D4AF37] flex items-center gap-2 font-mono">
            <span>06 //</span> Encarregado de Proteção de Dados (DPO) e Contato
          </h2>
          <p className="text-base text-[#E8F0EA]/80 font-light leading-relaxed">
            Para exercer seus direitos de titular de dados ou esclarecer dúvidas sobre esta Política de Privacidade, entre em contato com nosso Encarregado de Proteção de Dados:
          </p>
          <div className="bg-[#0E1B13] p-6 rounded-xl border border-[#28593B]/40 space-y-2">
            <p className="font-semibold text-[#E8F0EA]">Dactyla Code - Engenharia de Software</p>
            <p className="text-sm font-mono text-[#D4AF37]">E-mail de Privacidade: dpo@dactylacode.com.br</p>
            <p className="text-sm font-mono text-[#E8F0EA]/70">Endereço: Caraguatatuba - SP, Brasil</p>
          </div>
        </section>

        {/* Rodapé Semântico */}
        <footer className="border-t border-[#28593B]/30 pt-8 text-center text-xs font-mono text-[#E8F0EA]/40">
          DACTYLA CODE // TODOS OS DIREITOS RESERVADOS 2026 // LGPD &amp; META COMPLIANCE PASSED
        </footer>

      </article>
    </main>
  );
}
