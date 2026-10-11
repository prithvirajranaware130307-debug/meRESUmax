import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { 
  User, Mail, GraduationCap, Briefcase, MapPin, 
  CheckCircle2, Sparkles, Calendar, BookOpen
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
    setIsLoading(true);
    setSavedSuccess(false);

    try {
      await api.updateProfile({
        name,
        education,
        degree,
        graduation_year: graduationYear,
        target_role: targetRole,
        preferred_location: preferredLocation,
        career_interests: careerInterests,
      });
      await refreshUser();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
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
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Career Profile</h1>
        <p className="text-xs text-text-secondary mt-1">
          Customize your target preferences to calibrate resume audits and job match scoring.
        </p>
      </div>

      <GlassCard variant="elevated" className="p-6 sm:p-8 border border-white/20 shadow-glass-lg">
        {savedSuccess && (
          <div className="mb-6 p-3 rounded-xl bg-mint-500/10 border border-mint-500/30 text-brand-mint text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Profile details updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full p-2.5 bg-black/20 border border-white/5 rounded-xl text-xs sm:text-sm text-text-muted cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Primary Target Role
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-brand-blue cursor-pointer"
              >
                <option value="Software Developer" className="bg-[#0B1020]">Software Developer</option>
                <option value="Frontend Developer" className="bg-[#0B1020]">Frontend Developer</option>
                <option value="Backend Developer" className="bg-[#0B1020]">Backend Developer</option>
                <option value="Python Developer" className="bg-[#0B1020]">Python Developer</option>
                <option value="AI/ML Engineer" className="bg-[#0B1020]">AI/ML Engineer</option>
                <option value="Data Analyst" className="bg-[#0B1020]">Data Analyst</option>
                <option value="Data Scientist" className="bg-[#0B1020]">Data Scientist</option>
                <option value="Cloud Engineer" className="bg-[#0B1020]">Cloud Engineer</option>
                <option value="Cybersecurity Analyst" className="bg-[#0B1020]">Cybersecurity Analyst</option>
                <option value="UI/UX Designer" className="bg-[#0B1020]">UI/UX Designer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Preferred Work Arrangement
              </label>
              <input
                type="text"
                value={preferredLocation}
                onChange={(e) => setPreferredLocation(e.target.value)}
                placeholder="e.g. Remote, Bangalore, London"
                className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-brand-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                College / University
              </label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="e.g. Stanford University"
                className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Degree & Major
              </label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g. B.Tech Computer Science"
                className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Graduation Year
              </label>
              <input
                type="text"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                placeholder="e.g. 2025"
                className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-brand-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Career Aspirations & Tech Passions
            </label>
            <textarea
              value={careerInterests}
              onChange={(e) => setCareerInterests(e.target.value)}
              placeholder="e.g. Interested in LLM agent systems, distributed backend architectures, and high-frequency data pipelines..."
              rows={3}
              className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-brand-blue"
            />
          </div>

          <div className="pt-2">
            <GlassButton type="submit" variant="primary" size="md" isLoading={isLoading} className="w-full">
              Save Profile Changes
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};
