import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { 
  User, Mail, GraduationCap, Briefcase, MapPin, 
  CheckCircle2, Sparkles, Calendar, BookOpen, AlertCircle
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [education, setEducation] = useState('');
  const [degree, setDegree] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [targetRole, setTargetRole] = useState('Software Developer');
  const [preferredLocation, setPreferredLocation] = useState('Remote / Hybrid');
  const [careerInterests, setCareerInterests] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEducation(user.education || '');
      setDegree(user.degree || '');
      setGraduationYear(user.graduation_year || '');
      setTargetRole(user.target_role || 'Software Developer');
      setPreferredLocation(user.preferred_location || 'Remote / Hybrid');
      setCareerInterests(user.career_interests || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setSavedSuccess(false);
    setError(null);

    try {
      await api.updateProfile({
        name: name.trim(),
        education: education.trim(),
        degree: degree.trim(),
        graduation_year: graduationYear.trim(),
        target_role: targetRole.trim(),
        preferred_location: preferredLocation.trim(),
        career_interests: careerInterests.trim(),
      });
      await refreshUser();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Failed to update profile changes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20 relative z-10">
      <div className="text-center max-w-md mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass text-xs font-semibold uppercase tracking-wider text-brand-blue mb-2">
          <User size={13} />
          <span>Candidate Information</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Your Career Profile</h1>
        <p className="text-xs text-text-secondary mt-1">
          Customize your target preferences to calibrate resume audits and job match scoring.
        </p>
      </div>

      <GlassCard variant="elevated" className="p-6 sm:p-8 border border-slate-200 dark:border-white/20 shadow-glass-lg">
        {savedSuccess && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-mono">
            <CheckCircle2 size={16} />
            <span className="font-sans">Profile details updated successfully!</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2 font-mono">
            <AlertCircle size={16} className="text-rose-400 shrink-0" />
            <span className="font-sans">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  disabled={isLoading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
                <User size={14} className="absolute left-3 top-2.5 text-text-muted" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Registered Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl text-xs sm:text-sm text-slate-500 dark:text-text-muted cursor-not-allowed"
                />
                <Mail size={14} className="absolute left-3 top-2.5 text-text-muted" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Target Role
              </label>
              <div className="relative">
                <select
                  value={targetRole}
                  disabled={isLoading}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="Software Developer" className="bg-white text-slate-900 dark:bg-[#0B1020] dark:text-white">Software Developer</option>
                  <option value="Frontend Developer" className="bg-white text-slate-900 dark:bg-[#0B1020] dark:text-white">Frontend Developer</option>
                  <option value="Backend Developer" className="bg-white text-slate-900 dark:bg-[#0B1020] dark:text-white">Backend Developer</option>
                  <option value="Python Developer" className="bg-white text-slate-900 dark:bg-[#0B1020] dark:text-white">Python Developer</option>
                  <option value="AI/ML Engineer" className="bg-white text-slate-900 dark:bg-[#0B1020] dark:text-white">AI/ML Engineer</option>
                  <option value="Data Analyst" className="bg-white text-slate-900 dark:bg-[#0B1020] dark:text-white">Data Analyst</option>
                  <option value="Data Scientist" className="bg-white text-slate-900 dark:bg-[#0B1020] dark:text-white">Data Scientist</option>
                  <option value="Cybersecurity Analyst" className="bg-white text-slate-900 dark:bg-[#0B1020] dark:text-white">Cybersecurity Analyst</option>
                  <option value="Cloud Engineer" className="bg-white text-slate-900 dark:bg-[#0B1020] dark:text-white">Cloud Engineer</option>
                  <option value="UI/UX Designer" className="bg-white text-slate-900 dark:bg-[#0B1020] dark:text-white">UI/UX Designer</option>
                </select>
                <Briefcase size={14} className="absolute left-3 top-2.5 text-text-muted pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Work Mode Preference
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled={isLoading}
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                  placeholder="e.g. Remote, Hybrid, Bangalore, San Francisco"
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
                <MapPin size={14} className="absolute left-3 top-2.5 text-text-muted" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                University / Institution
              </label>
              <input
                type="text"
                disabled={isLoading}
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="e.g. Stanford University"
                className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Degree / Major
              </label>
              <input
                type="text"
                disabled={isLoading}
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g. B.S. Computer Science"
                className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Graduation Year
              </label>
              <input
                type="text"
                disabled={isLoading}
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                placeholder="e.g. 2025"
                className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Career Aspirations & Tech Passions
            </label>
            <textarea
              disabled={isLoading}
              value={careerInterests}
              onChange={(e) => setCareerInterests(e.target.value)}
              placeholder="e.g. Interested in LLM agent systems, distributed backend architectures, and high-frequency data pipelines..."
              rows={3}
              className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>

          <div className="pt-2">
            <GlassButton type="submit" variant="primary" size="md" isLoading={isLoading} disabled={isLoading} className="w-full">
              Save Profile Changes
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};
