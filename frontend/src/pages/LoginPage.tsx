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
    if (isLoading) return; // Prevent duplicate submission

    setError('');
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      await login({ email: trimmedEmail.toLowerCase(), password });
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please verify credentials.';
      const lower = msg.toLowerCase();
      if (lower.includes('timed out') || lower.includes('starting') || lower.includes('failed to fetch') || lower.includes('502') || lower.includes('503')) {
        setError('The analysis service is starting up on Render. Please wait a few seconds and try again.');
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantDemoLogin = async () => {
    if (isLoading) return;
    setEmail('demo.candidate@meresumax.ai');
    setPassword('DemoPass123!');
    setError('');
    setIsLoading(true);
    try {
      await login({ email: 'demo.candidate@meresumax.ai', password: 'DemoPass123!' });
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'Demo login failed. Please verify credentials.';
      const lower = msg.toLowerCase();
      if (lower.includes('timed out') || lower.includes('starting') || lower.includes('failed to fetch') || lower.includes('502') || lower.includes('503')) {
        setError('The service is waking up on Render. Please click Instant Demo again in a few seconds.');
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-4 relative z-10">
      <div className="w-full max-w-md">
        <GlassCard variant="elevated" className="p-8 border border-slate-200 dark:border-white/[0.12] shadow-elevated">
          <div className="text-center mb-8">
            <Logo textSize="text-xl" className="justify-center mb-3" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Sign in to your account</h1>
            <p className="text-text-secondary text-xs mt-1">Access your resume analytics & career command center</p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 font-mono">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div className="font-sans leading-tight">
                <span>{error}</span>
                {error.includes('credentials') && (
                  <div className="mt-1 font-mono text-[11px] text-slate-600 dark:text-zinc-400">
                    Need a test profile? Try the one-click instant demo below.
                  </div>
                )}
              </div>
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
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#0D0F14] border border-slate-300 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all disabled:opacity-50"
                />
                <Mail size={15} className="absolute left-3 top-2.5 text-slate-400 dark:text-zinc-500 pointer-events-none" />
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
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#0D0F14] border border-slate-300 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all disabled:opacity-50"
                />
                <Lock size={15} className="absolute left-3 top-2.5 text-slate-400 dark:text-zinc-500 pointer-events-none" />
              </div>
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              disabled={isLoading}
              className="w-full mt-2"
              icon={<ArrowRight size={15} />}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </GlassButton>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/[0.08] space-y-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleInstantDemoLogin}
              className="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-300 dark:border-white/10 text-xs font-mono text-text-secondary hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles size={13} className="text-[#E8FF47]" />
              <span>{isLoading ? 'Authenticating...' : 'One-Click Instant Demo Login'}</span>
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors">
              Create Account
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
