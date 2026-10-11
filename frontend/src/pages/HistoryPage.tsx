import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Analysis } from '../types';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { 
  History, Download, Trash2, Eye, Calendar, 
  FileText, ArrowRight, Sparkles 
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalyses = async () => {
    try {
      const res = await api.getAnalyses();
      setAnalyses(res.analyses);
    } catch (err) {
      console.error('Failed to load history:', err);
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
      await api.deleteAnalysis(id);
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
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Analysis History</h1>
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

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 rounded-full border-2 border-brand-amber/20 border-t-brand-amber animate-spin mx-auto mb-3" />
          <div className="text-xs text-text-secondary">Loading audit records...</div>
        </div>
      ) : analyses.length > 0 ? (
        <div className="space-y-4">
          {analyses.map((a) => (
            <GlassCard key={a.id} variant="standard" interactive className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                {/* Score badge */}
                <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/10 flex flex-col items-center justify-center shrink-0">
                  <span className="text-sm font-extrabold text-brand-cyan">{Math.round(a.quality_score)}</span>
                  <span className="text-[9px] uppercase font-semibold text-text-muted">Quality</span>
                </div>

                <div>
                  <div className="text-base font-bold text-white leading-tight">
                    {a.target_role}
                  </div>
                  <div className="text-xs text-text-secondary mt-1 flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 text-text-muted">
                      <FileText size={12} />
                      <span>{a.resume_filename}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-text-muted">
                      <Calendar size={12} />
                      <span>{a.created_at?.slice(0, 10)}</span>
                    </span>
                    <span>•</span>
                    <span className="text-brand-mint font-medium">
                      {Math.round(a.job_match_score)}% Role Match
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <Link to={`/results/${a.id}`}>
                  <GlassButton variant="secondary" size="sm" icon={<Eye size={14} />}>
                    View
                  </GlassButton>
                </Link>

                <a href={api.getReportDownloadUrl(a.id)} target="_blank" rel="noopener noreferrer">
                  <GlassButton variant="ghost" size="sm" title="Download PDF Report">
                    <Download size={14} />
                  </GlassButton>
                </a>

                <button
                  onClick={() => handleDelete(a.id)}
                  className="p-2 rounded-xl text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete record"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard variant="standard" className="p-12 text-center text-text-secondary">
          <History size={28} className="mx-auto mb-2 text-text-muted" />
          <div className="text-sm font-semibold text-white">No historical audits found</div>
          <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
            Uploaded resumes and calculated score breakdowns will appear here for long-term tracking.
          </p>
        </GlassCard>
      )}
    </div>
  );
};
