import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Job } from '../types';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { 
  Search, MapPin, Briefcase, Filter, ExternalLink, 
  Bookmark, CheckCircle2, AlertCircle, Sparkles, Building,
  Kanban, Check, RotateCcw
} from 'lucide-react';

export const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [query, setQuery] = useState('software developer');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('all');
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [trackedJobIds, setTrackedJobIds] = useState<Set<string>>(new Set());
  const [isLive, setIsLive] = useState(false);
  const [providerMessage, setProviderMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobListings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getJobs({ query, location, type: jobType });
      setJobs(res.jobs || []);
      setIsLive(res.is_live);
      if (res.message) setProviderMessage(res.message);
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setError(err.message || 'Unable to retrieve job opportunities. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobListings();
    loadSavedJobs();
  }, [jobType]);

  const loadSavedJobs = async () => {
    try {
      const res = await api.getSavedJobs();
      const ids = new Set((res.saved_jobs || []).map((sj) => sj.job?.external_id || ''));
      setSavedJobIds(ids);
    } catch (err) {
      // User might be guest
    }
  };

  const toggleSaveJob = async (job: Job, idx: number) => {
    const isSaved = savedJobIds.has(job.external_id);
    const newSaved = new Set(savedJobIds);
    if (isSaved) {
      newSaved.delete(job.external_id);
      setSavedJobIds(newSaved);
      if (job.id) await api.unsaveJob(job.id);
    } else {
      newSaved.add(job.external_id);
      setSavedJobIds(newSaved);
      await api.saveJob(idx + 1000, job);
    }
  };

  const handleTrackInKanban = async (job: Job) => {
    try {
      const salaryStr = job.salary_min
        ? `${job.salary_currency === 'INR' ? `₹${(job.salary_min / 100000).toFixed(1)}L` : `$${job.salary_min.toLocaleString()}`}${job.salary_max ? ` - ${job.salary_currency === 'INR' ? `₹${(job.salary_max / 100000).toFixed(1)}L` : `$${job.salary_max.toLocaleString()}`}` : ''}`
        : '';

      await api.createApplication({
        company: job.company,
        role: job.title,
        location: job.location,
        job_type: job.job_type,
        status: 'saved',
        priority: 'medium',
        salary_range: salaryStr,
        url: job.url,
        notes: `Discovered on meRESUmax. Required skills: ${job.required_skills?.slice(0, 4).join(', ')}`
      });

      setTrackedJobIds(prev => new Set(prev).add(job.external_id));
    } catch (err) {
      console.error('Failed to track job in pipeline:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20 relative z-10">
      {/* Header */}
      <div className="max-w-xl mb-10">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs font-mono text-text-secondary mb-3">
          <Briefcase size={13} className="text-slate-500 dark:text-zinc-400" />
          <span>OPPORTUNITY RADAR</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
          Explore Tailored Tech Jobs
        </h1>
        <p className="text-text-secondary text-sm mt-2">
          Discover openings calibrated for your experience level. Real external job listings when API configured, with clear demonstration labeling.
        </p>
      </div>

      {/* Provider Status Banner */}
      <div className="mb-6 p-3 sm:p-3.5 rounded-xl bg-slate-100 dark:bg-[#111318] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-text-secondary font-mono shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
          <span className="break-words">
            STREAM: <strong className="text-slate-900 dark:text-white font-medium">{isLive ? 'Live JSearch results' : (providerMessage || 'Curated demo jobs — connect JSearch in Render for live listings')}</strong>
          </span>
        </div>
        {!isLive && (
          <span className="text-[11px] text-text-muted break-words leading-relaxed">
            {providerMessage || 'Curated demo jobs — connect JSearch in Render for live listings'}
          </span>
        )}
      </div>

      {/* Search & Filter Bar */}
      <GlassCard variant="standard" className="p-4 mb-8">
        <form onSubmit={(e) => { e.preventDefault(); fetchJobListings(); }} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Job title, keywords, or skills..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#0D0F14] border border-slate-200 dark:border-white/10 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400 dark:text-zinc-500" />
          </div>

          <div className="relative">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, region, or Remote"
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#0D0F14] border border-slate-200 dark:border-white/10 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
            />
            <MapPin size={14} className="absolute left-3 top-2.5 text-slate-400 dark:text-zinc-500" />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0D0F14] border border-slate-200 dark:border-white/10 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-[#111318] text-slate-900 dark:text-white">All Types</option>
              <option value="full-time" className="bg-white dark:bg-[#111318] text-slate-900 dark:text-white">Full-Time</option>
              <option value="internship" className="bg-white dark:bg-[#111318] text-slate-900 dark:text-white">Internships</option>
            </select>
            <GlassButton type="submit" variant="primary" size="sm" disabled={isLoading}>
              Search
            </GlassButton>
          </div>
        </form>
      </GlassCard>

      {/* Error state with retry */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={16} className="shrink-0 text-rose-600 dark:text-rose-400" />
            <span className="font-sans leading-relaxed">{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchJobListings}
            className="px-3 py-1.5 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-700 dark:text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw size={12} />
            <span>Retry Search</span>
          </button>
        </div>
      )}

      {/* Job Cards Grid */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 rounded-full border-2 border-brand-mint/20 border-t-brand-mint animate-spin mx-auto mb-3" />
          <div className="text-xs text-text-secondary">Fetching opportunities...</div>
        </div>
      ) : jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {jobs.map((job, idx) => {
            const isSaved = savedJobIds.has(job.external_id);
            return (
              <GlassCard key={idx} variant="standard" interactive className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-base font-bold text-slate-900 dark:text-white leading-snug">{job.title}</div>
                        {job.is_demo ? (
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 shrink-0">
                            DEMO
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0">
                            LIVE
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-cyan-600 dark:text-brand-cyan flex items-center gap-1.5 mt-1 font-medium">
                        <Building size={13} />
                        <span>{job.company}</span>
                        <span className="text-text-muted">•</span>
                        <span className="text-text-secondary">{job.location}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSaveJob(job, idx)}
                      className={`p-2 rounded-lg transition-colors ${
                        isSaved ? 'text-amber-500 bg-amber-500/10' : 'text-text-muted hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                      title={isSaved ? 'Saved to bookmarks' : 'Bookmark job'}
                    >
                      <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  <p className="text-xs text-text-secondary line-clamp-2 mt-2 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Skills badges */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {job.required_skills?.slice(0, 5).map((sk) => (
                      <span key={sk} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-medium">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-white/5 flex items-center justify-between text-xs">
                  <div className="text-text-muted">
                    {job.salary_min ? (
                      <span className="text-brand-mint font-semibold">
                        {job.salary_currency === 'INR' ? `₹${(job.salary_min / 100000).toFixed(1)}L` : `$${job.salary_min.toLocaleString()}`}
                        {job.salary_max ? ` - ${job.salary_currency === 'INR' ? `₹${(job.salary_max / 100000).toFixed(1)}L` : `$${job.salary_max.toLocaleString()}`}` : ''}
                      </span>
                    ) : (
                      <span>{job.job_type}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTrackInKanban(job)}
                      disabled={trackedJobIds.has(job.external_id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        trackedJobIds.has(job.external_id)
                          ? 'bg-brand-mint/20 text-brand-mint border border-brand-mint/30 cursor-default'
                          : 'bg-brand-blue/15 hover:bg-brand-blue/30 text-brand-cyan border border-brand-blue/30'
                      }`}
                    >
                      {trackedJobIds.has(job.external_id) ? (
                        <>
                          <Check size={12} />
                          <span>Tracked</span>
                        </>
                      ) : (
                        <>
                          <Kanban size={12} />
                          <span>Track Pipeline</span>
                        </>
                      )}
                    </button>

                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-white/10 dark:hover:bg-white/20 dark:text-white font-medium text-xs transition-colors"
                    >
                      <span>Apply</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <GlassCard variant="standard" className="p-12 text-center text-text-secondary">
          <Briefcase size={28} className="mx-auto mb-2 text-text-muted" />
          <div className="text-sm font-semibold text-slate-900 dark:text-white">No listings match your search criteria</div>
          <div className="text-xs text-text-muted mt-1">Try broadening your search keyword or clearing the location filter.</div>
        </GlassCard>
      )}
    </div>
  );
};
