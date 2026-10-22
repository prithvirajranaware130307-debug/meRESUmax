import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Analysis, Job, RoadmapTask } from '../types';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { ScoreDial } from '../components/glass/ScoreDial';
import { 
  Sparkles, FileUp, Briefcase, Compass, ArrowRight, 
  CheckCircle2, Clock, AlertTriangle, ChevronRight, Layers, FileText,
  Mic, Wand2, Layout, Kanban
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [roadmapTasks, setRoadmapTasks] = useState<RoadmapTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [analysesRes, jobsRes, roadmapRes] = await Promise.allSettled([
          api.getAnalyses(),
          api.getRecommendations(),
          api.getRoadmap()
        ]);

        if (analysesRes.status === 'fulfilled') setAnalyses(analysesRes.value.analyses);
        if (jobsRes.status === 'fulfilled') setRecommendedJobs(jobsRes.value.jobs);
        if (roadmapRes.status === 'fulfilled') setRoadmapTasks(roadmapRes.value.tasks);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const latestAnalysis = analyses.length > 0 ? analyses[0] : null;
  const completedTasksCount = roadmapTasks.filter(t => t.is_completed).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20 relative z-10">
      {/* Personalized Greeting & Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-text-muted mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>COMMAND CENTER // ACTIVE PROFILE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, {user?.name || 'Candidate'}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5 font-mono">
            TARGET ROLE: <span className="text-white font-medium">{user?.target_role || 'Software Developer'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link to="/analyze" className="w-full sm:w-auto">
            <GlassButton variant="primary" size="md" className="w-full sm:w-auto" icon={<FileUp size={15} />}>
              Analyze New Resume
            </GlassButton>
          </Link>
        </div>
      </div>

      {/* Primary Metrics Row */}
      {latestAnalysis ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          {/* Quality Score Dial */}
          <GlassCard variant="elevated" className="p-5 flex flex-col items-center justify-center text-center">
            <ScoreDial 
              score={Math.round(latestAnalysis.quality_score)} 
              label="Quality Score" 
              sublabel="Resume Benchmark" 
              colorScheme="dynamic" 
              size={120} 
            />
            <div className="mt-2 text-xs font-mono text-text-muted">
              {latestAnalysis.quality_score >= 80 ? 'Competitive Tier-1' : 'Solid Base'}
            </div>
          </GlassCard>

          {/* Job Match Dial */}
          <GlassCard variant="elevated" className="p-5 flex flex-col items-center justify-center text-center">
            <ScoreDial 
              score={Math.round(latestAnalysis.job_match_score)} 
              label="Role Match" 
              sublabel={latestAnalysis.target_role} 
              colorScheme="cyan" 
              size={120} 
            />
            <div className="mt-2 text-xs font-mono text-emerald-400">
              {latestAnalysis.matched_skills.length} skills verified
            </div>
          </GlassCard>

          {/* Key Skill Gap Card */}
          <GlassCard variant="elevated" className="p-5 flex flex-col justify-between md:col-span-2">
            <div>
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-text-secondary mb-3">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <AlertTriangle size={13} />
                  <span>Priority Skill Gaps</span>
                </span>
                <span className="text-text-muted text-[11px]">{latestAnalysis.missing_skills.length} detected</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {latestAnalysis.missing_skills.slice(0, 6).map((sk) => (
                  <span key={sk} className="text-xs font-mono px-2.5 py-0.5 rounded bg-[#0D0F14] border border-amber-500/20 text-amber-300">
                    {sk}
                  </span>
                ))}
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Incorporating these technologies into your projects will directly increase your match percentage for {latestAnalysis.target_role}.
              </p>
            </div>
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <Link to={`/results/${latestAnalysis.id}`} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium font-mono">
                View Full Audit Breakdown <ArrowRight size={12} />
              </Link>
            </div>
          </GlassCard>
        </div>
      ) : (
        /* Empty State */
        <GlassCard variant="elevated" className="p-8 text-center mb-8 border border-white/10">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-10 h-10 rounded-lg bg-[#161922] text-zinc-300 flex items-center justify-center mx-auto border border-white/10">
              <FileUp size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">No resume audit on record yet</h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Upload your PDF or Word resume to receive transparent quality scores, skill gap audits, and matched job openings.
            </p>
            <Link to="/analyze">
              <GlassButton variant="primary" size="md" icon={<ArrowRight size={15} />}>
                Upload & Analyze Resume Now
              </GlassButton>
            </Link>
          </div>
        </GlassCard>
      )}

      {/* AI Career Acceleration Suite Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link to="/interview" className="group">
          <GlassCard className="p-5 h-full bg-[#161922] border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#0D0F14] border border-white/10 flex items-center justify-center text-zinc-300 group-hover:scale-105 transition-transform">
                <Mic size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-zinc-200 transition-colors">
                  AI Mock Interview
                </h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Interactive simulation evaluated with STAR methodology and technical depth scoring.
                </p>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-400 group-hover:text-white transition-colors">
              <span>Start Session</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </GlassCard>
        </Link>

        <Link to="/tools" className="group">
          <GlassCard className="p-5 h-full bg-[#161922] border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#0D0F14] border border-white/10 flex items-center justify-center text-zinc-300 group-hover:scale-105 transition-transform">
                <Wand2 size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-zinc-200 transition-colors">
                  Cover Letter & LinkedIn
                </h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Generate company-tailored ATS cover letters and recruiter-aligned LinkedIn headlines in seconds.
                </p>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-400 group-hover:text-white transition-colors">
              <span>Open Tools</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </GlassCard>
        </Link>

        <Link to="/builder" className="group">
          <GlassCard className="p-5 h-full bg-[#161922] border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#0D0F14] border border-white/10 flex items-center justify-center text-zinc-300 group-hover:scale-105 transition-transform">
                <Layout size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-zinc-200 transition-colors">
                  Live Resume Builder
                </h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Draft, customize, and export recruiter-approved resumes with live ATS health scoring.
                </p>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-400 group-hover:text-white transition-colors">
              <span>Launch Builder</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </GlassCard>
        </Link>

        <Link to="/tracker" className="group">
          <GlassCard className="p-5 h-full bg-[#161922] border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#0D0F14] border border-white/10 flex items-center justify-center text-zinc-300 group-hover:scale-105 transition-transform">
                <Kanban size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-zinc-200 transition-colors">
                  Application Tracker
                </h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Interactive Kanban board to track interview rounds, offer stages, and follow-ups.
                </p>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-400 group-hover:text-white transition-colors">
              <span>View Pipeline</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </GlassCard>
        </Link>
      </div>

      {/* Two Column Layout: Roadmap & Recommended Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Career Roadmap Progress */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard variant="standard" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Compass size={18} className="text-brand-mint" />
                <h2 className="text-base font-bold text-white">Career Roadmap Progress</h2>
              </div>
              <Link to="/roadmap" className="text-xs text-brand-blue hover:underline flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>

            {roadmapTasks.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
                  <span>Milestones Completed: {completedTasksCount} / {roadmapTasks.length}</span>
                  <span className="font-semibold text-brand-mint">
                    {Math.round((completedTasksCount / roadmapTasks.length) * 100)}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10 mb-4">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-blue via-brand-cyan to-brand-mint rounded-full transition-all duration-500"
                    style={{ width: `${(completedTasksCount / roadmapTasks.length) * 100}%` }}
                  />
                </div>

                {roadmapTasks.slice(0, 4).map((task) => (
                  <div key={task.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-3">
                    <CheckCircle2 
                      size={18} 
                      className={`shrink-0 mt-0.5 ${task.is_completed ? 'text-brand-mint' : 'text-text-muted'}`} 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{task.title}</div>
                      <div className="text-[11px] text-text-secondary line-clamp-1 mt-0.5">{task.description}</div>
                    </div>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-text-muted shrink-0">
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-text-muted">
                Analyze a resume to generate tailored roadmap milestones.
              </div>
            )}
          </GlassCard>

          {/* Recent Analyses History list */}
          <GlassCard variant="standard" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-brand-cyan" />
                <h2 className="text-base font-bold text-white">Recent Analysis Audits</h2>
              </div>
              <Link to="/history" className="text-xs text-brand-blue hover:underline flex items-center gap-1">
                Full History <ArrowRight size={12} />
              </Link>
            </div>

            {analyses.length > 0 ? (
              <div className="divide-y divide-white/5">
                {analyses.slice(0, 3).map((a) => (
                  <div key={a.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-blue/10 border border-brand-blue/20 text-brand-blue flex items-center justify-center font-bold text-xs">
                        {Math.round(a.quality_score)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{a.target_role}</div>
                        <div className="text-[11px] text-text-muted">{a.resume_filename} • {a.created_at?.slice(0, 10)}</div>
                      </div>
                    </div>
                    <Link to={`/results/${a.id}`}>
                      <GlassButton variant="ghost" size="sm" icon={<ChevronRight size={14} />}>
                        Inspect
                      </GlassButton>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-text-muted">No analysis records available.</div>
            )}
          </GlassCard>
        </div>

        {/* Right Column (1 Col): Matched Job Recommendations */}
        <div className="space-y-6">
          <GlassCard variant="standard" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Briefcase size={18} className="text-brand-blue" />
                <h2 className="text-base font-bold text-white">Recommended Jobs</h2>
              </div>
              <Link to="/jobs" className="text-xs text-brand-blue hover:underline">
                Explore All
              </Link>
            </div>

            <div className="space-y-3">
              {recommendedJobs.slice(0, 4).map((job, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="text-xs font-bold text-white leading-tight truncate">{job.title}</div>
                    {job.computed_match_score && (
                      <span className="text-[10px] font-bold text-brand-mint bg-brand-mint/10 px-1.5 py-0.5 rounded shrink-0">
                        {Math.round(job.computed_match_score)}%
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-brand-cyan mb-2">{job.company} • {job.location}</div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[10px] text-text-muted">
                      {job.is_demo ? 'Curated Demo' : 'Live Listing'}
                    </span>
                    <a 
                      href={job.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[11px] text-brand-blue hover:text-white flex items-center gap-1 font-medium"
                    >
                      Apply <ArrowRight size={11} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
