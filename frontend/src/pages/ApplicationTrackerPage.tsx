import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { JobApplication, ApplicationStatus, ApplicationPriority, ApplicationStats } from '../types';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { 
  Kanban, Plus, Search, Filter, Calendar, MapPin, Building2, 
  ExternalLink, Mic, Wand2, Edit3, Trash2, ArrowRight, ArrowLeft, 
  Trophy, CheckCircle2, Clock, AlertCircle, Download, FileSpreadsheet,
  ListFilter, Sparkles, Layers, ChevronDown, X
} from 'lucide-react';

interface ColumnConfig {
  id: ApplicationStatus;
  title: string;
  badgeColor: string;
  borderColor: string;
  headerGlow: string;
  icon: React.ReactNode;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'saved',
    title: 'Wishlist & Saved',
    badgeColor: 'text-brand-cyan bg-cyan-500/10 border-cyan-500/20',
    borderColor: 'border-cyan-500/20 hover:border-cyan-500/40',
    headerGlow: 'from-cyan-500/10 to-transparent',
    icon: <Clock size={16} className="text-brand-cyan" />
  },
  {
    id: 'applied',
    title: 'Applied',
    badgeColor: 'text-brand-blue bg-blue-500/10 border-blue-500/20',
    borderColor: 'border-blue-500/20 hover:border-blue-500/40',
    headerGlow: 'from-blue-500/10 to-transparent',
    icon: <CheckCircle2 size={16} className="text-brand-blue" />
  },
  {
    id: 'interviewing',
    title: 'Interviewing',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    borderColor: 'border-purple-500/20 hover:border-purple-500/40',
    headerGlow: 'from-purple-500/10 to-transparent',
    icon: <Mic size={16} className="text-purple-400" />
  },
  {
    id: 'offer',
    title: 'Offer Received',
    badgeColor: 'text-brand-mint bg-emerald-500/10 border-emerald-500/20',
    borderColor: 'border-emerald-500/20 hover:border-emerald-500/40',
    headerGlow: 'from-emerald-500/10 to-transparent',
    icon: <Trophy size={16} className="text-brand-mint" />
  },
  {
    id: 'rejected',
    title: 'Archived / Rejected',
    badgeColor: 'text-text-muted bg-white/5 border-white/10',
    borderColor: 'border-white/10 hover:border-white/20',
    headerGlow: 'from-white/5 to-transparent',
    icon: <AlertCircle size={16} className="text-text-muted" />
  }
];

export const ApplicationTrackerPage: React.FC = () => {
  const navigate = useNavigate();

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    saved: 0,
    applied: 0,
    interviewing: 0,
    offer: 0,
    rejected: 0,
    conversion_rate: 0
  });
  const [upcomingInterviews, setUpcomingInterviews] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & View Mode
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | ApplicationPriority>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    location: 'Remote',
    job_type: 'Full-time',
    status: 'saved' as ApplicationStatus,
    priority: 'medium' as ApplicationPriority,
    salary_range: '',
    url: '',
    contact_name: '',
    contact_email: '',
    notes: '',
    next_step: '',
    applied_date: '',
    interview_date: '',
    deadline: ''
  });

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const res = await api.getApplications({
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        search: search.trim() || undefined
      });
      setApplications(res.applications);
      setStats(res.stats);
      setUpcomingInterviews(res.upcoming_interviews || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [priorityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications();
  };

  const handleOpenAddModal = (defaultStatus: ApplicationStatus = 'saved') => {
    setEditingApp(null);
    setFormData({
      company: '',
      role: '',
      location: 'Remote',
      job_type: 'Full-time',
      status: defaultStatus,
      priority: 'medium',
      salary_range: '',
      url: '',
      contact_name: '',
      contact_email: '',
      notes: '',
      next_step: '',
      applied_date: defaultStatus === 'applied' ? new Date().toISOString().split('T')[0] : '',
      interview_date: '',
      deadline: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (app: JobApplication) => {
    setEditingApp(app);
    setFormData({
      company: app.company,
      role: app.role,
      location: app.location || 'Remote',
      job_type: app.job_type || 'Full-time',
      status: app.status,
      priority: app.priority,
      salary_range: app.salary_range || '',
      url: app.url || '',
      contact_name: app.contact_name || '',
      contact_email: app.contact_email || '',
      notes: app.notes || '',
      next_step: app.next_step || '',
      applied_date: app.applied_date ? app.applied_date.substring(0, 10) : '',
      interview_date: app.interview_date ? app.interview_date.substring(0, 16) : '',
      deadline: app.deadline ? app.deadline.substring(0, 10) : ''
    });
    setIsModalOpen(true);
  };

  const handleSaveApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.role) return;

    setIsSubmitting(true);
    try {
      if (editingApp) {
        await api.updateApplication(editingApp.id, formData);
      } else {
        await api.createApplication(formData);
      }
      setIsModalOpen(false);
      fetchApplications();
    } catch (err) {
      console.error('Failed to save application:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (appId: number, newStatus: ApplicationStatus) => {
    // Optimistic UI update
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    try {
      await api.updateApplication(appId, { status: newStatus });
      fetchApplications();
    } catch (err) {
      console.error('Failed to update stage:', err);
      fetchApplications();
    }
  };

  const handleDeleteApplication = async (appId: number, company: string) => {
    if (!window.confirm(`Remove ${company} from your application tracker?`)) return;
    try {
      await api.deleteApplication(appId);
      setApplications(prev => prev.filter(a => a.id !== appId));
      fetchApplications();
    } catch (err) {
      console.error('Failed to delete application:', err);
    }
  };

  const handleSeedSamples = async () => {
    try {
      setIsLoading(true);
      await api.seedSampleApplications();
      fetchApplications();
    } catch (err) {
      console.error('Failed to seed sample applications:', err);
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (applications.length === 0) return;
    const headers = ['Company', 'Role', 'Status', 'Priority', 'Location', 'Salary Range', 'Next Step', 'Interview Date', 'Applied Date', 'URL', 'Notes'];
    const rows = applications.map(a => [
      `"${a.company.replace(/"/g, '""')}"`,
      `"${a.role.replace(/"/g, '""')}"`,
      a.status,
      a.priority,
      `"${(a.location || '').replace(/"/g, '""')}"`,
      `"${(a.salary_range || '').replace(/"/g, '""')}"`,
      `"${(a.next_step || '').replace(/"/g, '""')}"`,
      a.interview_date || '',
      a.applied_date || '',
      `"${(a.url || '').replace(/"/g, '""')}"`,
      `"${(a.notes || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `meresumax_applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    if (applications.length === 0) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(applications, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `meresumax_pipeline_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Group applications by status for Kanban
  const groupedApps = useMemo(() => {
    const groups: Record<ApplicationStatus, JobApplication[]> = {
      saved: [],
      applied: [],
      interviewing: [],
      offer: [],
      rejected: []
    };
    applications.forEach(a => {
      if (groups[a.status]) {
        groups[a.status].push(a);
      } else {
        groups.saved.push(a);
      }
    });
    return groups;
  }, [applications]);

  const getPriorityBadge = (priority: ApplicationPriority) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">Medium</span>;
      case 'low':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">Low</span>;
    }
  };

  const formatInterviewDate = (isoStr?: string | null) => {
    if (!isoStr) return null;
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-20 relative z-10">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass text-xs font-semibold uppercase tracking-wider text-brand-cyan mb-2">
            <Kanban size={13} />
            <span>Application Pipeline</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Job Application Tracker
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1 max-w-2xl">
            Track opportunities from discovery to signed offer. Manage interview schedules, next steps, and launch instant AI mock interviews with 1-click.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {applications.length === 0 && (
            <GlassButton variant="ghost" size="sm" onClick={handleSeedSamples} icon={<Sparkles size={14} />}>
              Seed Demo Pipeline
            </GlassButton>
          )}

          <div className="flex items-center rounded-xl bg-white/5 border border-white/10 p-0.5">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'kanban' ? 'bg-brand-blue/30 text-white shadow-sm' : 'text-text-muted hover:text-white'
              }`}
            >
              <Kanban size={13} />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table' ? 'bg-brand-blue/30 text-white shadow-sm' : 'text-text-muted hover:text-white'
              }`}
            >
              <ListFilter size={13} />
              <span>Table</span>
            </button>
          </div>

          <GlassButton variant="primary" size="sm" onClick={() => handleOpenAddModal('saved')} icon={<Plus size={15} />}>
            New Application
          </GlassButton>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <GlassCard variant="standard" className="p-4 flex items-center gap-3.5 border-white/10">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-brand-cyan">
            <Layers size={20} />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats.total}</div>
            <div className="text-xs text-text-muted">Total Opportunities</div>
          </div>
        </GlassCard>

        <GlassCard variant="standard" className="p-4 flex items-center gap-3.5 border-purple-500/20">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Mic size={20} />
          </div>
          <div>
            <div className="text-2xl font-black text-white flex items-center gap-1.5">
              <span>{stats.interviewing}</span>
              {stats.interviewing > 0 && <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />}
            </div>
            <div className="text-xs text-text-muted">Active Interviews</div>
          </div>
        </GlassCard>

        <GlassCard variant="standard" className="p-4 flex items-center gap-3.5 border-emerald-500/20">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-brand-mint">
            <Trophy size={20} />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats.offer}</div>
            <div className="text-xs text-text-muted">Offers Secured</div>
          </div>
        </GlassCard>

        <GlassCard variant="standard" className="p-4 flex items-center gap-3.5 border-blue-500/20">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-brand-blue">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats.conversion_rate}%</div>
            <div className="text-xs text-text-muted">Applied-to-Interview</div>
          </div>
        </GlassCard>
      </div>

      {/* Upcoming Interviews Alert Banner */}
      {upcomingInterviews.length > 0 && (
        <div className="mb-8 p-4 rounded-2xl liquid-glass border border-purple-500/30 bg-purple-950/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-glow-purple">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-purple-300">
                Upcoming Interview Scheduled
              </div>
              <div className="text-sm font-semibold text-white">
                {upcomingInterviews[0].company} - {upcomingInterviews[0].role}
                <span className="text-purple-300 font-normal ml-2">
                  ({formatInterviewDate(upcomingInterviews[0].interview_date)})
                </span>
              </div>
            </div>
          </div>

          <GlassButton
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/interview?role=${encodeURIComponent(upcomingInterviews[0].role)}`)}
            icon={<Mic size={14} />}
          >
            Launch Mock Interview Prep
          </GlassButton>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <GlassCard variant="standard" className="p-4 mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company, role, or note..."
              className="w-full pl-9 pr-4 py-2 rounded-xl liquid-input text-xs text-white placeholder-text-muted focus:outline-none focus:border-brand-blue/50"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-text-muted" />
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <Filter size={13} />
              <span>Priority:</span>
            </div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl liquid-input text-xs text-white bg-transparent focus:outline-none"
            >
              <option value="all" className="bg-surface-elevated text-white">All Priorities</option>
              <option value="high" className="bg-surface-elevated text-white">High Priority</option>
              <option value="medium" className="bg-surface-elevated text-white">Medium Priority</option>
              <option value="low" className="bg-surface-elevated text-white">Low Priority</option>
            </select>

            {/* Export Buttons */}
            <button
              onClick={handleExportCSV}
              title="Export to CSV"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white border border-white/10 transition-colors"
            >
              <FileSpreadsheet size={15} />
            </button>
            <button
              onClick={handleExportJSON}
              title="Export to JSON"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white border border-white/10 transition-colors"
            >
              <Download size={15} />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Main Content Area: Kanban vs Table */}
      {isLoading ? (
        <div className="p-16 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-brand-cyan/20 border-t-brand-cyan animate-spin" />
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
          {COLUMNS.map((col) => {
            const columnApps = groupedApps[col.id] || [];
            return (
              <div 
                key={col.id} 
                className="flex flex-col rounded-2xl liquid-glass border border-white/10 overflow-hidden min-h-[580px] bg-surface-card/40"
              >
                {/* Column Header */}
                <div className={`p-3.5 border-b border-white/5 bg-gradient-to-b ${col.headerGlow} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    {col.icon}
                    <h2 className="text-xs font-bold text-white tracking-wide">{col.title}</h2>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${col.badgeColor}`}>
                      {columnApps.length}
                    </span>
                    <button
                      onClick={() => handleOpenAddModal(col.id)}
                      className="p-1 rounded-md text-text-muted hover:text-white hover:bg-white/10 transition-colors"
                      title={`Add to ${col.title}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="p-2.5 flex-1 flex flex-col gap-2.5 overflow-y-auto">
                  {columnApps.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/5 rounded-xl my-4">
                      <p className="text-xs text-text-muted">No applications in this stage</p>
                      <button
                        onClick={() => handleOpenAddModal(col.id)}
                        className="text-[11px] text-brand-cyan font-semibold hover:underline mt-2 flex items-center gap-1"
                      >
                        <Plus size={12} />
                        Add opportunity
                      </button>
                    </div>
                  ) : (
                    columnApps.map((app) => (
                      <GlassCard
                        key={app.id}
                        variant="subtle"
                        className={`p-3.5 transition-all duration-200 border ${col.borderColor} hover:translate-y-[-2px] relative group`}
                      >
                        {/* Priority & Quick Actions */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          {getPriorityBadge(app.priority)}

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEditModal(app)}
                              className="p-1 rounded text-text-muted hover:text-brand-cyan hover:bg-white/5 transition-colors"
                              title="Edit application"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteApplication(app.id, app.company)}
                              className="p-1 rounded text-text-muted hover:text-rose-400 hover:bg-white/5 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Title & Company */}
                        <div className="text-sm font-bold text-white leading-tight">
                          {app.role}
                        </div>
                        <div className="text-xs text-brand-cyan font-medium flex items-center gap-1 mt-1">
                          <Building2 size={12} />
                          <span>{app.company}</span>
                        </div>

                        {/* Location & Salary */}
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-text-muted">
                          {app.location && (
                            <div className="flex items-center gap-1">
                              <MapPin size={11} />
                              <span>{app.location}</span>
                            </div>
                          )}
                          {app.salary_range && (
                            <span className="text-brand-mint font-semibold">
                              {app.salary_range}
                            </span>
                          )}
                        </div>

                        {/* Scheduled Interview Alert */}
                        {app.interview_date && (
                          <div className="mt-2.5 p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300 flex items-center gap-1.5">
                            <Calendar size={12} className="shrink-0" />
                            <span className="font-semibold">{formatInterviewDate(app.interview_date)}</span>
                          </div>
                        )}

                        {/* Next Step Note */}
                        {app.next_step && (
                          <div className="mt-2 text-[11px] text-text-secondary bg-white/5 p-2 rounded-lg border border-white/5">
                            <span className="text-white font-medium">Next: </span>
                            {app.next_step}
                          </div>
                        )}

                        {/* Direct Tools Shortcut Links */}
                        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => navigate(`/interview?role=${encodeURIComponent(app.role)}`)}
                              className="p-1 rounded text-text-muted hover:text-purple-300 hover:bg-purple-500/10 transition-colors"
                              title="Practice Mock Interview"
                            >
                              <Mic size={13} />
                            </button>
                            <button
                              onClick={() => navigate(`/tools?role=${encodeURIComponent(app.role)}&company=${encodeURIComponent(app.company)}`)}
                              className="p-1 rounded text-text-muted hover:text-blue-300 hover:bg-blue-500/10 transition-colors"
                              title="Tailor Cover Letter"
                            >
                              <Wand2 size={13} />
                            </button>
                            {app.url && (
                              <a
                                href={app.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded text-text-muted hover:text-brand-cyan hover:bg-cyan-500/10 transition-colors"
                                title="Open Job URL"
                              >
                                <ExternalLink size={13} />
                              </a>
                            )}
                          </div>

                          {/* Stage Transition Control */}
                          <div className="flex items-center gap-1">
                            {col.id !== 'saved' && (
                              <button
                                onClick={() => {
                                  const idx = COLUMNS.findIndex(c => c.id === col.id);
                                  if (idx > 0) handleStatusChange(app.id, COLUMNS[idx - 1].id);
                                }}
                                className="p-1 rounded bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors"
                                title="Move Back"
                              >
                                <ArrowLeft size={11} />
                              </button>
                            )}

                            {col.id !== 'rejected' && (
                              <button
                                onClick={() => {
                                  const idx = COLUMNS.findIndex(c => c.id === col.id);
                                  if (idx < COLUMNS.length - 1) handleStatusChange(app.id, COLUMNS[idx + 1].id);
                                }}
                                className="p-1 rounded bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors"
                                title="Advance Stage"
                              >
                                <ArrowRight size={11} />
                              </button>
                            )}
                          </div>
                        </div>
                      </GlassCard>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE / LIST VIEW */
        <GlassCard variant="standard" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-text-secondary">
              <thead className="border-b border-white/10 bg-white/5 uppercase text-[10px] text-text-muted tracking-wider">
                <tr>
                  <th className="py-3 px-4">Company & Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Compensation</th>
                  <th className="py-3 px-4">Next Step / Interview</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-text-muted">
                      No matching job applications found.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-sm">{app.role}</div>
                        <div className="text-brand-cyan text-xs font-medium">{app.company}</div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                          className="bg-surface-card border border-white/10 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none"
                        >
                          <option value="saved">Wishlist & Saved</option>
                          <option value="applied">Applied</option>
                          <option value="interviewing">Interviewing</option>
                          <option value="offer">Offer Received</option>
                          <option value="rejected">Archived / Rejected</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        {getPriorityBadge(app.priority)}
                      </td>
                      <td className="py-3 px-4 text-white">
                        {app.location || 'Remote'}
                      </td>
                      <td className="py-3 px-4 text-brand-mint font-semibold">
                        {app.salary_range || '—'}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        {app.interview_date ? (
                          <div className="text-purple-300 font-semibold flex items-center gap-1">
                            <Calendar size={12} />
                            <span>{formatInterviewDate(app.interview_date)}</span>
                          </div>
                        ) : (
                          <div className="truncate text-text-secondary">{app.next_step || '—'}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/interview?role=${encodeURIComponent(app.role)}`)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-purple-300 hover:bg-purple-500/10 transition-colors"
                            title="Mock Interview"
                          >
                            <Mic size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(app)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-brand-cyan hover:bg-cyan-500/10 transition-colors"
                            title="Edit"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteApplication(app.id, app.company)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* ADD / EDIT GLASS MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <GlassCard variant="elevated" className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border-white/20">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingApp ? 'Edit Job Application' : 'Track New Opportunity'}
                </h3>
                <p className="text-xs text-text-secondary">
                  Fill in the role details to keep your pipeline accurate.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-text-muted hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveApplication} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Stripe, Google, Airbnb"
                    className="w-full px-3 py-2 rounded-xl liquid-input text-xs text-white placeholder-text-muted focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Role Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full px-3 py-2 rounded-xl liquid-input text-xs text-white placeholder-text-muted focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Pipeline Stage</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                    className="w-full px-3 py-2 rounded-xl liquid-input text-xs text-white bg-transparent focus:outline-none"
                  >
                    <option value="saved" className="bg-surface-elevated text-white">Wishlist & Saved</option>
                    <option value="applied" className="bg-surface-elevated text-white">Applied</option>
                    <option value="interviewing" className="bg-surface-elevated text-white">Interviewing</option>
                    <option value="offer" className="bg-surface-elevated text-white">Offer Received</option>
                    <option value="rejected" className="bg-surface-elevated text-white">Archived / Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as ApplicationPriority })}
                    className="w-full px-3 py-2 rounded-xl liquid-input text-xs text-white bg-transparent focus:outline-none"
                  >
                    <option value="high" className="bg-surface-elevated text-white">High Priority</option>
                    <option value="medium" className="bg-surface-elevated text-white">Medium Priority</option>
                    <option value="low" className="bg-surface-elevated text-white">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Remote / New York"
                    className="w-full px-3 py-2 rounded-xl liquid-input text-xs text-white placeholder-text-muted focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Salary Range / Target</label>
                  <input
                    type="text"
                    value={formData.salary_range}
                    onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                    placeholder="e.g. $140,000 - $165,000 or ₹20LPA"
                    className="w-full px-3 py-2 rounded-xl liquid-input text-xs text-white placeholder-text-muted focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Job Posting / Application Link</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl liquid-input text-xs text-white placeholder-text-muted focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Interview Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.interview_date}
                    onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl liquid-input text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Date Applied</label>
                  <input
                    type="date"
                    value={formData.applied_date}
                    onChange={(e) => setFormData({ ...formData, applied_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl liquid-input text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Contact / Recruiter Name</label>
                  <input
                    type="text"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    placeholder="e.g. Jessica Miller"
                    className="w-full px-3 py-2 rounded-xl liquid-input text-xs text-white placeholder-text-muted focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="recruiting@company.com"
                    className="w-full px-3 py-2 rounded-xl liquid-input text-xs text-white placeholder-text-muted focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Next Step Action</label>
                <input
                  type="text"
                  value={formData.next_step}
                  onChange={(e) => setFormData({ ...formData, next_step: e.target.value })}
                  placeholder="e.g. Prepare system design for 45-min panel with Director of Engineering"
                  className="w-full px-3 py-2 rounded-xl liquid-input text-xs text-white placeholder-text-muted focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Internal Notes & Strategy</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Recruiter notes, referral details, tech stack specifics..."
                  className="w-full px-3 py-2 rounded-xl liquid-input text-xs text-white placeholder-text-muted focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <GlassButton variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </GlassButton>
                <GlassButton variant="primary" size="sm" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingApp ? 'Update Application' : 'Track Application'}
                </GlassButton>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default ApplicationTrackerPage;
