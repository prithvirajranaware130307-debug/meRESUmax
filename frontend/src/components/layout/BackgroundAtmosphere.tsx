import React from 'react';

export const BackgroundAtmosphere: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base Spatial Grid */}
      <div className="absolute inset-0 spatial-grid opacity-30" />

      {/* Top Center Electric Blue Light Field */}
      <div 
        className="orb orb-blue w-[500px] h-[500px] -top-40 left-1/2 -translate-x-1/2 animate-orb-drift opacity-30"
      />

      {/* Top Right Cyan Light Field */}
      <div 
        className="orb orb-cyan w-[400px] h-[400px] top-32 -right-20 opacity-20"
      />

      {/* Middle Left Violet Light Field */}
      <div 
        className="orb orb-violet w-[450px] h-[450px] top-[600px] -left-20 animate-orb-drift opacity-25"
      />

      {/* Bottom Center Subtle Field */}
      <div 
        className="orb orb-blue w-[600px] h-[600px] bottom-0 right-1/4 opacity-15"
      />
    </div>
  );
};
