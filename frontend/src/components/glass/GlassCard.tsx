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
    variant === 'elevated' 
      ? 'bg-[#161922]/95 border border-white/[0.10] shadow-card' 
      : variant === 'subtle' 
        ? 'bg-white/[0.025] border border-white/[0.06]' 
        : 'bg-[#111318]/90 border border-white/[0.08] shadow-sm';

  const interactiveStyles = interactive 
    ? 'hover:border-white/[0.18] hover:bg-[#151821] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer' 
    : '';

  return (
    <div
      className={`rounded-xl relative overflow-hidden transition-all duration-200 ${baseVariant} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
