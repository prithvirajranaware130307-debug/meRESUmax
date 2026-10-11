import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Analysis } from '../types';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { ScoreDial } from '../components/glass/ScoreDial';
import { 
  Sparkles, Download, ArrowLeft, CheckCircle2, AlertTriangle, 
  Copy, Check, FileText, Briefcase, HelpCircle, Compass, Share2
} from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadAnalysis() {
      if (!analysisId) return;
      try {
        const res = await api.getAnalysis(parseInt(analysisId));
        setAnalysis(res.analysis);
      } catch (err: any) {
        setError(err.message || 'Failed to load analysis results.');
      } finally {
        setIsLoading(false);
      }
    }
    loadAnalysis();
  }, [analysisId]);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-36 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full border-2 border-brand-cyan/20 border-t-brand-cyan animate-spin mb-4" />
        <div className="text-sm font-semibold text-white">Loading Career Intelligence Audit...</div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-md mx-auto pt-36 px-4 text-center">
        <GlassCard variant="elevated" className="p-8">
          <div className="text-rose-400 mb-2 font-bold">Audit Not Found</div>
          <p className="text-xs text-text-secondary mb-5">{error || 'This analysis could not be located.'}</p>
          <Link to="/analyze">
            <GlassButton variant="primary">Analyze a Resume</GlassButton>
          </Link>
        </GlassCard>
      </div>
    );
  }

  const ai = analysis.ai_feedback || {};

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-20 relative z-10">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-white mb-2 transition-colors">
            <ArrowLeft size={14} /> Back to Command Center
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Audit Results: {analysis.target_role}
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Document: <span className="text-white font-medium">{analysis.resume_filename}</span> • {analysis.created_at?.slice(0, 10)}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <a 
            href={api.getReportDownloadUrl(analysis.id)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <GlassButton variant="primary" size="md" className="w-full sm:w-auto" icon={<Download size={16} />}>
              Download PDF Report
            </GlassButton>
          </a>
          <Link to="/analyze" className="w-full sm:w-auto">
            <GlassButton variant="secondary" size="md" className="w-full sm:w-auto">
              Analyze Another
            </GlassButton>
          </Link>
        </div>
      </div>

      {/* Primary Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Quality Score */}
        <GlassCard variant="elevated" className="p-6 flex flex-col items-center justify-center text-center">
          <ScoreDial 
            score={Math.round(analysis.quality_score)} 
            label="Quality Score" 
            sublabel="Overall Resume Strength" 
            colorScheme="dynamic" 
            size={140} 
          />
          <div className="mt-4 text-xs font-semibold text-brand-mint">
            {analysis.quality_score >= 80 ? 'Competitive for Tier-1 Opportunities' : 'Solid Base with Growth Potential'}
          </div>
        </GlassCard>

        {/* Job Match Score */}
        <GlassCard variant="elevated" className="p-6 flex flex-col items-center justify-center text-center">
          <ScoreDial 
            score={Math.round(analysis.job_match_score)} 
            label="Role Match Fit" 
            sublabel={analysis.target_role} 
            colorScheme="cyan" 
            size={140} 
          />
          <div className="mt-4 text-xs font-semibold text-brand-cyan">
            {analysis.matched_skills.length} Archetype Skills Verified
          </div>
        </GlassCard>

        {/* Executive AI Summary */}
        <GlassCard variant="elevated" className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-blue mb-2">
              <Sparkles size={14} />
              <span>Executive Synthesis</span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {ai.executive_summary || 'Your resume demonstrates foundational technical abilities. Prioritize closing skill gaps to maximize candidate visibility.'}
            </p>
          </div>
          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-text-muted">
            <span>Engine: {ai.provider === 'openai' ? 'OpenAI GPT-4o' : 'Deterministic Heuristic Engine'}</span>
            <span className="text-brand-mint font-medium">Explainable Audit</span>
          </div>
        </GlassCard>
      </div>

      {/* Category Breakdown Bars */}
      <GlassCard variant="standard" className="p-6 mb-8">
        <h2 className="text-base font-bold text-white mb-4">Heuristic Category Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(analysis.category_scores || {}).map(([key, item]) => (
            <div key={key} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-white">
                <span className="truncate">{item.title}</span>
                <span className="text-brand-cyan shrink-0">{item.score}/{item.max}</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-brand-blue to-brand-cyan rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <div className="text-[11px] text-text-muted">{item.percentage}% rating</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Skills: Matched vs Missing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Matched Skills */}
        <GlassCard variant="standard" className="p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-mint mb-3">
            <CheckCircle2 size={16} />
            <span>Verified Matched Skills ({analysis.matched_skills.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.matched_skills.length > 0 ? (
              analysis.matched_skills.map((sk) => (
                <span key={sk} className="text-xs px-2.5 py-1 rounded-lg bg-mint-500/10 border border-mint-500/20 text-brand-mint font-medium">
                  {sk}
                </span>
              ))
            ) : (
              <span className="text-xs text-text-muted">No archetype skills matched directly.</span>
            )}
          </div>
        </GlassCard>

        {/* Missing Skills */}
        <GlassCard variant="standard" className="p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-amber mb-3">
            <AlertTriangle size={16} />
            <span>Missing / Target Tech Stack ({analysis.missing_skills.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.missing_skills.length > 0 ? (
              analysis.missing_skills.map((sk) => (
                <span key={sk} className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-brand-amber font-medium">
                  {sk}
                </span>
              ))
            ) : (
              <span className="text-xs text-text-muted">No high-priority missing skills detected.</span>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Actionable Rewrites: Summary & Project Bullets */}
      <div className="space-y-6 mb-8">
        {/* Recommended Professional Summary Rewrite */}
        {ai.summary_rewrite && (
          <GlassCard variant="standard" className="p-6 border border-brand-blue/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-cyan">
                <Sparkles size={14} />
                <span>Recommended Summary Rewrite</span>
              </div>
              <button
                onClick={() => copyToClipboard(ai.summary_rewrite || '', 99)}
                className="text-xs text-text-secondary hover:text-white flex items-center gap-1.5 transition-colors"
              >
                {copiedIndex === 99 ? <Check size={14} className="text-brand-mint" /> : <Copy size={14} />}
                <span>{copiedIndex === 99 ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-sm text-white italic bg-black/30 p-4 rounded-xl border border-white/10 leading-relaxed">
              "{ai.summary_rewrite}"
            </p>
          </GlassCard>
        )}

        {/* Project Bullet Improvements */}
        {ai.project_bullet_improvements && ai.project_bullet_improvements.length > 0 && (
          <GlassCard variant="standard" className="p-6">
            <h2 className="text-base font-bold text-white mb-4">STAR Project Bullet Enhancements</h2>
            <div className="space-y-4">
              {ai.project_bullet_improvements.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                  <div className="text-xs text-text-muted">
                    <span className="font-semibold text-text-secondary">Original Focus:</span> {item.original_theme}
                  </div>
                  <div className="text-sm text-brand-cyan font-medium bg-black/40 p-3 rounded-lg border border-white/10 flex items-start justify-between gap-3">
                    <span>{item.suggested_rewrite}</span>
                    <button
                      onClick={() => copyToClipboard(item.suggested_rewrite, idx)}
                      className="text-text-muted hover:text-white shrink-0 p-1"
                      title="Copy rewrite"
                    >
                      {copiedIndex === idx ? <Check size={14} className="text-brand-mint" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div className="text-[11px] text-brand-mint">
                    <span className="font-semibold">Why this works:</span> {item.rationale}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>

      {/* Technical Interview Preparation Tips */}
      {ai.interview_prep_tips && ai.interview_prep_tips.length > 0 && (
        <GlassCard variant="standard" className="p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle size={18} className="text-brand-violet" />
            <h2 className="text-base font-bold text-white">Role-Specific Interview Prep Questions</h2>
          </div>
          <div className="space-y-3">
            {ai.interview_prep_tips.map((tip, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs sm:text-sm text-text-secondary flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-brand-violet/20 text-brand-violet flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Bottom Nav Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <Link to="/roadmap">
          <GlassButton variant="primary" icon={<Compass size={16} />}>
            View Career Action Roadmap
          </GlassButton>
        </Link>
        <Link to="/jobs">
          <GlassButton variant="secondary" icon={<Briefcase size={16} />}>
            Find Matching Job Openings
          </GlassButton>
        </Link>
      </div>
    </div>
  );
};
