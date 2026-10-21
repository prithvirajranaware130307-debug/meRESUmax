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
    <div className="min-h-screen pt-28 pb-16 flex items-center justify-center px-4 relative z-10">
      <div className="w-full max-w-md">
        <GlassCard variant="elevated" className="p-8 border border-white/20 shadow-glass-lg">
          <div className="text-center mb-8">
            <Logo textSize="text-2xl" className="justify-center mb-3" />
            <h1 className="text-xl font-bold text-white tracking-tight">Welcome back</h1>
            <p className="text-text-secondary text-xs mt-1">Sign in to your meRESUmax career command center</p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-text-muted focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                />
                <Mail size={16} className="absolute left-3.5 top-3 text-text-muted" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-text-muted focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                />
                <Lock size={16} className="absolute left-3.5 top-3 text-text-muted" />
              </div>
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full mt-2"
              icon={<ArrowRight size={16} />}
            >
              Sign In
            </GlassButton>
          </form>

          {/* Quick Demo Sign In & Auto-fill */}
          <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
            <button
              type="button"
              onClick={handleInstantDemoLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-cyan/15 hover:bg-brand-cyan/25 border border-brand-cyan/30 text-xs font-semibold text-brand-cyan hover:text-white flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99]"
            >
              <Sparkles size={14} className="text-brand-cyan" />
              <span>Instant Demo Sign In (1-Click)</span>
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={fillDemoAccount}
                className="text-[11px] text-text-muted hover:text-text-secondary transition-colors"
              >
                Or auto-fill demo credentials into form
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-text-secondary">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-brand-blue hover:text-brand-cyan font-semibold transition-colors">
              Create an Account
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
