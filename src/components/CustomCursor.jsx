import React, { useEffect, useState } from 'react';

export default function CustomCursor({ cursorState }) {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const isExplore = cursorState.text === 'EXPLORAR';
  const isHovered = cursorState.hovered || isExplore;

  return (
    <div
      className="fixed pointer-events-none z-[9999] transition-transform duration-75 ease-out -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
      }}
    >
      {/* Central Cursor Point */}
      <div
        className={`w-2 h-2 rounded-full transition-colors duration-200 ${
          isHovered ? 'bg-[#1A1A1A]' : 'bg-[#D4AF37]'
        }`}
      />

      {/* Outer Ring / Badge */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-all duration-300 font-mono-code font-bold text-xs uppercase tracking-wider ${
          isExplore
            ? 'w-24 h-24 bg-[#D4AF37] text-[#1A1A1A] shadow-[0_0_30px_rgba(212,175,55,0.6)] scale-100'
            : isHovered
            ? 'w-14 h-14 bg-[#D4AF37]/90 text-[#1A1A1A] border border-[#D4AF37] scale-110'
            : 'w-10 h-10 border border-[#D4AF37]/60 bg-[#D4AF37]/5 scale-100'
        }`}
      >
        {isExplore && <span>EXPLORAR</span>}
      </div>
    </div>
  );
}
