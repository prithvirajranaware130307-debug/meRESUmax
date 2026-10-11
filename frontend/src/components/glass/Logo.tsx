import React from 'react';
import { Sparkles, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  iconSize = 20, 
  textSize = 'text-xl' 
}) => {
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Liquid Glass Icon Capsule */}
      <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-blue/20 via-brand-cyan/15 to-brand-violet/20 border border-white/20 shadow-glass-sm backdrop-blur-md transition-all duration-300 group-hover:border-white/40 group-hover:scale-105 group-hover:shadow-glow-cyan">
        <FileText size={iconSize} className="text-brand-cyan transition-transform duration-300 group-hover:scale-110" />
        <Sparkles size={11} className="absolute -top-1 -right-1 text-brand-blue animate-pulse-slow" />
      </div>

      {/* Wordmark with accented RESU */}
      <span className={`font-semibold tracking-tight text-white flex items-center ${textSize}`}>
        <span>me</span>
        <span className="font-black tracking-normal text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-violet px-0.5">
          RESU
        </span>
        <span className="font-light text-text-secondary">max</span>
      </span>
    </Link>
  );
};
