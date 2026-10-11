import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, ShieldCheck, CheckCircle2, 
  Briefcase, Compass, FileCheck, Layers, Cpu, Zap, 
  HelpCircle, ChevronDown, ChevronUp, Lock, Terminal
} from 'lucide-react';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { ScoreDial } from '../components/glass/ScoreDial';

export const LandingPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How does meRESUmax calculate the Resume Quality Score?",
      a: "Our scoring engine combines deterministic heuristics across 5 key dimensions: Structure & Completeness (20%), Relevant Skills Depth (25%), Projects & Experience (25%), Clarity & Formatting (15%), and Measurable Impact / Metrics (15%). This gives you transparent, explainable recommendations rather than a black-box percentage."
    },
    {
      q: "What file formats can I upload?",
      a: "meRESUmax natively supports standard PDF (.pdf) and Microsoft Word (.docx) resumes up to 16 MB. The text is parsed directly through secure in-memory extractors."
    },
    {
      q: "Does meRESUmax invent qualifications or fake bullet points?",
      a: "Never. We strictly preserve your genuine experience. Our AI models suggest structural rephrasing, quantifiable impact framing, and stronger action verbs—grounded strictly in the technologies and facts you have provided."
    },
    {
      q: "Are my uploaded resumes and personal details private?",
      a: "Yes. Documents are securely isolated in your private user space. We do not sell user data, train public foundation models on private resumes, or transmit unconsented personal identifiers."
    },
    {
      q: "Where do the job recommendations come from?",
      a: "meRESUmax integrates with the official Adzuna job search API for live postings when configured, alongside curated tech opportunities. We clearly label live vs demonstration job listings so you always know what data you are viewing."
    }
  ];

  return (
    <div className="relative pt-28 pb-20 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-20 text-center relative z-10">
        {/* Eyebrow capsule */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass border border-brand-blue/30 text-xs font-semibold uppercase tracking-widest text-brand-cyan mb-8 shadow-glass-sm animate-pulse-slow">
          <Sparkles size={13} className="text-brand-cyan" />
          <span>INTELLIGENCE FOR YOUR NEXT CHAPTER</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6">
          Your next opportunity starts with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-violet">
            clarity.
          </span>
        </h1>

        {/* Supporting text */}
        <p className="text-text-secondary text-base sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          Turn your resume into actionable career insights. Discover your strengths, 
          close critical skill gaps, and explore opportunities tailored to your true potential.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-10">
          <Link to="/analyze" className="w-full sm:w-auto">
            <GlassButton variant="primary" size="lg" className="w-full sm:w-auto" icon={<Sparkles size={18} />}>
              Analyze My Resume
            </GlassButton>
          </Link>
          <Link to="/jobs" className="w-full sm:w-auto">
            <GlassButton variant="secondary" size="lg" className="w-full sm:w-auto" icon={<Briefcase size={18} />}>
              Explore Careers
            </GlassButton>
          </Link>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
          <ShieldCheck size={14} className="text-brand-mint" />
          <span>Your career data deserves to stay yours. No ads. Zero tracking.</span>
        </div>

        {/* 2. FLOATING PRODUCT DASHBOARD PREVIEW */}
        <div className="mt-16 max-w-5xl mx-auto relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-blue/30 via-brand-cyan/20 to-brand-violet/30 rounded-3xl blur-2xl opacity-40 -z-10" />
          
          <GlassCard variant="elevated" className="p-6 sm:p-8 border border-white/20 shadow-glass-lg text-left">
            {/* Window bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/60" />
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <div className="w-3 h-3 rounded-full bg-mint-500/60" />
                <span className="text-xs text-text-muted font-mono ml-2">meRESUmax Intelligence Suite v1.0 • Demo Preview</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-brand-cyan bg-brand-cyan/10 px-2.5 py-1 rounded-lg border border-brand-cyan/20">
                <CheckCircle2 size={13} />
                <span>Verified Audit</span>
              </div>
            </div>

            {/* Dashboard Mock Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Score Card */}
              <GlassCard variant="subtle" className="p-5 flex flex-col items-center justify-center text-center">
                <ScoreDial score={86} label="Quality Score" sublabel="Top 12% in Archetype" colorScheme="dynamic" size={130} />
                <div className="mt-3 text-xs text-brand-mint font-medium">Strong Technical Depth</div>
                <div className="text-[11px] text-text-muted mt-1">5 of 5 Core Sections Verified</div>
              </GlassCard>

              {/* Skills Breakdown */}
              <GlassCard variant="subtle" className="p-5 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3 flex items-center justify-between">
                    <span>Skills Breakdown</span>
                    <span className="text-brand-cyan text-[11px]">18 Identified</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['Python', 'React', 'TypeScript', 'PostgreSQL', 'Docker', 'REST APIs', 'Git', 'AWS'].map((sk) => (
                      <span key={sk} className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white font-medium">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5">
                  <div className="text-[11px] text-text-muted mb-1">Target Role Alignment:</div>
                  <div className="text-xs font-semibold text-brand-blue">Software Developer (88% Match)</div>
                </div>
              </GlassCard>

              {/* Sample Job Match Card */}
              <GlassCard variant="subtle" className="p-5 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3 flex items-center justify-between">
                    <span>Matched Career Opportunity</span>
                    <span className="text-brand-mint font-bold text-xs bg-brand-mint/10 px-2 py-0.5 rounded-full border border-brand-mint/20">92% Fit</span>
                  </div>
                  <div className="text-sm font-bold text-white">Full Stack Engineer</div>
                  <div className="text-xs text-brand-cyan mt-0.5">AuraCloud Technologies</div>
                  <div className="text-xs text-text-muted mt-2 line-clamp-2">
                    Build telemetry dashboards and high-throughput microservices using React and Python.
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-text-secondary">₹7L - ₹12L • Hybrid</span>
                  <span className="text-xs text-brand-blue font-medium flex items-center gap-1">
                    Apply Now <ArrowRight size={12} />
                  </span>
                </div>
              </GlassCard>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 3. CORE FEATURES SECTION */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-cyan mb-2">Designed for Mastery</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Comprehensive Career Intelligence
          </h2>
          <p className="text-text-secondary text-sm sm:text-base mt-3">
            Engineered with deep heuristics and generative AI guidance to elevate your resume from ordinary to exceptional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard variant="standard" interactive className="p-6">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/20 text-brand-blue flex items-center justify-center mb-4 border border-brand-blue/30 shadow-glow-blue">
              <Cpu size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Transparent Heuristic Scoring</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Understand the exact logic behind your 0-100 quality score: structure, technical breadth, quantified metrics, and formatting.
            </p>
          </GlassCard>

          <GlassCard variant="standard" interactive className="p-6">
            <div className="w-10 h-10 rounded-xl bg-brand-cyan/20 text-brand-cyan flex items-center justify-center mb-4 border border-brand-cyan/30 shadow-glow-cyan">
              <Layers size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Target Role Benchmarking</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Compare your experience directly against industry archetypes for AI/ML, Full Stack, Data Science, Cloud, and Cybersecurity.
            </p>
          </GlassCard>

          <GlassCard variant="standard" interactive className="p-6">
            <div className="w-10 h-10 rounded-xl bg-brand-violet/20 text-brand-violet flex items-center justify-center mb-4 border border-brand-violet/30 shadow-glow-violet">
              <Zap size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">STAR Metric Rewrites</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Transform passive descriptions into punchy, metric-backed accomplishments with side-by-side suggested revisions.
            </p>
          </GlassCard>

          <GlassCard variant="standard" interactive className="p-6">
            <div className="w-10 h-10 rounded-xl bg-brand-mint/20 text-brand-mint flex items-center justify-center mb-4 border border-brand-mint/30">
              <Briefcase size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Job Match Discovery</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Instantly discover job openings that match your verified skill set with clear match percentages and direct application links.
            </p>
          </GlassCard>

          <GlassCard variant="standard" interactive className="p-6">
            <div className="w-10 h-10 rounded-xl bg-brand-amber/20 text-brand-amber flex items-center justify-center mb-4 border border-brand-amber/30">
              <Compass size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Personalized Action Roadmap</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Receive a concrete, milestone-by-milestone timeline to acquire missing high-priority skills and build standout capstone projects.
            </p>
          </GlassCard>

          <GlassCard variant="standard" interactive className="p-6">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center mb-4 border border-rose-500/30">
              <FileCheck size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Executive PDF Reports</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Download professionally styled A4 audit reports complete with visual breakdown tables to review offline or share with mentors.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-blue mb-2">Streamlined Flow</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            How meRESUmax Operates
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <GlassCard variant="elevated" className="p-6 relative">
            <div className="text-3xl font-black text-brand-blue/30 mb-2">01</div>
            <h3 className="text-lg font-bold text-white mb-2">Upload Document</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Drag and drop your PDF or DOCX file. Our engine parses sections, skills, work experiences, and academic achievements in seconds.
            </p>
          </GlassCard>

          <GlassCard variant="elevated" className="p-6 relative">
            <div className="text-3xl font-black text-brand-cyan/30 mb-2">02</div>
            <h3 className="text-lg font-bold text-white mb-2">Audit & Benchmark</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Review your 0-100 quality score, category strengths, missing core technologies, and AI-suggested bullet point rewrites.
            </p>
          </GlassCard>

          <GlassCard variant="elevated" className="p-6 relative">
            <div className="text-3xl font-black text-brand-violet/30 mb-2">03</div>
            <h3 className="text-lg font-bold text-white mb-2">Execute & Apply</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Follow your personalized career roadmap, track completed milestones, and apply to high-match opportunities with confidence.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-20 relative z-10">
        <div className="text-center mb-12">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-cyan mb-2">Questions Answered</div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <GlassCard key={idx} variant="standard" className="p-5 transition-all">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left text-sm sm:text-base font-semibold text-white focus:outline-none"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={18} className="text-brand-cyan" /> : <ChevronDown size={18} className="text-text-secondary" />}
                </button>
                {isOpen && (
                  <p className="mt-3 text-sm text-text-secondary leading-relaxed pt-2 border-t border-white/5 animate-in fade-in duration-200">
                    {faq.a}
                  </p>
                )}
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* 6. BOTTOM CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-6 py-16 relative z-10">
        <GlassCard variant="elevated" glow="blue" className="p-8 sm:p-12 text-center relative overflow-hidden border border-brand-blue/30">
          <div className="max-w-2xl mx-auto space-y-5">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to give your resume the intelligence it deserves?
            </h2>
            <p className="text-text-secondary text-sm sm:text-base">
              Take the guesswork out of job applications. Upload your resume today and see where you truly stand.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/analyze">
                <GlassButton variant="primary" size="lg" icon={<Sparkles size={18} />}>
                  Start Free Resume Analysis
                </GlassButton>
              </Link>
              <Link to="/register">
                <GlassButton variant="secondary" size="lg">
                  Create User Account
                </GlassButton>
              </Link>
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  );
};
