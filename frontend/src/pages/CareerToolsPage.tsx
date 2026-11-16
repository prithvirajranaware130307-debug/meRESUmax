import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { CoverLetterResult, LinkedInResult } from '../types';
import { 
  FileText, Linkedin, Sparkles, Copy, Check, Download, 
  Send, AlertCircle, Building2, Briefcase, Award, CheckCircle2, RotateCcw
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

  // Cover Letter Form State (Persisted across requests)
  const [candidateName, setCandidateName] = useState(user?.name || '');
  const [targetRole, setTargetRole] = useState(user?.target_role || 'Software Developer');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState(TONE_OPTIONS[0]);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [coverResult, setCoverResult] = useState<CoverLetterResult | null>(null);

  // LinkedIn Form State (Persisted across requests)
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
      setError(err.message || 'Failed to generate cover letter. Please retry.');
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
      setError(err.message || 'Failed to generate LinkedIn profile copy. Please retry.');
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
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cover_Letter_${(companyName || 'Application').replace(/\s+/g, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20 relative z-10 space-y-8">
      {/* Header */}
      <div className="max-w-xl">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-xs font-mono text-purple-700 dark:text-purple-300 mb-3 font-semibold">
          <Sparkles size={13} />
          <span>CAREER SYNTHESIZER</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
          AI Career Document Suite
        </h1>
        <p className="text-text-secondary text-sm mt-2 leading-relaxed">
          Craft high-converting, ATS-tailored cover letters and recruiter-magnet LinkedIn headlines in seconds using Gemini AI.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-300 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} className="shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={activeTab === 'cover-letter' ? handleGenerateCoverLetter : handleGenerateLinkedIn}
            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-700 dark:text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw size={13} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex justify-center">
        <div className="p-1 rounded-2xl bg-slate-100 dark:bg-surface-elevated/80 border border-slate-200 dark:border-white/10 flex items-center gap-1">
          <button
            type="button"
            onClick={() => { setActiveTab('cover-letter'); setError(''); }}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'cover-letter'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-text-secondary hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
            }`}
          >
            <FileText size={16} />
            <span>AI Cover Letter</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('linkedin'); setError(''); }}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'linkedin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-text-secondary hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
            }`}
          >
            <Linkedin size={16} />
            <span>LinkedIn Optimizer</span>
          </button>
        </div>
      </div>

      {/* TAB 1: COVER LETTER */}
      {activeTab === 'cover-letter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Input Form */}
          <div className="lg:col-span-5 space-y-4">
            <GlassCard className="p-6 space-y-4 border-slate-200 dark:border-white/10">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 size={18} className="text-purple-500 dark:text-purple-400" />
                <span>Job & Role Details</span>
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-text-secondary">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full bg-slate-50 dark:bg-surface-elevated/80 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-text-secondary">
                  Target Role Title
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full bg-slate-50 dark:bg-surface-elevated/80 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-text-secondary">
                  Target Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Stripe, Linear, or Netflix"
                  className="w-full bg-slate-50 dark:bg-surface-elevated/80 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-text-secondary">
                  Tone & Perspective
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-surface-elevated/80 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {TONE_OPTIONS.map(opt => (
                    <option key={opt} value={opt} className="bg-white dark:bg-surface-elevated text-slate-900 dark:text-white">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-text-secondary">
                  Job Description Highlights (Optional)
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste key responsibilities or requirements to match keywords..."
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-surface-elevated/80 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white text-xs placeholder-text-muted focus:outline-none focus:border-purple-500 resize-y"
                />
              </div>

              <GlassButton
                type="button"
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
            {isGeneratingCover ? (
              /* Compact Loading Skeleton */
              <GlassCard className="p-8 sm:p-12 text-center space-y-4 border-purple-500/30 flex flex-col items-center justify-center min-h-[380px]">
                <div className="w-12 h-12 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Generating your tailored cover letter…
                  </h3>
                  <p className="text-xs text-text-muted max-w-sm mx-auto">
                    Synthesizing achievement bullets with {companyName || 'target company'} role requirements and ATS keyword calibration.
                  </p>
                </div>
              </GlassCard>
            ) : coverResult ? (
              <GlassCard className="p-6 sm:p-8 space-y-6 border-purple-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      Generated ATS Letter
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {coverResult.subject_line}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(coverResult.cover_letter, 'cover')}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-text-secondary hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Copy Letter"
                    >
                      {copiedCover ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      <span className="hidden sm:inline">{copiedCover ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={downloadCoverLetter}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-text-secondary hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Download Markdown"
                    >
                      <Download size={14} />
                      <span className="hidden sm:inline">Download</span>
                    </button>
                  </div>
                </div>

                <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-800 dark:text-text-secondary leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-black/20 p-5 rounded-2xl border border-slate-200 dark:border-white/5 font-sans shadow-inner">
                  {coverResult.cover_letter}
                </div>

                {coverResult.key_highlights && coverResult.key_highlights.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                      Tailored Competency Hooks
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {coverResult.key_highlights.map((h, i) => (
                        <span key={i} className="text-xs px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 flex items-center gap-1">
                          <CheckCircle2 size={12} className="text-purple-500 dark:text-purple-400 shrink-0" />
                          <span>{h}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            ) : (
              /* Clear Informative Empty State */
              <GlassCard className="p-10 text-center space-y-4 border-dashed border-slate-300 dark:border-white/15 flex flex-col items-center justify-center min-h-[380px]">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 dark:text-purple-400">
                  <FileText size={28} />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Ready to Craft Your Tailored Cover Letter
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Provide your target role and company name on the left, then click <strong>"Generate Cover Letter"</strong> to produce an executive, ATS-calibrated letter.
                  </p>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LINKEDIN OPTIMIZER */}
      {activeTab === 'linkedin' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-4">
            <GlassCard className="p-6 space-y-4 border-slate-200 dark:border-white/10">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Linkedin size={18} className="text-blue-500 dark:text-blue-400" />
                <span>Profile Parameters</span>
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-text-secondary">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full bg-slate-50 dark:bg-surface-elevated/80 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-text-secondary">
                  Target Role / Professional Title
                </label>
                <input
                  type="text"
                  value={linkedinRole}
                  onChange={(e) => setLinkedinRole(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full bg-slate-50 dark:bg-surface-elevated/80 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-text-secondary">
                  Key Skills & Technologies (Comma-Separated)
                </label>
                <textarea
                  value={linkedinSkills}
                  onChange={(e) => setLinkedinSkills(e.target.value)}
                  placeholder="e.g. React, TypeScript, Python, Microservices, AWS"
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-surface-elevated/80 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500 resize-y"
                />
              </div>

              <GlassButton
                type="button"
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
            {isGeneratingLinkedIn ? (
              /* Compact Loading Skeleton */
              <GlassCard className="p-8 sm:p-12 text-center space-y-4 border-blue-500/30 flex flex-col items-center justify-center min-h-[380px]">
                <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Synthesizing your LinkedIn brand copy…
                  </h3>
                  <p className="text-xs text-text-muted max-w-sm mx-auto">
                    Formulating recruiter-optimized headlines and first-person storytelling bio with targeted technical keywords.
                  </p>
                </div>
              </GlassCard>
            ) : linkedinResult ? (
              <div className="space-y-6">
                {/* Headlines Card */}
                <GlassCard className="p-6 space-y-4 border-blue-500/30">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <Award size={15} />
                      <span>Top-Ranking LinkedIn Headlines</span>
                    </h3>
                    <span className="text-[10px] text-text-muted">Optimized for Recruiter Search</span>
                  </div>

                  <div className="space-y-3">
                    {linkedinResult.headlines.map((headline, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-3 group hover:border-blue-500/40 transition-colors"
                      >
                        <p className="text-xs sm:text-sm text-slate-900 dark:text-white font-medium">
                          {headline}
                        </p>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(headline, idx)}
                          className="shrink-0 p-2 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/15 text-text-secondary hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                          title="Copy Headline"
                        >
                          {copiedHeadlineIdx === idx ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* About Section Card */}
                <GlassCard className="p-6 space-y-4 border-slate-200 dark:border-white/10">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-cyan">
                      "About" Section Storytelling Copy
                    </h3>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(linkedinResult.about_section, 'about')}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-text-secondary hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedAbout ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      <span>{copiedAbout ? 'Copied' : 'Copy About'}</span>
                    </button>
                  </div>

                  <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-800 dark:text-text-secondary leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-black/20 p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-inner">
                    {linkedinResult.about_section}
                  </div>

                  {linkedinResult.core_competencies && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
                        Primary Search Competencies
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {linkedinResult.core_competencies.map((comp, i) => (
                          <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300">
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </GlassCard>
              </div>
            ) : (
              /* Clear Informative Empty State */
              <GlassCard className="p-10 text-center space-y-4 border-dashed border-slate-300 dark:border-white/15 flex flex-col items-center justify-center min-h-[380px]">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400">
                  <Linkedin size={28} />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Ready to Optimize Your LinkedIn Brand
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Enter your professional title and core technical skills on the left, then click <strong>"Generate LinkedIn Brand Copy"</strong> to produce top-ranking headlines and about bio.
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
