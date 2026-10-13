import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { CoverLetterResult, LinkedInResult } from '../types';
import { 
  FileText, Linkedin, Sparkles, Copy, Check, Download, 
  Send, AlertCircle, Building2, Briefcase, Award, CheckCircle2
} from 'lucide-react';

const TONE_OPTIONS = [
  'Professional & Polished',
  'Confident & Impact-Driven',
  'Technical Leader',
  'Startup / High-Energy'
];

export const CareerToolsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'cover-letter' | 'linkedin'>('cover-letter');

  // Cover Letter Form State
  const [candidateName, setCandidateName] = useState(user?.name || '');
  const [targetRole, setTargetRole] = useState(user?.target_role || 'Software Developer');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState(TONE_OPTIONS[0]);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [coverResult, setCoverResult] = useState<CoverLetterResult | null>(null);

  // LinkedIn Form State
  const [linkedinRole, setLinkedinRole] = useState(user?.target_role || 'Software Developer');
  const [linkedinSkills, setLinkedinSkills] = useState('React, TypeScript, Python, Cloud Architecture');
  const [isGeneratingLinkedIn, setIsGeneratingLinkedIn] = useState(false);
  const [linkedinResult, setLinkedinResult] = useState<LinkedInResult | null>(null);

  // Copy states
  const [copiedCover, setCopiedCover] = useState(false);
  const [copiedHeadlineIdx, setCopiedHeadlineIdx] = useState<number | null>(null);
  const [copiedAbout, setCopiedAbout] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateCoverLetter = async () => {
    setIsGeneratingCover(true);
    setError('');
    try {
      const skillsArray = linkedinSkills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await api.generateCoverLetter({
        candidate_name: candidateName,
        target_role: targetRole,
        company_name: companyName,
        job_description: jobDescription,
        skills: skillsArray,
        tone: tone
      });
      setCoverResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to generate cover letter.');
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const handleGenerateLinkedIn = async () => {
    setIsGeneratingLinkedIn(true);
    setError('');
    try {
      const skillsArray = linkedinSkills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await api.generateLinkedIn({
        candidate_name: candidateName,
        target_role: linkedinRole,
        skills: skillsArray
      });
      setLinkedinResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to generate LinkedIn profile copy.');
    } finally {
      setIsGeneratingLinkedIn(false);
    }
  };

  const copyToClipboard = (text: string, type: 'cover' | 'about' | number) => {
    navigator.clipboard.writeText(text);
    if (type === 'cover') {
      setCopiedCover(true);
      setTimeout(() => setCopiedCover(false), 2000);
    } else if (type === 'about') {
      setCopiedAbout(true);
      setTimeout(() => setCopiedAbout(false), 2000);
    } else {
      setCopiedHeadlineIdx(type);
      setTimeout(() => setCopiedHeadlineIdx(null), 2000);
    }
  };

  const downloadCoverLetter = () => {
    if (!coverResult) return;
    const blob = new Blob([coverResult.cover_letter], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cover_Letter_${(companyName || 'Application').replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium">
          <Sparkles size={14} />
          <span>AI Application Accelerators</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
          Cover Letter & <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-brand-cyan bg-clip-text text-transparent">LinkedIn Optimizer</span>
        </h1>
        <p className="text-text-secondary text-sm sm:text-base max-w-2xl mx-auto">
          Craft high-converting, ATS-tailored cover letters and recruiter-magnet LinkedIn headlines in seconds using Gemini AI.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex justify-center">
        <div className="p-1 rounded-2xl bg-surface-elevated/80 border border-white/10 flex items-center gap-1">
          <button
            onClick={() => setActiveTab('cover-letter')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'cover-letter'
                ? 'bg-purple-600 text-white shadow-glow-sm'
                : 'text-text-secondary hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText size={16} />
            <span>AI Cover Letter</span>
          </button>
          <button
            onClick={() => setActiveTab('linkedin')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'linkedin'
                ? 'bg-blue-600 text-white shadow-glow-sm'
                : 'text-text-secondary hover:text-white hover:bg-white/5'
            }`}
          >
            <Linkedin size={16} />
            <span>LinkedIn Optimizer</span>
          </button>
        </div>
      </div>

      {/* TAB 1: COVER LETTER */}
      {activeTab === 'cover-letter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-5 space-y-4">
            <GlassCard className="p-6 space-y-4 border-white/10">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 size={18} className="text-purple-400" />
                <span>Job & Role Details</span>
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Your Name
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full bg-surface-elevated/80 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-400/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Target Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full bg-surface-elevated/80 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-400/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Target Company
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Stripe, Linear, or Netflix"
                  className="w-full bg-surface-elevated/80 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-400/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Tone & Perspective
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-surface-elevated/80 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-400/50"
                >
                  {TONE_OPTIONS.map(opt => (
                    <option key={opt} value={opt} className="bg-surface-elevated text-white">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Job Description Highlights (Optional)
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste snippet of key requirements or responsibilities to tailor keywords..."
                  rows={4}
                  className="w-full bg-surface-elevated/80 border border-white/10 rounded-xl p-3 text-white text-xs placeholder-text-muted/60 focus:outline-none focus:border-purple-400/50 resize-y"
                />
              </div>

              <GlassButton
                onClick={handleGenerateCoverLetter}
                disabled={isGeneratingCover}
                className="w-full justify-center py-2.5 text-xs sm:text-sm font-semibold"
              >
                {isGeneratingCover ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="animate-spin" size={16} />
                    Synthesizing Letter...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send size={15} />
                    Generate Cover Letter
                  </span>
                )}
              </GlassButton>
            </GlassCard>
          </div>

          {/* Result Card */}
          <div className="lg:col-span-7">
            {coverResult ? (
              <GlassCard className="p-6 sm:p-8 space-y-6 border-purple-500/30 bg-surface-elevated/80">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                      Generated ATS Letter
                    </span>
                    <h3 className="text-sm font-semibold text-white">
                      {coverResult.subject_line}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(coverResult.cover_letter, 'cover')}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors"
                      title="Copy Letter"
                    >
                      {copiedCover ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span className="hidden sm:inline">{copiedCover ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={downloadCoverLetter}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors"
                      title="Download Markdown"
                    >
                      <Download size={14} />
                      <span className="hidden sm:inline">Download</span>
                    </button>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line bg-black/20 p-5 rounded-2xl border border-white/5 font-sans">
                  {coverResult.cover_letter}
                </div>

                {coverResult.key_highlights && coverResult.key_highlights.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                      Tailored Competency Hooks
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {coverResult.key_highlights.map((h, i) => (
                        <span key={i} className="text-xs px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center gap-1">
                          <CheckCircle2 size={12} className="text-purple-400 shrink-0" />
                          <span>{h}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            ) : (
              <GlassCard className="p-12 text-center space-y-4 border-dashed border-white/10 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <FileText size={28} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">No Cover Letter Generated Yet</h3>
                  <p className="text-xs text-text-muted max-w-sm mx-auto">
                    Fill in your target role and company details on the left, then click "Generate Cover Letter" to produce an executive-ready letter.
                  </p>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LINKEDIN OPTIMIZER */}
      {activeTab === 'linkedin' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-4">
            <GlassCard className="p-6 space-y-4 border-white/10">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Linkedin size={18} className="text-blue-400" />
                <span>Profile Parameters</span>
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full bg-surface-elevated/80 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-400/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Target Role / Professional Title
                </label>
                <input
                  type="text"
                  value={linkedinRole}
                  onChange={(e) => setLinkedinRole(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full bg-surface-elevated/80 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-400/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Key Skills & Technologies (Comma-Separated)
                </label>
                <textarea
                  value={linkedinSkills}
                  onChange={(e) => setLinkedinSkills(e.target.value)}
                  placeholder="e.g. React, TypeScript, Python, Microservices, AWS"
                  rows={3}
                  className="w-full bg-surface-elevated/80 border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-blue-400/50"
                />
              </div>

              <GlassButton
                onClick={handleGenerateLinkedIn}
                disabled={isGeneratingLinkedIn}
                className="w-full justify-center py-2.5 text-xs sm:text-sm font-semibold"
              >
                {isGeneratingLinkedIn ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="animate-spin" size={16} />
                    Synthesizing Profile...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles size={15} />
                    Generate LinkedIn Brand Copy
                  </span>
                )}
              </GlassButton>
            </GlassCard>
          </div>

          {/* Output */}
          <div className="lg:col-span-7">
            {linkedinResult ? (
              <div className="space-y-6">
                {/* Headlines Card */}
                <GlassCard className="p-6 space-y-4 border-blue-500/30 bg-surface-elevated/80">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                      <Award size={15} />
                      <span>Top-Ranking LinkedIn Headlines</span>
                    </h3>
                    <span className="text-[10px] text-text-muted">Optimized for Recruiter Search</span>
                  </div>

                  <div className="space-y-3">
                    {linkedinResult.headlines.map((headline, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 group hover:border-blue-500/40 transition-colors"
                      >
                        <p className="text-xs sm:text-sm text-white font-medium">
                          {headline}
                        </p>
                        <button
                          onClick={() => copyToClipboard(headline, idx)}
                          className="shrink-0 p-2 rounded-lg bg-white/5 hover:bg-white/15 text-text-secondary hover:text-white transition-colors"
                          title="Copy Headline"
                        >
                          {copiedHeadlineIdx === idx ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* About Section Card */}
                <GlassCard className="p-6 space-y-4 border-white/10 bg-surface-elevated/80">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-cyan">
                      "About" Section Storytelling Copy
                    </h3>
                    <button
                      onClick={() => copyToClipboard(linkedinResult.about_section, 'about')}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      {copiedAbout ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copiedAbout ? 'Copied' : 'Copy About'}</span>
                    </button>
                  </div>

                  <div className="prose prose-invert max-w-none text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line bg-black/20 p-5 rounded-2xl border border-white/5">
                    {linkedinResult.about_section}
                  </div>

                  {linkedinResult.core_competencies && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
                        Primary Search Competencies
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {linkedinResult.core_competencies.map((comp, i) => (
                          <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300">
                            #{comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </GlassCard>
              </div>
            ) : (
              <GlassCard className="p-12 text-center space-y-4 border-dashed border-white/10 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Linkedin size={28} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">No LinkedIn Copy Generated Yet</h3>
                  <p className="text-xs text-text-muted max-w-sm mx-auto">
                    Specify your target role and core skills on the left to generate 3 high-impact headlines and an engaging story bio.
                  </p>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
