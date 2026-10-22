import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { Logo } from '../components/glass/Logo';
import { Lock, Mail, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('demo.candidate@meresumax.ai');
    setPassword('DemoPass123!');
  };

  const handleInstantDemoLogin = async () => {
    setEmail('demo.candidate@meresumax.ai');
    setPassword('DemoPass123!');
    setError('');
    setIsLoading(true);
    try {
      await login({ email: 'demo.candidate@meresumax.ai', password: 'DemoPass123!' });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-4 relative z-10">
      <div className="w-full max-w-md">
        <GlassCard variant="elevated" className="p-8 border border-white/[0.12] shadow-elevated">
          <div className="text-center mb-8">
            <Logo textSize="text-xl" className="justify-center mb-3" />
            <h1 className="text-xl font-bold text-white tracking-tight">Sign in to your account</h1>
            <p className="text-text-secondary text-xs mt-1">Access your resume analytics & career command center</p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2 font-mono">
              <AlertCircle size={15} className="shrink-0 text-rose-400" />
              <span className="font-sans">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-text-secondary uppercase tracking-wider mb-1.5">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full pl-9 pr-4 py-2 bg-[#0D0F14] border border-white/10 rounded-lg text-sm text-white placeholder-text-muted focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
                <Mail size={15} className="absolute left-3 top-2.5 text-zinc-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-text-secondary uppercase tracking-wider mb-1.5">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2 bg-[#0D0F14] border border-white/10 rounded-lg text-sm text-white placeholder-text-muted focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
                <Lock size={15} className="absolute left-3 top-2.5 text-zinc-500" />
              </div>
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full mt-2"
              icon={<ArrowRight size={15} />}
            >
              Sign In
            </GlassButton>
          </form>

          {/* Quick Demo Sign In & Auto-fill */}
          <div className="mt-5 pt-4 border-t border-white/[0.08] space-y-2">
            <button
              type="button"
              onClick={handleInstantDemoLogin}
              disabled={isLoading}
              className="w-full py-2 px-3 rounded-lg bg-[#161922] hover:bg-[#1D212C] border border-white/10 text-xs font-medium text-zinc-200 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
            >
              <Sparkles size={13} className="text-blue-400" />
              <span>Instant Demo Sign In (1-Click)</span>
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={fillDemoAccount}
                className="text-[11px] font-mono text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
              >
                Or auto-fill demo credentials
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-text-secondary">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-white hover:text-blue-400 font-medium transition-colors">
              Create an Account
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
