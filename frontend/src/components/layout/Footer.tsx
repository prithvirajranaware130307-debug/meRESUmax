import React from 'react';
import { Logo } from '../glass/Logo';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="relative border-t border-white/[0.08] bg-[#090A0E] mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Logo textSize="text-xl" />
            <p className="text-text-secondary text-sm max-w-sm leading-relaxed">
              meRESUmax delivers transparent ATS scoring, skill gap intelligence, 
              and deterministic career trajectory modeling for engineering and technology candidates.
            </p>
            <div className="flex items-center gap-2 text-xs text-text-muted pt-1 font-mono">
              <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
              <span>Zero training on private candidate documents.</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-white font-mono">Platform</div>
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
              <li>
                <Link to="/interview" className="hover:text-white transition-colors">Mock Simulator</Link>
              </li>
            </ul>
          </div>

          {/* Architecture & Trust */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-white font-mono">System Integrity</div>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <a href="#faq" className="hover:text-white transition-colors">Explainability & FAQ</a>
              </li>
              <li>
                <span className="text-text-muted">Zero Third-Party Ad Trackers</span>
              </li>
              <li>
                <span className="text-text-muted">Strict Document Confidentiality</span>
              </li>
              <li>
                <span className="text-text-muted">Deterministic Benchmark Core</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.06] mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-4 font-mono">
          <p>&copy; {new Date().getFullYear()} meRESUmax Platform. All rights reserved.</p>
          <div className="flex items-center gap-2 text-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Systems Operational • Vercel Edge & Render Core</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
