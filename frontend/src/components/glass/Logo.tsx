import React from 'react';
import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  iconSize = 18, 
  textSize = 'text-lg' 
}) => {
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Precision Geometric Monogram */}
      <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#161922] border border-white/12 shadow-sm transition-all duration-200 group-hover:border-white/25 group-hover:bg-[#1D212C]">
        <FileText size={iconSize} className="text-zinc-200 transition-transform duration-200 group-hover:scale-105" />
        {/* Subtle status indicator dot */}
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-500 border border-[#090A0E]" />
      </div>

      {/* Crafted Wordmark */}
      <span className={`font-medium tracking-tight text-white flex items-center ${textSize}`}>
        <span className="text-text-secondary font-normal">me</span>
        <span className="font-bold tracking-tight text-white px-0.5">RESU</span>
        <span className="font-light text-text-muted">max</span>
      </span>
    </Link>
  );
};
