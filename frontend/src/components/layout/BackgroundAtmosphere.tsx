import React from 'react';
import { useLocation } from 'react-router-dom';

export const BackgroundAtmosphere: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  // Determine page-specific ambient accent
  const isInterview = path.startsWith('/interview');
  const isJobsOrTracker = path.startsWith('/jobs') || path.startsWith('/tracker');
  const isAnalyzeOrResults = path.startsWith('/analyze') || path.startsWith('/results');
  const isToolsOrBuilder = path.startsWith('/tools') || path.startsWith('/builder');

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 transition-opacity duration-700">
      {/* Base Spatial Grid */}
      <div className="absolute inset-0 spatial-grid opacity-25" />

      {/* Top Center Electric Blue Light Field */}
      <div 
        className={`orb orb-blue w-[540px] h-[540px] -top-36 left-1/2 -translate-x-1/2 transition-all duration-1000 ease-out ${
          isAnalyzeOrResults ? 'opacity-40 scale-110' : 'opacity-25'
        }`}
      />

      {/* Top Right Cyan Light Field */}
      <div 
        className={`orb orb-cyan w-[420px] h-[420px] top-28 -right-16 transition-all duration-1000 ease-out ${
          isJobsOrTracker ? 'opacity-35 scale-110' : 'opacity-20'
        }`}
      />

      {/* Middle Left Violet Light Field */}
      <div 
        className={`orb orb-violet w-[480px] h-[480px] top-[500px] -left-20 transition-all duration-1000 ease-out ${
          isInterview || isToolsOrBuilder ? 'opacity-40 scale-110' : 'opacity-20'
        }`}
      />

      {/* Bottom Center Dynamic Subtle Field */}
      <div 
        className={`orb w-[650px] h-[650px] bottom-0 right-1/4 transition-all duration-1000 ease-out ${
          isJobsOrTracker 
            ? 'orb-cyan opacity-25' 
            : isInterview 
              ? 'orb-violet opacity-30' 
              : 'orb-blue opacity-15'
        }`}
      />
    </div>
  );
};
