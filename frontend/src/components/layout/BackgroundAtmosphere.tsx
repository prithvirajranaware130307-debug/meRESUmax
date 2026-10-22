import React from 'react';
import { useLocation } from 'react-router-dom';

export const BackgroundAtmosphere: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const isHome = path === '/';
  const isAnalyzeOrResults = path.startsWith('/analyze') || path.startsWith('/results');

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 transition-opacity duration-700 select-none">
      {/* Top subtle horizon boundary line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Spatial Grid - Subtle, architectural, non-distracting */}
      <div className="absolute inset-0 spatial-grid opacity-25" />

      {/* Top Ambient Vignette (Soft subtle architectural glow, not saturated neon) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[480px] ambient-vignette opacity-70" />

      {/* Subtle bottom edge gradient */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#090A0E] to-transparent pointer-events-none" />
    </div>
  );
};
