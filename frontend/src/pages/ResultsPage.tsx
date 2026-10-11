import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Analysis } from '../types';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { ScoreDial } from '../components/glass/ScoreDial';
import { 
  Sparkles, Download, ArrowLeft, CheckCircle2, AlertTriangle, 
  Copy, Check, FileText, Briefcase, HelpCircle, Compass, 
  TrendingUp, ArrowRight, Tag, ListOrdered, ShieldAlert
} from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
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

  // Standardize high priority fixes
  const highPriorityFixes = ai.high_priority_fixes && ai.high_priority_fixes.length > 0
    ? ai.high_priority_fixes
    : (analysis.weaknesses && analysis.weaknesses.length > 0
        ? analysis.weaknesses.map((w, i) => ({
            issue: w,
            action: analysis.improvements?.[i] || "Update your resume section to address this gap.",
            priority: i === 0 ? "High" : "Medium"
          }))
        : [
            {
              issue: "Unquantified project outcomes",
              action: "Add measurable numbers, data volume, and percentages to project bullet points.",
              priority: "High"
            }
          ]
      );

  // Standardize bullet transformations
  const bulletExamples = ai.better_bullet_examples && ai.better_bullet_examples.length > 0
    ? ai.better_bullet_examples
    : (ai.project_bullet_improvements && ai.project_bullet_improvements.length > 0
        ? ai.project_bullet_improvements.map((p) => ({
            weak: p.original_theme,
            better: p.suggested_rewrite,
            rationale: p.rationale
          }))
        : [
            {
              weak: "Worked on a website.",
              better: "Built a responsive React dashboard that reduced manual reporting time by 35% for 20 internal users.",
              rationale: "Specifies component architecture, identifies the active user base, and quantifies workflow efficiency gain."
            },
            {
              weak: "Know Python and SQL.",
              better: "Used Python, Pandas, and SQL to clean and analyze 50,000+ records, improving reporting accuracy.",
              rationale: "Replaces static keyword declarations with verified volume metrics and real business intelligence outcomes."
            },
            {
              weak: "Made a college project.",
              better: "Developed a Flask-based expense tracker with user authentication and PostgreSQL persistence; deployed it for live testing.",
              rationale: "Highlights backend security ownership, relational schema design, and production deployment."
            }
          ]
      );

  const atsKeywords = ai.ats_keywords && ai.ats_keywords.length > 0
    ? ai.ats_keywords
    : [
        `${analysis.target_role} Architecture`,
        "RESTful API Integration",
        "Relational & Distributed Databases",
        "CI/CD & Cloud Deployment",
        "Automated Unit & Integration Testing"
      ];

  const nextSteps = ai.next_steps && ai.next_steps.length > 0
    ? ai.next_steps
    : [
        `Revise the top summary with the role-calibrated rewrite for ${analysis.target_role}.`,
        "Replace passive bullet points with the quantified STAR examples provided below.",
        "Add an end-to-end capstone project covering your top missing skills."
      ];

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
            <span>Engine: {ai.provider === 'google_gemini' ? `Google Gemini (${ai.model || '2.5-flash'})` : (ai.provider === 'openai' ? 'OpenAI GPT-4o' : 'Deterministic Heuristic Engine')}</span>
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

      {/* 1. High Priority Fixes Section */}
      <GlassCard variant="standard" className="p-6 mb-8 border border-amber-500/20">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert size={18} className="text-amber-400" />
          <h2 className="text-base font-bold text-white">High Priority Fixes</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {highPriorityFixes.map((fix, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    {fix.priority || 'High'} Priority
                  </span>
                  <span className="text-xs text-text-muted font-mono">#{idx + 1}</span>
                </div>
                <div className="text-xs font-semibold text-rose-300 mb-2">
                  {fix.issue}
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {fix.action}
                </p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* 2. Better Bullet Examples Section */}
      <GlassCard variant="standard" className="p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-brand-cyan" />
            <h2 className="text-base font-bold text-white">Better Bullet Examples (Realistic Transformations)</h2>
          </div>
          <span className="text-xs text-text-muted hidden sm:inline">Weak vs. Quantified STAR Transformations</span>
        </div>
        <div className="space-y-4">
          {bulletExamples.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Weak */}
                <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20">
                  <div className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Weak / Passive Phrasing</span>
                  </div>
                  <div className="text-xs sm:text-sm text-rose-200/90 italic">
                    "{item.weak}"
                  </div>
                </div>

                {/* Better */}
                <div className="p-3 rounded-lg bg-mint-500/10 border border-mint-500/30 relative">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[11px] font-semibold text-brand-mint uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-brand-mint" />
                      <span>Better (Quantified STAR Bullet)</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(item.better, `bullet-${idx}`)}
                      className="text-xs text-text-secondary hover:text-white flex items-center gap-1 transition-colors"
                      title="Copy improved bullet"
                    >
                      {copiedKey === `bullet-${idx}` ? <Check size={13} className="text-brand-mint" /> : <Copy size={13} />}
                      <span className="text-[10px]">{copiedKey === `bullet-${idx}` ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="text-xs sm:text-sm text-white font-medium pr-10">
                    "{item.better}"
                  </div>
                </div>
              </div>

              {/* Rationale */}
              <div className="text-[11px] text-brand-cyan/90 pl-1">
                <span className="font-semibold text-text-secondary">Rationale:</span> {item.rationale}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* 3. Skills: Matched vs Missing */}
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
            <span>Missing Skills ({analysis.missing_skills.length})</span>
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

      {/* 4. ATS Keywords & Next Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* ATS-Friendly Keywords */}
        <GlassCard variant="standard" className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={16} className="text-brand-blue" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">ATS-Friendly Keywords (No Stuffing)</h2>
          </div>
          <p className="text-xs text-text-secondary mb-3">
            Incorporate these contextual phrases naturally into your experience bullet points to match automated applicant tracking filters:
          </p>
          <div className="space-y-2">
            {atsKeywords.map((kw, i) => (
              <div key={i} className="text-xs p-2 rounded-lg bg-white/[0.03] border border-white/5 text-brand-cyan flex items-center justify-between">
                <span>{kw}</span>
                <button
                  onClick={() => copyToClipboard(kw, `kw-${i}`)}
                  className="text-text-muted hover:text-white p-1"
                  title="Copy keyword phrase"
                >
                  {copiedKey === `kw-${i}` ? <Check size={13} className="text-brand-mint" /> : <Copy size={13} />}
                </button>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Next Steps */}
        <GlassCard variant="standard" className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <ListOrdered size={16} className="text-brand-mint" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recommended Next Steps</h2>
          </div>
          <div className="space-y-3">
            {nextSteps.map((step, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-text-secondary flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-brand-mint/20 text-brand-mint font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Summary Rewrite */}
      {ai.summary_rewrite && (
        <GlassCard variant="standard" className="p-6 mb-8 border border-brand-blue/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-cyan">
              <Sparkles size={14} />
              <span>Recommended Summary Rewrite</span>
            </div>
            <button
              onClick={() => copyToClipboard(ai.summary_rewrite || '', 'summary')}
              className="text-xs text-text-secondary hover:text-white flex items-center gap-1.5 transition-colors"
            >
              {copiedKey === 'summary' ? <Check size={14} className="text-brand-mint" /> : <Copy size={14} />}
              <span>{copiedKey === 'summary' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-sm text-white italic bg-black/30 p-4 rounded-xl border border-white/10 leading-relaxed">
            "{ai.summary_rewrite}"
          </p>
        </GlassCard>
      )}

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
