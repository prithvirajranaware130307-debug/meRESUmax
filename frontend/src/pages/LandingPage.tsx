import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, ShieldCheck, CheckCircle2, 
  Briefcase, Compass, Layers, Cpu, Zap, 
  ChevronDown, ChevronUp, Terminal, FileText, Check, Sparkles
} from 'lucide-react';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { ScoreDial } from '../components/glass/ScoreDial';

export const LandingPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How does meRESUmax calculate the Resume Quality Score?",
      a: "Our scoring engine combines transparent deterministic heuristics across 5 key dimensions: Structure & Completeness (20%), Relevant Skills Depth (25%), Projects & Experience (25%), Clarity & Formatting (15%), and Measurable Impact (15%). This produces an explainable, actionable audit rather than an arbitrary black-box percentage."
    },
    {
      q: "What file formats and sizes can I upload?",
      a: "meRESUmax natively parses PDF (.pdf) and Microsoft Word (.docx) documents up to 16 MB. The text extraction runs through secure in-memory parsers with strict page limits and encryption checks."
    },
    {
      q: "Does meRESUmax invent qualifications or insert fake bullet points?",
      a: "Never. We strictly preserve your authentic experience. Our engine suggests structural rephrasing, quantifiable impact framing, and stronger technical action verbs—grounded exclusively in the verified facts and tools you have provided."
    },
    {
      q: "Are my uploaded resumes and personal details kept private?",
      a: "Yes. Documents are securely isolated in your private candidate workspace. We do not sell user data, train public AI models on private resumes, or transmit unconsented personal identifiers."
    },
    {
      q: "Where do the job recommendations originate from?",
      a: "meRESUmax integrates with the official Adzuna job search API for live postings when configured, alongside curated role opportunities. Every listing clearly specifies its archetype fit and matched skill coverage."
    }
  ];

  return (
    <div className="relative pt-24 pb-20 overflow-hidden">
      {/* 1. EDITORIAL HERO SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 relative z-10">
        <div className="flex flex-col items-start max-w-4xl">
          {/* System Eyebrow Tag */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-xs font-mono text-text-secondary mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>SYSTEM // ATS RESUME INTELLIGENCE</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08] mb-6">
            Transform raw resumes into verifiable career intelligence.
          </h1>

          {/* Supporting Statement */}
          <p className="text-text-secondary text-base sm:text-xl max-w-2xl leading-relaxed mb-8">
            Engineered with explainable heuristic scoring, role archetype benchmarking, 
            and targeted STAR rewrites. Zero guesswork. Zero black-box metrics.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mb-10">
            <Link to="/analyze">
              <GlassButton variant="primary" size="lg" className="w-full sm:w-auto" icon={<ArrowRight size={16} />}>
                Analyze Resume
              </GlassButton>
            </Link>
            <Link to="/jobs">
              <GlassButton variant="secondary" size="lg" className="w-full sm:w-auto" icon={<Briefcase size={16} />}>
                Explore Opportunities
              </GlassButton>
            </Link>
          </div>

          {/* Trust Matrix Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-6 text-xs text-text-muted font-mono pt-4 border-t border-white/[0.08] w-full">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
              <span>16 MB PDF & DOCX Ingestion</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
              <span>5-Dimensional ATS Heuristics</span>
            </div>
            <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
              <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
              <span>Zero Document Training Leaks</span>
            </div>
          </div>
        </div>

        {/* 2. REALISTIC PRODUCT WORKSPACE PREVIEW */}
        <div className="mt-14 max-w-6xl mx-auto relative">
          <GlassCard variant="elevated" className="p-0 border border-white/[0.12] shadow-elevated overflow-hidden">
            {/* Terminal Window Header Bar */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-[#0D0F14] border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                <span className="text-xs text-text-muted font-mono ml-3 truncate">
                  audit_preview.json • Software Developer Archetype
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                <span>PARSED & VERIFIED</span>
              </div>
            </div>

            {/* Dashboard Workspace Mock Content */}
            <div className="p-6 sm:p-8 bg-[#111318]/90">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Score Dial & Category Breakdown (5 Cols) */}
                <div className="lg:col-span-5 p-5 rounded-xl bg-[#161922] border border-white/[0.08] flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <span className="text-xs font-mono uppercase tracking-wider text-text-secondary">Quality Index</span>
                    <span className="text-xs font-mono text-emerald-400 font-semibold">Tier 1 • Top 14%</span>
                  </div>

                  <div className="py-6 flex items-center justify-center">
                    <ScoreDial score={86} label="ATS Score" sublabel="Software Developer" size={140} strokeWidth={8} />
                  </div>

                  {/* Dimension Bars */}
                  <div className="space-y-2.5 pt-2">
                    {[
                      { name: 'Relevant Skills Depth', score: 88, max: '25/25 pts' },
                      { name: 'Projects & Experience', score: 84, max: '21/25 pts' },
                      { name: 'Clarity & Formatting', score: 92, max: '14/15 pts' },
                      { name: 'Structure & Completeness', score: 90, max: '18/20 pts' },
                      { name: 'Measurable Impact', score: 76, max: '11/15 pts' },
                    ].map((dim) => (
                      <div key={dim.name} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-text-secondary">{dim.name}</span>
                          <span className="text-white font-medium">{dim.max}</span>
                        </div>
                        <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${dim.score}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills & Real-Time Match Radar (7 Cols) */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                  {/* Verified Skill Extraction Box */}
                  <div className="p-5 rounded-xl bg-[#161922] border border-white/[0.08]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono uppercase tracking-wider text-text-secondary">
                        Extracted Technical Inventory
                      </span>
                      <span className="text-xs font-mono text-text-muted">18 Matched</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {['Python', 'TypeScript', 'React', 'PostgreSQL', 'Docker', 'REST APIs', 'Git', 'FastAPI', 'Redis', 'SQLAlchemy'].map((skill) => (
                        <span 
                          key={skill} 
                          className="px-2.5 py-1 rounded bg-[#1D212C] border border-white/10 text-xs font-mono text-zinc-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Live Matched Opportunity */}
                  <div className="p-5 rounded-xl bg-[#161922] border border-white/[0.08]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Briefcase size={14} className="text-blue-400" />
                        <span className="text-xs font-mono uppercase tracking-wider text-text-secondary">
                          Matched Opportunity
                        </span>
                      </div>
                      <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        92% Role Fit
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3 pt-3 border-t border-white/5">
                      <div>
                        <div className="text-sm font-semibold text-white">Full Stack Software Engineer</div>
                        <div className="text-xs text-text-secondary mt-0.5">AuraCloud Technologies • Bangalore (Hybrid)</div>
                      </div>
                      <div className="text-xs font-mono text-text-muted shrink-0">
                        ₹7L - ₹12L PA
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 3. ASYMMETRIC BENTO GRID (REPLACES GENERIC 3-COL AI CARDS) */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 relative z-10">
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-mono uppercase tracking-wider text-text-muted mb-2">
            ENGINEERING CAPABILITIES
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Designed for objective precision, not generic placeholders.
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Bento Item 1: Scoring Architecture (Span 7) */}
          <GlassCard variant="standard" className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                <Cpu size={16} />
              </div>
              <div className="text-xs font-mono text-blue-400 uppercase tracking-wider mb-1">01 // HEURISTIC EVALUATION</div>
              <h3 className="text-xl font-bold text-white tracking-tight mb-2">
                Deterministic 5-Dimensional Quality Index
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                Unlike vague generative wrappers, meRESUmax evaluates structure, skill breadth, quantified impact, clarity, 
                and role alignment through a rule-based deterministic scoring engine. Every deduction is justified.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#161922] border border-white/5 font-mono text-xs space-y-2">
              <div className="flex justify-between text-text-muted">
                <span>SCORING ENGINE</span>
                <span className="text-emerald-400">100% EXPLAINABLE</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-[11px]">
                <div className="p-2 rounded bg-[#0D0F14] text-center border border-white/5">
                  <div className="text-white font-semibold">20%</div>
                  <div className="text-text-muted text-[10px]">Structure</div>
                </div>
                <div className="p-2 rounded bg-[#0D0F14] text-center border border-white/5">
                  <div className="text-white font-semibold">25%</div>
                  <div className="text-text-muted text-[10px]">Skills</div>
                </div>
                <div className="p-2 rounded bg-[#0D0F14] text-center border border-white/5">
                  <div className="text-white font-semibold">25%</div>
                  <div className="text-text-muted text-[10px]">Projects</div>
                </div>
                <div className="p-2 rounded bg-[#0D0F14] text-center border border-white/5">
                  <div className="text-white font-semibold">15%</div>
                  <div className="text-text-muted text-[10px]">Clarity</div>
                </div>
                <div className="p-2 rounded bg-[#0D0F14] text-center border border-white/5 col-span-2 sm:col-span-1">
                  <div className="text-white font-semibold">15%</div>
                  <div className="text-text-muted text-[10px]">Impact</div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Bento Item 2: STAR Rewriter (Span 5) */}
          <GlassCard variant="standard" className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Zap size={16} />
              </div>
              <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">02 // STAR REWRITING</div>
              <h3 className="text-xl font-bold text-white tracking-tight mb-2">
                Action-Verb & Impact Structuring
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-4">
                Identifies passive descriptions and structures them into accomplishment-driven statements without inventing fake claims.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#161922] border border-white/5 space-y-2.5 font-mono text-xs">
              <div className="text-[11px] text-rose-400 line-through opacity-75">
                - Worked on backend APIs and fixed some database bugs.
              </div>
              <div className="text-[11px] text-emerald-400 pt-1 border-t border-white/5">
                + Architected 12 RESTful microservices in Python/Flask, decreasing query response times by 38%.
              </div>
            </div>
          </GlassCard>

          {/* Bento Item 3: Role Archetype Benchmarking (Span 5) */}
          <GlassCard variant="standard" className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <Layers size={16} />
              </div>
              <div className="text-xs font-mono text-purple-400 uppercase tracking-wider mb-1">03 // TAXONOMY MATCH</div>
              <h3 className="text-xl font-bold text-white tracking-tight mb-2">
                Industry Role Benchmarks
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-4">
                Directly aligns technical resumes against verified skill sets for Software Engineering, AI/ML, Cloud, Data Science, and Cybersecurity.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 font-mono text-xs">
              {['AI/ML Engineer', 'Full Stack Developer', 'Data Analyst', 'Cloud Engineer', 'Cybersecurity'].map((r) => (
                <span key={r} className="px-2.5 py-1 rounded bg-[#161922] border border-white/10 text-zinc-300">
                  {r}
                </span>
              ))}
            </div>
          </GlassCard>

          {/* Bento Item 4: Career Roadmap & Milestones (Span 7) */}
          <GlassCard variant="standard" className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Compass size={16} />
              </div>
              <div className="text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">04 // TRAJECTORY BUILDER</div>
              <h3 className="text-xl font-bold text-white tracking-tight mb-2">
                Personalized Skill Gap Roadmaps
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-4">
                Generates actionable milestones from detected missing skills. Track high-priority learning objectives 
                and capstone project recommendations directly in your command center.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-mono text-xs">
              <div className="p-3 rounded-lg bg-[#161922] border border-white/5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="text-zinc-200">High Priority: Docker Containerization</span>
              </div>
              <div className="p-3 rounded-lg bg-[#161922] border border-white/5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-zinc-200">Medium Priority: SQL Index Optimization</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 4. STREAMLINED WORKFLOW STEPS */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 relative z-10">
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-mono uppercase tracking-wider text-text-muted mb-2">
            WORKFLOW
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            How meRESUmax Operates
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-[#111318] border border-white/[0.08] relative">
            <div className="text-xs font-mono text-text-muted mb-3">STEP // 01</div>
            <h3 className="text-lg font-bold text-white mb-2">Document Ingestion</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Upload PDF or DOCX documents. Our parser performs in-memory extraction of sections, skills, work history, and academic milestones in milliseconds.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#111318] border border-white/[0.08] relative">
            <div className="text-xs font-mono text-text-muted mb-3">STEP // 02</div>
            <h3 className="text-lg font-bold text-white mb-2">Heuristic & Skill Audit</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Calculates your 0-100 ATS quality score, extracts technical inventory, matches target role archetypes, and identifies critical skill gaps.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#111318] border border-white/[0.08] relative">
            <div className="text-xs font-mono text-text-muted mb-3">STEP // 03</div>
            <h3 className="text-lg font-bold text-white mb-2">Trajectory & Applications</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Export downloadable PDF audit reports, generate tailored STAR rewrites, simulate mock interviews, and apply to high-match jobs.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 py-16 relative z-10">
        <div className="mb-10 text-center">
          <div className="text-xs font-mono uppercase tracking-wider text-text-muted mb-2">EXPLAINABILITY</div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className="rounded-xl bg-[#111318] border border-white/[0.08] transition-all overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-5 flex items-center justify-between text-left text-sm sm:text-base font-medium text-white focus:outline-none cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp size={16} className="text-zinc-400 shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-zinc-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-text-secondary leading-relaxed pt-1 border-t border-white/[0.06]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. BOTTOM CALL TO ACTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        <div className="p-8 sm:p-12 rounded-xl bg-[#111318] border border-white/[0.12] text-left relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Ready to give your resume the intelligence it deserves?
            </h2>
            <p className="text-text-secondary text-sm">
              Upload your resume now for an explainable ATS audit, skill match percentage, and targeted trajectory.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link to="/analyze">
              <GlassButton variant="primary" size="lg" className="w-full sm:w-auto" icon={<ArrowRight size={16} />}>
                Analyze Resume Now
              </GlassButton>
            </Link>
            <Link to="/register">
              <GlassButton variant="secondary" size="lg" className="w-full sm:w-auto">
                Create Account
              </GlassButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
