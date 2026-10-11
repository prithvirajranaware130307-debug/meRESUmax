import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'standard' | 'elevated' | 'subtle';
  interactive?: boolean;
  className?: string;
  glow?: 'none' | 'blue' | 'cyan' | 'violet';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'standard',
  interactive = false,
  className = '',
  glow = 'none',
  ...props
}) => {
  const baseVariant = 
    variant === 'elevated' ? 'liquid-glass-elevated' :
    variant === 'subtle' ? 'bg-white/[0.03] backdrop-blur-md border border-white/10' :
    'liquid-glass';

  const glowStyles = {
    none: '',
    blue: 'shadow-glow-blue',
    cyan: 'shadow-glow-cyan',
    violet: 'shadow-glow-violet',
  }[glow];

  return (
    <div
      className={`rounded-2xl relative overflow-hidden transition-all duration-300 ${baseVariant} ${interactive ? 'liquid-glass-interactive cursor-pointer' : ''} ${glowStyles} ${className}`}
      {...props}
    >
      {/* Soft inner reflection specular gradient */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
      {children}
    </div>
  );
};
