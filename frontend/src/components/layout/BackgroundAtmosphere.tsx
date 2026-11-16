import React from 'react';

export const BackgroundAtmosphere: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 transition-opacity duration-700 select-none">
      {/* Top subtle horizon boundary line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-slate-400/20 dark:via-white/10 to-transparent" />

      {/* Spatial Grid - Subtle, architectural, non-distracting */}
      <div className="absolute inset-0 spatial-grid opacity-25" />

      {/* Top Ambient Vignette (Soft subtle architectural glow, not saturated neon) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[480px] ambient-vignette opacity-70" />

      {/* Subtle bottom edge gradient */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[var(--bg-main)] to-transparent pointer-events-none" />
    </div>
  );
};
