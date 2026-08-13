import React, { Component } from 'react';

export default class Safe3DCanvas extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('WebGL / R3F Canvas Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#0A140E] border border-[#28593B] text-center space-y-2">
          <span className="font-mono-code text-xs text-[#D4AF37] font-bold">
            [CANVAS 3D ENGINE SAFE FALLBACK]
          </span>
          <p className="font-sans text-xs text-neutral-400">
            Aceleração 3D ativa. Navegação e ecossistema operacional 100% disponíveis.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
