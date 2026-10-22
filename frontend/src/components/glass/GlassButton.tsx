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
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm rounded-lg gap-2',
    lg: 'px-6 py-2.5 text-sm sm:text-base rounded-xl gap-2.5 font-medium',
  }[size];

  const variantStyles = {
    primary:
      'bg-white text-[#090A0E] font-medium border border-white/90 shadow-sm hover:bg-zinc-100 active:scale-[0.98] transition-all',
    secondary:
      'bg-[#161922] text-[#F3F4F6] border border-white/10 hover:bg-[#1D212C] hover:border-white/20 shadow-sm active:scale-[0.98] transition-all',
    ghost:
      'bg-transparent hover:bg-white/[0.06] text-text-secondary hover:text-white transition-all',
    danger:
      'bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 active:scale-[0.98] transition-all',
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-medium select-none disabled:opacity-45 disabled:pointer-events-none relative transition-all duration-200 cursor-pointer group ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
      ) : (
        icon && <span className="transition-transform duration-200 group-hover:scale-105 shrink-0">{icon}</span>
      )}
      <span className="truncate">{children}</span>
    </button>
  );
};
