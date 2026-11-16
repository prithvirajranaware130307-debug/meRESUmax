import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Analysis } from '../types';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { 
  History, Download, Trash2, Eye, Calendar, 
  FileText, ArrowRight, Sparkles, AlertCircle, RotateCcw
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalyses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getAnalyses();
      setAnalyses(res.analyses || []);
    } catch (err: any) {
      console.error('Failed to load history:', err);
      setError(err.message || 'Unable to load analysis history. Please check your connection and retry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyses();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this analysis audit?')) {
      setAnalyses(analyses.filter((a) => a.id !== id));
      try {
        await api.deleteAnalysis(id);
      } catch (err: any) {
        console.error('Delete analysis failed:', err);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20 relative z-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass text-xs font-semibold uppercase tracking-wider text-brand-amber mb-2">
            <History size={13} />
            <span>Audit Archive</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Analysis History</h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Review past resume evaluations, track score improvements over time, and retrieve executive PDF reports.
          </p>
        </div>

        <Link to="/analyze">
          <GlassButton variant="primary" size="md" icon={<Sparkles size={16} />}>
            Run New Audit
          </GlassButton>
        </Link>
      </div>

      {/* Error State with retry */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={16} className="shrink-0 text-rose-600 dark:text-rose-400" />
            <span className="font-sans leading-relaxed">{error}</span>
          </div>
          <button
            type="button"
            onClick={loadAnalyses}
            className="px-3 py-1.5 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-700 dark:text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 rounded-full border-2 border-brand-cyan/20 border-t-brand-cyan animate-spin mx-auto mb-3" />
          <div className="text-xs text-text-secondary">Retrieving audit archive...</div>
        </div>
      ) : analyses.length > 0 ? (
        <div className="space-y-4">
          {analyses.map((a) => (
            <GlassCard key={a.id} variant="standard" interactive className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center shrink-0">
                  <span className="text-base font-bold text-brand-mint">{Math.round(a.quality_score)}</span>
                  <span className="text-[9px] text-text-muted font-mono uppercase tracking-tighter">SCORE</span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{a.target_role}</h3>
                    <span className="text-xs text-text-muted font-mono">•</span>
                    <span className="text-xs text-brand-cyan font-mono">{Math.round(a.job_match_score)}% Role Match</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(a.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span>•</span>
                    <span>{a.matched_skills?.length || 0} Skills Detected</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <a
                  href={api.getReportDownloadUrl(a.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 hover:text-slate-900 dark:text-text-secondary dark:hover:text-white border border-slate-200 dark:border-white/5 transition-colors"
                  title="Download Executive PDF"
                >
                  <Download size={15} />
                </a>

                <button
                  onClick={() => handleDelete(a.id)}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-rose-500/10 dark:bg-white/5 text-slate-600 hover:text-rose-600 dark:text-text-secondary dark:hover:text-rose-400 border border-slate-200 dark:border-white/5 transition-colors"
                  title="Delete Audit"
                >
                  <Trash2 size={15} />
                </button>

                <Link to={`/results/${a.id}`}>
                  <GlassButton variant="secondary" size="sm" icon={<Eye size={14} />}>
                    View Audit
                  </GlassButton>
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard variant="standard" className="p-12 text-center text-text-secondary">
          <FileText size={32} className="mx-auto mb-3 text-text-muted opacity-60" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No Previous Audits Found</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto mb-6">
            You haven't run any resume evaluations yet. Upload your resume to receive your first ATS score and actionable recommendations.
          </p>
          <Link to="/analyze">
            <GlassButton variant="primary" size="sm" icon={<Sparkles size={14} />}>
              Start First Analysis
            </GlassButton>
          </Link>
        </GlassCard>
      )}
    </div>
  );
};
