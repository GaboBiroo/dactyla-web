import React from 'react';

/**
 * Componente dinâmico isolado do Formulário Tally.
 * Carregado via next/dynamic exclusivamente quando invocado pelo usuário,
 * protegendo o Score Lighthouse contra iFrames pesados na carga inicial.
 */
export default function TallyFormModal({ formId }) {
  return (
    <div className="w-full min-h-[500px] rounded-xl overflow-hidden bg-[#0E1B13]">
      <iframe
        src={`https://tally.so/embed/${formId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`}
        width="100%"
        height="500"
        frameBorder="0"
        marginHeight={0}
        marginWidth={0}
        title="Formulário Tally - Presença Prime"
        className="w-full h-[500px] border-0"
      />
    </div>
  );
}
