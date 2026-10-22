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
      'bg-[#E8FF47] text-[#0A0A0A] font-semibold border border-[#E8FF47] shadow-sm hover:bg-[#F0FF6A] hover:border-[#F0FF6A] active:scale-[0.98] active:bg-[#D4EB3A] transition-all',
    secondary:
      'bg-[#E8FF47] text-[#0A0A0A] font-medium border border-[#E8FF47] shadow-sm hover:bg-[#F0FF6A] hover:border-[#F0FF6A] active:scale-[0.98] transition-all',
    ghost:
      'bg-[#E8FF47]/10 text-[#E8FF47] border border-[#E8FF47]/30 hover:bg-[#E8FF47]/20 hover:border-[#E8FF47]/60 transition-all',
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
