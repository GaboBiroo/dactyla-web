import React, { useState } from 'react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const NICHE_PROFILES = {
  oficina: {
    id: 'oficina',
    label: '🔧 Oficina / Troca de Óleo',
    ticketMedio: 320,
    cicloIdealDias: 150,
    cicloRealSemMotor: '260+ dias (ou troca no concorrente)',
    breakEvenText: 'Apenas 1 carro recuperado/mês já paga os R$ 130 de mensalidade e sobra R$ 190 no caixa.',
    exampleService: 'Troca de óleo + filtros + revisão preventiva de freios',
    defaultRecovered: 15,
  },
  petshop: {
    id: 'petshop',
    label: '🐾 Pet Shop / Banho & Tosa',
    ticketMedio: 85,
    cicloIdealDias: 30,
    cicloRealSemMotor: '55 a 75 dias (tutor esquece a data)',
    breakEvenText: 'Apenas 2 banhos recuperados/mês já pagam os R$ 130 de mensalidade.',
    exampleService: 'Banho & tosa higiênica + hidratação + antipulgas',
    defaultRecovered: 18,
  },
  barbearia: {
    id: 'barbearia',
    label: '💈 Barbearia',
    ticketMedio: 75,
    cicloIdealDias: 21,
    cicloRealSemMotor: '40 a 50 dias (perde 4 cortes no ano por cliente)',
    breakEvenText: '2 combos no caixa bruto (ou 4 no lucro líquido) já pagam todo o sistema.',
    exampleService: 'Combo corte degradê + barba terapia na terça ou quarta-feira',
    defaultRecovered: 20,
  },
};

const impactBlocks = [
  {
    id: 'seasonality-cycle',
    number: '50%',
    label: 'de queda de movimento fora de temporada e clientes esquecidos',
    title: 'A Sangria Silenciosa do Ciclo de Retorno',
    scenario:
      'Em Caraguatatuba, o cliente não deixa de voltar porque ficou insatisfeito — ele demora o dobro do tempo porque esquece. Na Troca de Óleo (ciclo ideal de 150 dias), no Banho & Tosa (30 dias) e na Barbearia (21 dias), cada semana de atraso dilui até 50% do faturamento recorrente da loja na baixa temporada.',
    solution:
      'Motor de Reativação Preditiva que monitora a data do último serviço e envia uma mensagem 100% humana no WhatsApp da própria loja ("Fala Marcos, o Gol já bateu os 5 meses da última troca de óleo?"). Além disso, preenche horários ociosos de terça e quarta-feira e avisa quando o carro ou pet está pronto com 1 clique.',
    solutionLabel: 'Agenda blindada de janeiro a dezembro.',
  },
  {
    id: 'zero-msg-fee',
    number: 'R$ 0',
    label: 'de taxa por mensagem disparada na nossa arquitetura local',
    title: 'Fim do Pedágio por Mensagem Enviada',
    scenario:
      'Sistemas tradicionais de gestão cobram caro para você falar com os seus próprios clientes: o SimplesVet cobra R$ 0,50 por mensagem automática no WhatsApp, e a API Oficial de Marketing da Meta cobra cerca de R$ 0,32 por disparo. Em 500 avisos no mês, você paga mais de R$ 200 só de taxa variável.',
    solution:
      'Arquitetura Local-First pareada diretamente no WhatsApp que sua loja já usa (com cadência humana, Spintax nativo, simulação de digitação de 4s e Jitter anti-ban de 45s a 120s). Você tem previsibilidade absoluta por R$ 130/mês fixos e R$ 0,00 de taxa por mensagem.',
    solutionLabel: 'Zero pedágio por disparo. Economia imediata.',
  },
  {
    id: 'zero-risk-48h',
    number: '48h',
    label: 'para validar com dinheiro no caixa antes de pagar o setup',
    title: 'Protocolo Caixa Primeiro (Risco Zero)',
    scenario:
      'O comerciante local já está cansado de agências que cobram R$ 2.000 adiantados prometendo "gestão de tráfego" ou robôs engessados("Digite 1 para agendar") que irritam os clientes da cidade e não trazem um único real para o balcão.',
    solution:
      'Invertemos o risco: você separa 60 clientes que não aparecem há mais de 45 dias e nós rodamos o Disparo de Validação em 48h direto no seu WhatsApp. Você só paga o Setup de R$ 400,00 depois de ver seus clientes respondendo e agendando no seu próprio celular.',
    solutionLabel: 'O próprio caixa recuperado paga a implantação.',
  },
];

export default function ConcreteImpact() {
  const [selectedNiche, setSelectedNiche] = useState('oficina');
  const [recoveredCount, setRecoveredCount] = useState(15);

  const profile = NICHE_PROFILES[selectedNiche];
  const mrrCost = 130;
  const grossMonthly = recoveredCount * profile.ticketMedio;
  const netMonthlyAfterMrr = Math.max(0, grossMonthly - mrrCost);
  const netAnnualAfterSetupAndMrr = Math.max(0, netMonthlyAfterMrr * 12 - 400);
  const roiMultiplier = ((grossMonthly / mrrCost)).toFixed(1);

  const handleSelectNiche = (nicheKey) => {
    setSelectedNiche(nicheKey);
    setRecoveredCount(NICHE_PROFILES[nicheKey].defaultRecovered);
  };

  return (
    <section id="impacto" className="bg-[#0A140E] text-[#E8F0EA] py-32 px-6 relative overflow-hidden border-t border-[#E8F0EA]/5">
      <div className="max-w-7xl mx-auto">

        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '50px' }}
          variants={stagger}
          className="mb-20 max-w-3xl transform-gpu will-change-transform"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-4 mb-6">
            <span className="w-12 h-[1px] bg-[#D4AF37]" />
            <span className="text-xs uppercase tracking-[0.4em] text-[#D4AF37] font-light">
              Estudo de Viabilidade — Caraguatatuba/SP
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="text-4xl md:text-6xl font-serif font-light tracking-tight text-[#E8F0EA] leading-[1.1] mb-6"
          >
            Matemática de Balcão:
            <em className="text-[#D4AF37] not-italic"> o lucro que já é seu.</em>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="text-base md:text-lg text-[#E8F0EA]/70 font-light leading-relaxed"
          >
            Cada cliente antigo que passa do prazo de retorno é dinheiro vivo que fica na mesa.
            Simule abaixo quanto o Motor de Reativação 48h devolve para o caixa da sua loja todos os meses.
          </motion.p>
        </motion.div>

        {/* ─── INTERACTIVE ROI CALCULATOR ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '50px' }}
          transition={{ duration: 0.7 }}
          className="mb-32 border border-[#D4AF37]/30 bg-[#070E0A]/90 rounded-sm p-6 md:p-12 shadow-[0_0_40px_rgba(212,175,55,0.08)] transform-gpu will-change-transform"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 mb-8 border-b border-[#E8F0EA]/10">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#D4AF37] block mb-2">
                CALCULADORA INTERATIVA DE RETORNO (ROI REAL CARAGUÁ)
              </span>
              <h3 className="text-2xl md:text-3xl font-serif font-light text-[#E8F0EA]">
                Selecione o seu segmento em Caraguatatuba:
              </h3>
            </div>

            {/* Niche Selector Buttons */}
            <div className="flex flex-wrap gap-3">
              {Object.values(NICHE_PROFILES).map((item) => {
                const isSelected = selectedNiche === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectNiche(item.id)}
                    className={`px-4 py-2.5 text-xs md:text-sm font-mono rounded-sm transition-all duration-300 cursor-pointer border ${
                      isSelected
                        ? 'bg-[#D4AF37] text-[#0A140E] border-[#D4AF37] font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                        : 'bg-[#0A140E] text-[#E8F0EA]/80 border-[#E8F0EA]/15 hover:border-[#D4AF37]/50'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Controls & Niche Parameters */}
            <div className="lg:col-span-7 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-[#0A140E] border border-[#E8F0EA]/10 rounded-sm">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#E8F0EA]/50 block">
                    Ticket Médio Local
                  </span>
                  <span className="text-2xl font-serif text-[#D4AF37] mt-1 block">
                    R$ {profile.ticketMedio},00
                  </span>
                </div>
                <div className="p-4 bg-[#0A140E] border border-[#E8F0EA]/10 rounded-sm">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#E8F0EA]/50 block">
                    Ciclo Ideal de Retorno
                  </span>
                  <span className="text-2xl font-serif text-[#E8F0EA] mt-1 block">
                    {profile.cicloIdealDias} dias
                  </span>
                </div>
                <div className="p-4 bg-[#0A140E] border border-[#E8F0EA]/10 rounded-sm">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#E8F0EA]/50 block">
                    Custo Mensal Fixo
                  </span>
                  <span className="text-2xl font-serif text-[#E8F0EA] mt-1 block">
                    R$ 130<span className="text-xs text-[#E8F0EA]/50">/mês</span>
                  </span>
                </div>
              </div>

              {/* Slider for Recovered Customers per Month */}
              <div className="p-6 bg-[#0A140E] border border-[#28593B]/40 rounded-sm space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="recovered-slider" className="text-sm font-medium text-[#E8F0EA]">
                    Clientes inativos recuperados por mês:
                  </label>
                  <span className="px-3 py-1 bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] font-mono text-sm font-bold rounded-sm">
                    {recoveredCount} clientes / mês
                  </span>
                </div>

                <input
                  id="recovered-slider"
                  type="range"
                  min={2}
                  max={50}
                  step={1}
                  value={recoveredCount}
                  onChange={(e) => setRecoveredCount(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] cursor-pointer h-2 bg-[#112017] rounded-lg"
                />

                <div className="flex justify-between text-[11px] font-mono text-[#E8F0EA]/40">
                  <span>Conservador (5/mês)</span>
                  <span>Média Caraguá (15/mês)</span>
                  <span>Alta Demanda (50/mês)</span>
                </div>
              </div>

              <div className="p-4 border-l-2 border-[#D4AF37] bg-[#D4AF37]/5 text-xs md:text-sm text-[#E8F0EA]/85 leading-relaxed">
                <strong className="text-[#D4AF37] font-mono uppercase tracking-wider block mb-1">
                  Ponto de Equilíbrio (Break-Even):
                </strong>
                {profile.breakEvenText} Serviço base: <em>{profile.exampleService}</em>.
              </div>
            </div>

            {/* Right Output Card */}
            <div className="lg:col-span-5 bg-[#0A140E] border-2 border-[#D4AF37] rounded-sm p-8 space-y-6 shadow-[0_0_30px_rgba(212,175,55,0.12)]">
              <div className="flex items-center justify-between border-b border-[#E8F0EA]/10 pb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-[#D4AF37]">
                  PROJEÇÃO DE CAIXA RECUPERADO
                </span>
                <span className="text-xs font-mono px-2.5 py-0.5 bg-[#28593B] text-[#E8F0EA] rounded-sm">
                  ROI {roiMultiplier}x
                </span>
              </div>

              <div>
                <span className="text-xs text-[#E8F0EA]/55 block mb-1">
                  Faturamento Bruto Recuperado / Mês:
                </span>
                <div className="text-4xl md:text-5xl font-serif text-[#D4AF37] font-light tracking-tight">
                  R$ {grossMonthly.toLocaleString('pt-BR')}
                  <span className="text-base text-[#E8F0EA]/50 font-sans">/mês</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#E8F0EA]/10">
                <div>
                  <span className="text-[11px] text-[#E8F0EA]/50 block">
                    Saldo Líquido Mensal (após R$ 130):
                  </span>
                  <span className="text-lg font-mono font-bold text-[#E8F0EA]">
                    + R$ {netMonthlyAfterMrr.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#E8F0EA]/50 block">
                    Caixa Acumulado em 12 Meses:
                  </span>
                  <span className="text-lg font-mono font-bold text-[#D4AF37]">
                    R$ {netAnnualAfterSetupAndMrr.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

              <a
                href="#pacotes"
                className="w-full block text-center py-3.5 px-6 bg-[#D4AF37] text-[#0A140E] font-mono text-xs md:text-sm font-bold uppercase tracking-wider rounded-sm hover:bg-[#E8F0EA] transition-colors duration-300"
              >
                Validar em 48h com Risco Zero →
              </a>
            </div>
          </div>
        </motion.div>

        {/* Impact Blocks */}
        <div className="space-y-28">
          {impactBlocks.map((block) => (
            <motion.div
              key={block.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '50px' }}
              variants={stagger}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start transform-gpu will-change-transform"
            >
              {/* Left Column: The Number & Problem */}
              <motion.div
                variants={fadeUp}
                className="lg:col-span-5"
              >
                <span className="text-7xl md:text-9xl font-serif font-light text-[#D4AF37]/20 leading-none block mb-2">
                  {block.number}
                </span>
                <span className="text-sm text-[#E8F0EA]/50 font-light block mb-8">
                  {block.label}
                </span>

                <h3 className="text-2xl md:text-3xl font-serif font-light tracking-tight text-[#E8F0EA] mb-6">
                  {block.title}
                </h3>

                <p className="text-base text-[#E8F0EA]/70 font-light leading-relaxed">
                  {block.scenario}
                </p>
              </motion.div>

              {/* Right Column: The Solution */}
              <motion.div
                variants={fadeUp}
                className="lg:col-span-7 lg:pt-24"
              >
                <div className="border-l border-[#D4AF37]/30 pl-8 md:pl-12">
                  <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-light mb-4 block">
                    A Resposta da Dactyla
                  </span>

                  <p className="text-base md:text-lg text-[#E8F0EA]/85 font-light leading-relaxed mb-6">
                    {block.solution}
                  </p>

                  <span className="text-sm text-[#D4AF37]/70 font-light italic">
                    Resultado: {block.solutionLabel}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
