import React from 'react';
import { Loader2 } from 'lucide-react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-7 py-3.5 text-base rounded-2xl gap-2.5 font-medium',
  }[size];

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-brand-blue/80 via-brand-cyan/80 to-brand-violet/80 text-white border border-white/30 shadow-glass-sm hover:brightness-110 active:scale-[0.98] shadow-glow-blue',
    secondary:
      'liquid-glass text-text-primary hover:bg-white/[0.12] hover:border-white/25 active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-white/[0.08] text-text-secondary hover:text-white',
    danger:
      'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 active:scale-[0.98]',
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden group ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {/* Specular inner light */}
      <span className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
      {isLoading ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : (
        icon && <span className="transition-transform duration-200 group-hover:scale-105">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
