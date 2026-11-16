import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { Logo } from '../components/glass/Logo';
import { Lock, Mail, User, Briefcase, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetRole, setTargetRole] = useState('Software Developer');
  
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    targetRole?: string;
  }>({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs: typeof fieldErrors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      errs.name = 'Full name is required.';
    } else if (trimmedName.length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(trimmedEmail)) {
      errs.email = 'Please enter a valid email address (e.g. you@example.com).';
    }

    if (!targetRole.trim()) {
      errs.targetRole = 'Please select a target role.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Prevent duplicate submission

    setError('');
    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        target_role: targetRole.trim()
      });
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'Registration failed.';
      const lower = msg.toLowerCase();

      if (lower.includes('already exists') || lower.includes('duplicate') || lower.includes('409')) {
        setFieldErrors(prev => ({
          ...prev,
          email: 'An account with this email already exists. Please sign in instead.'
        }));
        setError('An account with this email address already exists. Please sign in instead.');
      } else if (lower.includes('valid email')) {
        setFieldErrors(prev => ({
          ...prev,
          email: 'Please enter a valid email address.'
        }));
        setError(msg);
      } else if (lower.includes('6 characters') || lower.includes('weak password')) {
        setFieldErrors(prev => ({
          ...prev,
          password: 'Password must be at least 6 characters long.'
        }));
        setError(msg);
      } else if (lower.includes('timed out') || lower.includes('starting') || lower.includes('failed to fetch') || lower.includes('502') || lower.includes('503')) {
        setError('The service is starting up on Render. Please wait a few seconds and try again.');
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
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Create your account</h1>
            <p className="text-text-secondary text-xs mt-1">Accelerate your career trajectory with meRESUmax</p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 font-mono">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div className="font-sans leading-tight">
                <span>{error}</span>
                {error.includes('already exists') && (
                  <div className="mt-1 font-mono text-[11px]">
                    <Link to="/login" className="underline hover:text-rose-400 dark:hover:text-white text-rose-500 dark:text-rose-200">
                      Go to Sign In &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-mono text-text-secondary uppercase tracking-wider mb-1.5">
                FULL NAME
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  disabled={isLoading}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  placeholder="e.g. Maya Chen"
                  className={`w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#0D0F14] border rounded-lg text-sm text-slate-900 dark:text-white placeholder-text-muted focus:outline-none focus:ring-1 transition-all disabled:opacity-50 ${
                    fieldErrors.name 
                      ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/30' 
                      : 'border-slate-300 dark:border-white/10 focus:border-blue-500 focus:ring-blue-500/30'
                  }`}
                />
                <User size={15} className="absolute left-3 top-2.5 text-slate-400 dark:text-zinc-500 pointer-events-none" />
              </div>
              {fieldErrors.name && (
                <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-mono flex items-center gap-1">
                  <span>&bull;</span> {fieldErrors.name}
                </p>
              )}
            </div>

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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  placeholder="you@domain.com"
                  className={`w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#0D0F14] border rounded-lg text-sm text-slate-900 dark:text-white placeholder-text-muted focus:outline-none focus:ring-1 transition-all disabled:opacity-50 ${
                    fieldErrors.email 
                      ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/30' 
                      : 'border-slate-300 dark:border-white/10 focus:border-blue-500 focus:ring-blue-500/30'
                  }`}
                />
                <Mail size={15} className="absolute left-3 top-2.5 text-slate-400 dark:text-zinc-500 pointer-events-none" />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-mono flex items-center gap-1">
                  <span>&bull;</span> {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono text-text-secondary uppercase tracking-wider mb-1.5">
                TARGET CAREER ROLE
              </label>
              <div className="relative">
                <select
                  value={targetRole}
                  disabled={isLoading}
                  onChange={(e) => {
                    setTargetRole(e.target.value);
                    if (fieldErrors.targetRole) setFieldErrors(prev => ({ ...prev, targetRole: undefined }));
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#0D0F14] border border-slate-300 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="Software Developer" className="bg-white text-slate-900 dark:bg-[#111318] dark:text-white">Software Developer</option>
                  <option value="Frontend Developer" className="bg-white text-slate-900 dark:bg-[#111318] dark:text-white">Frontend Developer</option>
                  <option value="Backend Developer" className="bg-white text-slate-900 dark:bg-[#111318] dark:text-white">Backend Developer</option>
                  <option value="Python Developer" className="bg-white text-slate-900 dark:bg-[#111318] dark:text-white">Python Developer</option>
                  <option value="AI/ML Engineer" className="bg-white text-slate-900 dark:bg-[#111318] dark:text-white">AI/ML Engineer</option>
                  <option value="Data Analyst" className="bg-white text-slate-900 dark:bg-[#111318] dark:text-white">Data Analyst</option>
                  <option value="Data Scientist" className="bg-white text-slate-900 dark:bg-[#111318] dark:text-white">Data Scientist</option>
                  <option value="Cybersecurity Analyst" className="bg-white text-slate-900 dark:bg-[#111318] dark:text-white">Cybersecurity Analyst</option>
                  <option value="Cloud Engineer" className="bg-white text-slate-900 dark:bg-[#111318] dark:text-white">Cloud Engineer</option>
                  <option value="UI/UX Designer" className="bg-white text-slate-900 dark:bg-[#111318] dark:text-white">UI/UX Designer</option>
                </select>
                <Briefcase size={15} className="absolute left-3 top-2.5 text-slate-400 dark:text-zinc-500 pointer-events-none" />
              </div>
              {fieldErrors.targetRole && (
                <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-mono flex items-center gap-1">
                  <span>&bull;</span> {fieldErrors.targetRole}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono text-text-secondary uppercase tracking-wider mb-1.5">
                PASSWORD (MIN 6 CHARACTERS)
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#0D0F14] border rounded-lg text-sm text-slate-900 dark:text-white placeholder-text-muted focus:outline-none focus:ring-1 transition-all disabled:opacity-50 ${
                    fieldErrors.password 
                      ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/30' 
                      : 'border-slate-300 dark:border-white/10 focus:border-blue-500 focus:ring-blue-500/30'
                  }`}
                />
                <Lock size={15} className="absolute left-3 top-2.5 text-slate-400 dark:text-zinc-500 pointer-events-none" />
              </div>
              {fieldErrors.password ? (
                <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-mono flex items-center gap-1">
                  <span>&bull;</span> {fieldErrors.password}
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-text-muted font-mono">
                  At least 6 characters required.
                </p>
              )}
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              disabled={isLoading}
              className="w-full mt-3"
              icon={<ArrowRight size={15} />}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </GlassButton>
          </form>

          <div className="mt-6 text-center text-xs text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors">
              Sign In
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
