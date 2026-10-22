import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { Logo } from '../components/glass/Logo';
import { Lock, Mail, User, Briefcase, AlertCircle, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetRole, setTargetRole] = useState('Software Developer');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register({ name, email, password, target_role: targetRole });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
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
            <h1 className="text-xl font-bold text-white tracking-tight">Create your account</h1>
            <p className="text-text-secondary text-xs mt-1">Accelerate your career trajectory with meRESUmax</p>
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
                FULL NAME
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Chen"
                  className="w-full pl-9 pr-4 py-2 bg-[#0D0F14] border border-white/10 rounded-lg text-sm text-white placeholder-text-muted focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
                <User size={15} className="absolute left-3 top-2.5 text-zinc-500" />
              </div>
            </div>

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
                TARGET CAREER ROLE
              </label>
              <div className="relative">
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#0D0F14] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all appearance-none cursor-pointer"
                >
                  <option value="Software Developer" className="bg-[#111318]">Software Developer</option>
                  <option value="Frontend Developer" className="bg-[#111318]">Frontend Developer</option>
                  <option value="Backend Developer" className="bg-[#111318]">Backend Developer</option>
                  <option value="Python Developer" className="bg-[#111318]">Python Developer</option>
                  <option value="AI/ML Engineer" className="bg-[#111318]">AI/ML Engineer</option>
                  <option value="Data Analyst" className="bg-[#111318]">Data Analyst</option>
                  <option value="Data Scientist" className="bg-[#111318]">Data Scientist</option>
                  <option value="Cybersecurity Analyst" className="bg-[#111318]">Cybersecurity Analyst</option>
                  <option value="Cloud Engineer" className="bg-[#111318]">Cloud Engineer</option>
                  <option value="UI/UX Designer" className="bg-[#111318]">UI/UX Designer</option>
                </select>
                <Briefcase size={15} className="absolute left-3 top-2.5 text-zinc-500 pointer-events-none" />
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
              className="w-full mt-3"
              icon={<ArrowRight size={15} />}
            >
              Create Account
            </GlassButton>
          </form>

          <div className="mt-6 text-center text-xs text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-white hover:text-blue-400 font-medium transition-colors">
              Sign In
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
