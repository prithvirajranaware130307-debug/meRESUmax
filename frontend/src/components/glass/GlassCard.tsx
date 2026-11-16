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
      ? 'bg-white/95 dark:bg-[#161922]/95 border border-slate-200/80 dark:border-white/[0.10] shadow-card' 
      : variant === 'subtle' 
        ? 'bg-slate-100/70 dark:bg-white/[0.025] border border-slate-200/70 dark:border-white/[0.06]' 
        : 'bg-white/90 dark:bg-[#111318]/90 border border-slate-200/80 dark:border-white/[0.08] shadow-sm';

  const interactiveStyles = interactive 
    ? 'hover:border-slate-300 dark:hover:border-white/[0.18] hover:bg-slate-50 dark:hover:bg-[#151821] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer' 
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
