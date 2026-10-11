import React from 'react';
import { Logo } from '../glass/Logo';
import { ShieldCheck, Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="relative border-t border-white/10 bg-[#070912]/80 backdrop-blur-xl mt-24">
      {/* Specular highlight border */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Logo textSize="text-2xl" />
            <p className="text-text-secondary text-sm max-w-sm leading-relaxed">
              meRESUmax helps students, fresh graduates, and tech professionals unlock their true potential 
              with explainable resume quality scores, skill gap intelligence, and tailored career trajectories.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-mint/90 pt-2">
              <ShieldCheck size={16} />
              <span>Your career data stays private and encrypted.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-white">Platform</div>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link to="/analyze" className="hover:text-white transition-colors">Resume Analyzer</Link>
              </li>
              <li>
                <Link to="/jobs" className="hover:text-white transition-colors">Job Discovery</Link>
              </li>
              <li>
                <Link to="/roadmap" className="hover:text-white transition-colors">Career Roadmap</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">Command Center</Link>
              </li>
            </ul>
          </div>

          {/* Legal & Mission */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-white">Trust & Security</div>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <a href="#faq" className="hover:text-white transition-colors">Privacy FAQ</a>
              </li>
              <li>
                <span className="text-text-muted">No Third-Party Ad Tracking</span>
              </li>
              <li>
                <span className="text-text-muted">Strict Document Confidentiality</span>
              </li>
              <li>
                <span className="text-text-muted">Heuristic & AI Audited</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-4">
          <p>&copy; {new Date().getFullYear()} meRESUmax. Crafted with Apple Liquid Glass aesthetic standards.</p>
          <div className="flex items-center gap-1 text-text-secondary">
            <span>Powered by intelligent heuristics & verified career taxonomies</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
