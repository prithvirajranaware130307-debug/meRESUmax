import React, { useState } from 'react';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { ResumeBuilderData } from '../types';
import { 
  FileText, Download, Printer, Plus, Trash2, 
  Sparkles, CheckCircle2, ShieldCheck, RefreshCw, Eye, Layout
} from 'lucide-react';

const INITIAL_RESUME_DATA: ResumeBuilderData = {
  fullName: 'Alex Mercer',
  email: 'alex.mercer@example.com',
  phone: '+1 (555) 234-5678',
  location: 'San Francisco, CA',
  linkedin: 'linkedin.com/in/alex-mercer',
  github: 'github.com/alexmercer',
  portfolio: 'alexmercer.dev',
  summary: 'Performance-driven Senior Software Engineer with 5+ years of experience architecting distributed cloud systems, real-time web applications, and resilient microservices. Proven track record of reducing latency by 45% and mentoring high-velocity engineering teams.',
  skills: [
    'React', 'TypeScript', 'Node.js', 'Python', 'FastAPI', 
    'Docker', 'Kubernetes', 'PostgreSQL', 'Redis', 'AWS', 'GraphQL'
  ],
  experience: [
    {
      id: 'exp-1',
      company: 'Apex Cloud Systems',
      role: 'Senior Software Engineer',
      duration: '2022 - Present',
      bullets: [
        'Architected an event-driven telemetry ingest pipeline handling 12M daily events with 99.99% uptime.',
        'Refactored legacy REST microservices into asynchronous FastAPI services, decreasing p99 latency by 42%.',
        'Spearheaded frontend migration to React 18 and Vite, improving initial page load time from 3.2s to 850ms.'
      ]
    },
    {
      id: 'exp-2',
      company: 'Pulse Dynamics',
      role: 'Full Stack Developer',
      duration: '2020 - 2022',
      bullets: [
        'Built real-time collaboration canvas with WebSockets, serving 150K monthly active enterprise users.',
        'Implemented end-to-end testing suite with Playwright and Vitest, slashing production regression bugs by 30%.'
      ]
    }
  ],
  education: [
    {
      id: 'edu-1',
      school: 'University of California, Berkeley',
      degree: 'B.S. in Computer Science',
      year: '2016 - 2020',
      gpa: '3.85 / 4.0'
    }
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'Distributed Vector Cache',
      technologies: 'Rust, gRPC, Redis',
      description: 'High-throughput sub-millisecond in-memory cache for high-dimensional vector embeddings.',
      bullets: [
        'Benchmarked at 85,000 queries per second with sub-5ms latency across multi-node clusters.',
        'Open-sourced with 1,200+ GitHub stars and active production adoption.'
      ]
    }
  ]
};

export const ResumeBuilderPage: React.FC = () => {
  const [resume, setResume] = useState<ResumeBuilderData>(INITIAL_RESUME_DATA);
  const [template, setTemplate] = useState<'modern' | 'minimal' | 'executive'>('modern');
  const [newSkill, setNewSkill] = useState('');

  // Experience Handlers
  const addExperience = () => {
    const newExp = {
      id: `exp-${Date.now()}`,
      company: 'New Company',
      role: 'Software Engineer',
      duration: '2023 - Present',
      bullets: ['Describe your core achievements with quantifiable metrics and action verbs.']
    };
    setResume(prev => ({ ...prev, experience: [...prev.experience, newExp] }));
  };

  const removeExperience = (id: string) => {
    setResume(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }));
  };

  const updateExperience = (id: string, field: string, val: any) => {
    setResume(prev => ({
      ...prev,
      experience: prev.experience.map(e => e.id === id ? { ...e, [field]: val } : e)
    }));
  };

  // Education Handlers
  const addEducation = () => {
    const newEdu = {
      id: `edu-${Date.now()}`,
      school: 'University / Institute',
      degree: 'Degree / Major',
      year: '2020 - 2024'
    };
    setResume(prev => ({ ...prev, education: [...prev.education, newEdu] }));
  };

  const removeEducation = (id: string) => {
    setResume(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));
  };

  // Project Handlers
  const addProject = () => {
    const newProj = {
      id: `proj-${Date.now()}`,
      title: 'Project Name',
      technologies: 'Tech Stack',
      description: 'Brief overview of project goals',
      bullets: ['Implemented core feature resulting in measurable outcome.']
    };
    setResume(prev => ({ ...prev, projects: [...prev.projects, newProj] }));
  };

  const removeProject = (id: string) => {
    setResume(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
  };

  // Skill Handlers
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (!resume.skills.includes(newSkill.trim())) {
      setResume(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
    }
    setNewSkill('');
  };

  const removeSkill = (skill: string) => {
    setResume(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  // Exports
  const handlePrint = () => {
    window.print();
  };

  const exportTxt = () => {
    const txt = [
      resume.fullName.toUpperCase(),
      `${resume.email} | ${resume.phone} | ${resume.location}`,
      `${resume.linkedin} | ${resume.github}`,
      '\nSUMMARY',
      resume.summary,
      '\nTECHNICAL SKILLS',
      resume.skills.join(', '),
      '\nEXPERIENCE',
      ...resume.experience.map(e => (
        `\n${e.role} - ${e.company} (${e.duration})\n` +
        e.bullets.map(b => `* ${b}`).join('\n')
      )),
      '\nPROJECTS',
      ...resume.projects.map(p => (
        `\n${p.title} [${p.technologies}]\n${p.description}\n` +
        p.bullets.map(b => `* ${b}`).join('\n')
      )),
      '\nEDUCATION',
      ...resume.education.map(ed => `${ed.degree} - ${ed.school} (${ed.year})`)
    ].join('\n');

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resume.fullName.replace(/\s+/g, '_')}_Resume.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(resume, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resume.fullName.replace(/\s+/g, '_')}_Resume.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Compute live ATS score
  const hasContact = resume.fullName && resume.email && resume.phone;
  const wordCount = resume.summary.split(/\s+/).length +
    resume.experience.flatMap(e => e.bullets).join(' ').split(/\s+/).length;
  const atsScore = Math.min(100, Math.round(
    (hasContact ? 25 : 0) +
    (resume.skills.length >= 8 ? 25 : resume.skills.length * 3) +
    (resume.experience.length >= 2 ? 30 : resume.experience.length * 15) +
    (wordCount >= 100 ? 20 : 10)
  ));

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Action Bar - Hidden in Print */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-xs font-medium mb-1">
            <Layout size={14} />
            <span>Interactive ATS Resume Builder</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Resume Architect & Live Preview
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Template Switcher */}
          <div className="p-1 rounded-xl bg-surface-elevated/80 border border-white/10 flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setTemplate('modern')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                template === 'modern' ? 'bg-brand-cyan text-slate-900 font-bold' : 'text-text-secondary hover:text-white'
              }`}
            >
              Modern
            </button>
            <button
              onClick={() => setTemplate('minimal')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                template === 'minimal' ? 'bg-brand-cyan text-slate-900 font-bold' : 'text-text-secondary hover:text-white'
              }`}
            >
              Minimal
            </button>
            <button
              onClick={() => setTemplate('executive')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                template === 'executive' ? 'bg-brand-cyan text-slate-900 font-bold' : 'text-text-secondary hover:text-white'
              }`}
            >
              Executive
            </button>
          </div>

          <button
            onClick={exportTxt}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download size={14} />
            <span>ATS Plaintext</span>
          </button>

          <button
            onClick={exportJson}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download size={14} />
            <span>JSON</span>
          </button>

          <GlassButton
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-semibold"
          >
            <Printer size={14} />
            <span>Print / Save PDF</span>
          </GlassButton>
        </div>
      </div>

      {/* Main Grid: Left Editor + Right Live Document */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: EDITABLE FORM (Hidden when printing) */}
        <div className="lg:col-span-5 space-y-6 print:hidden">
          {/* ATS Gauge Card */}
          <GlassCard className="p-4 border-brand-cyan/20 bg-brand-cyan/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-cyan/15 flex items-center justify-center text-brand-cyan font-black text-lg">
                {atsScore}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Real-time ATS Health Score
                </h4>
                <p className="text-[11px] text-text-muted">
                  Scored on section integrity, action verbs, and skill density
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-brand-cyan">
              {atsScore >= 80 ? 'ATS Optimized' : 'Needs Expansion'}
            </span>
          </GlassCard>

          {/* Contact Details */}
          <GlassCard className="p-5 space-y-4 border-white/10">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              1. Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Full Name"
                value={resume.fullName}
                onChange={e => setResume({ ...resume, fullName: e.target.value })}
                className="bg-surface-elevated border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={resume.email}
                onChange={e => setResume({ ...resume, email: e.target.value })}
                className="bg-surface-elevated border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={resume.phone}
                onChange={e => setResume({ ...resume, phone: e.target.value })}
                className="bg-surface-elevated border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Location (City, State)"
                value={resume.location}
                onChange={e => setResume({ ...resume, location: e.target.value })}
                className="bg-surface-elevated border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                placeholder="LinkedIn URL"
                value={resume.linkedin}
                onChange={e => setResume({ ...resume, linkedin: e.target.value })}
                className="bg-surface-elevated border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                placeholder="GitHub or Portfolio"
                value={resume.github}
                onChange={e => setResume({ ...resume, github: e.target.value })}
                className="bg-surface-elevated border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </GlassCard>

          {/* Professional Summary */}
          <GlassCard className="p-5 space-y-3 border-white/10">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              2. Executive Summary
            </h3>
            <textarea
              rows={4}
              value={resume.summary}
              onChange={e => setResume({ ...resume, summary: e.target.value })}
              className="w-full bg-surface-elevated border border-white/10 rounded-xl p-3 text-xs text-white resize-y"
            />
          </GlassCard>

          {/* Technical Skills */}
          <GlassCard className="p-5 space-y-3 border-white/10">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              3. Technical Skills
            </h3>
            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                type="text"
                placeholder="Add skill (e.g. Docker, GraphQL)"
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                className="flex-1 bg-surface-elevated border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-brand-cyan/20 text-brand-cyan text-xs font-semibold hover:bg-brand-cyan/30"
              >
                Add
              </button>
            </form>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {resume.skills.map(s => (
                <span
                  key={s}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-text-secondary flex items-center gap-1.5"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(s)}
                    className="hover:text-rose-400 text-text-muted"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </GlassCard>

          {/* Experience Section */}
          <GlassCard className="p-5 space-y-4 border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                4. Work Experience
              </h3>
              <button
                type="button"
                onClick={addExperience}
                className="text-xs text-brand-cyan hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Add Role
              </button>
            </div>

            <div className="space-y-4">
              {resume.experience.map(exp => (
                <div key={exp.id} className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <input
                      type="text"
                      value={exp.role}
                      onChange={e => updateExperience(exp.id, 'role', e.target.value)}
                      placeholder="Role Title"
                      className="bg-transparent text-xs font-bold text-white border-b border-white/10 focus:border-brand-cyan outline-none pb-0.5"
                    />
                    <button
                      type="button"
                      onClick={() => removeExperience(exp.id)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={exp.company}
                      onChange={e => updateExperience(exp.id, 'company', e.target.value)}
                      placeholder="Company"
                      className="bg-transparent text-xs text-text-muted border-b border-white/10 outline-none pb-0.5"
                    />
                    <input
                      type="text"
                      value={exp.duration}
                      onChange={e => updateExperience(exp.id, 'duration', e.target.value)}
                      placeholder="Duration"
                      className="bg-transparent text-xs text-text-muted border-b border-white/10 outline-none pb-0.5 text-right"
                    />
                  </div>
                  <textarea
                    rows={3}
                    value={exp.bullets.join('\n')}
                    onChange={e => updateExperience(exp.id, 'bullets', e.target.value.split('\n'))}
                    placeholder="Enter bullet points (one per line)"
                    className="w-full bg-surface-elevated/60 border border-white/5 rounded-lg p-2 text-xs text-text-secondary resize-y"
                  />
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Projects & Education */}
          <GlassCard className="p-5 space-y-4 border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                5. Key Projects
              </h3>
              <button
                type="button"
                onClick={addProject}
                className="text-xs text-brand-cyan hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Add Project
              </button>
            </div>
            {resume.projects.map(proj => (
              <div key={proj.id} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    value={proj.title}
                    onChange={e => setResume(prev => ({
                      ...prev,
                      projects: prev.projects.map(p => p.id === proj.id ? { ...p, title: e.target.value } : p)
                    }))}
                    placeholder="Project Title"
                    className="bg-transparent text-xs font-bold text-white border-b border-white/10 outline-none pb-0.5"
                  />
                  <button
                    type="button"
                    onClick={() => removeProject(proj.id)}
                    className="text-rose-400 p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <input
                  type="text"
                  value={proj.technologies}
                  onChange={e => setResume(prev => ({
                    ...prev,
                    projects: prev.projects.map(p => p.id === proj.id ? { ...p, technologies: e.target.value } : p)
                  }))}
                  placeholder="Technologies used"
                  className="w-full bg-transparent text-xs text-text-muted border-b border-white/10 outline-none pb-0.5"
                />
              </div>
            ))}
          </GlassCard>
        </div>

        {/* RIGHT COLUMN: LIVE ATS PREVIEW SHEET */}
        <div className="lg:col-span-7 sticky top-24">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl p-8 sm:p-12 font-sans min-h-[842px] print:shadow-none print:p-0 print:m-0 print:rounded-none">
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-4">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase text-slate-900">
                {resume.fullName || 'YOUR NAME'}
              </h1>
              <div className="text-xs font-medium text-slate-600 flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                {resume.email && <span>{resume.email}</span>}
                {resume.phone && <span>• {resume.phone}</span>}
                {resume.location && <span>• {resume.location}</span>}
                {resume.linkedin && <span>• {resume.linkedin}</span>}
                {resume.github && <span>• {resume.github}</span>}
              </div>
            </div>

            {/* Summary */}
            {resume.summary && (
              <div className="mb-4">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
                  Professional Summary
                </h2>
                <p className="text-xs leading-relaxed text-slate-700">
                  {resume.summary}
                </p>
              </div>
            )}

            {/* Technical Skills */}
            {resume.skills.length > 0 && (
              <div className="mb-4">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
                  Technical Skills
                </h2>
                <p className="text-xs leading-relaxed text-slate-700">
                  {resume.skills.join(' • ')}
                </p>
              </div>
            )}

            {/* Work Experience */}
            {resume.experience.length > 0 && (
              <div className="mb-4">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-2">
                  Professional Experience
                </h2>
                <div className="space-y-3">
                  {resume.experience.map(exp => (
                    <div key={exp.id} className="space-y-1">
                      <div className="flex justify-between items-baseline text-xs font-bold text-slate-900">
                        <span>{exp.role} — <span className="font-semibold text-slate-700">{exp.company}</span></span>
                        <span className="text-[11px] font-medium text-slate-500">{exp.duration}</span>
                      </div>
                      <ul className="list-disc list-outside pl-4 space-y-0.5 text-xs text-slate-700 leading-relaxed">
                        {exp.bullets.filter(b => b.trim()).map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {resume.projects.length > 0 && (
              <div className="mb-4">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-2">
                  Featured Projects
                </h2>
                <div className="space-y-2.5">
                  {resume.projects.map(proj => (
                    <div key={proj.id} className="space-y-0.5">
                      <div className="flex justify-between items-baseline text-xs font-bold text-slate-900">
                        <span>{proj.title} <span className="font-normal text-slate-500">[{proj.technologies}]</span></span>
                      </div>
                      {proj.description && (
                        <p className="text-xs text-slate-700 italic">{proj.description}</p>
                      )}
                      {proj.bullets && proj.bullets.length > 0 && (
                        <ul className="list-disc list-outside pl-4 space-y-0.5 text-xs text-slate-700 leading-relaxed">
                          {proj.bullets.filter(b => b.trim()).map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {resume.education.length > 0 && (
              <div className="mb-4">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
                  Education
                </h2>
                <div className="space-y-1.5">
                  {resume.education.map(ed => (
                    <div key={ed.id} className="flex justify-between text-xs text-slate-800">
                      <div>
                        <span className="font-bold">{ed.degree}</span> — {ed.school}
                        {ed.gpa && <span className="text-slate-500 text-[11px]"> (GPA: {ed.gpa})</span>}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">{ed.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
