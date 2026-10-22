import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../glass/Logo';
import { GlassButton } from '../glass/GlassButton';
import { 
  Menu, X, Sparkles, LayoutDashboard, FileUp, 
  Briefcase, Compass, History, User, LogOut, ChevronRight,
  Mic, Wand2, Layout, Kanban
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 sm:px-6 pt-3 pointer-events-none">
      <nav className="w-full max-w-6xl rounded-xl bg-[#0D0F14]/85 backdrop-blur-md border border-white/10 shadow-card px-4 sm:px-5 py-2 flex items-center justify-between pointer-events-auto transition-all duration-200">
        {/* Logo */}
        <Logo />

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          {!isAuthenticated ? (
            <>
              <Link
                to="/"
                className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-all duration-150 ${
                  isActive('/') ? 'text-white bg-white/[0.08]' : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Home
              </Link>
              <a
                href="/#features"
                className="px-3 py-1.5 text-xs lg:text-sm font-medium text-text-secondary hover:text-white hover:bg-white/[0.04] rounded-lg transition-all duration-150"
              >
                Features
              </a>
              <a
                href="/#how-it-works"
                className="px-3 py-1.5 text-xs lg:text-sm font-medium text-text-secondary hover:text-white hover:bg-white/[0.04] rounded-lg transition-all duration-150"
              >
                Workflow
              </a>
              <Link
                to="/jobs"
                className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-all duration-150 ${
                  isActive('/jobs') ? 'text-white bg-white/[0.08]' : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Jobs
              </Link>
              <a
                href="/#faq"
                className="px-3 py-1.5 text-xs lg:text-sm font-medium text-text-secondary hover:text-white hover:bg-white/[0.04] rounded-lg transition-all duration-150"
              >
                FAQ
              </a>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className={`px-2.5 py-1.5 text-xs lg:text-sm font-medium rounded-lg flex items-center gap-1.5 transition-all duration-150 ${
                  isActive('/dashboard') ? 'text-white bg-white/[0.08]' : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <LayoutDashboard size={14} className="opacity-80" />
                Dashboard
              </Link>
              <Link
                to="/analyze"
                className={`px-2.5 py-1.5 text-xs lg:text-sm font-medium rounded-lg flex items-center gap-1.5 transition-all duration-150 ${
                  isActive('/analyze') ? 'text-white bg-white/[0.08]' : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <FileUp size={14} className="opacity-80" />
                Analyze
              </Link>
              <Link
                to="/jobs"
                className={`px-2.5 py-1.5 text-xs lg:text-sm font-medium rounded-lg flex items-center gap-1.5 transition-all duration-150 ${
                  isActive('/jobs') ? 'text-white bg-white/[0.08]' : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Briefcase size={14} className="opacity-80" />
                Jobs
              </Link>
              <Link
                to="/roadmap"
                className={`px-2.5 py-1.5 text-xs lg:text-sm font-medium rounded-lg flex items-center gap-1.5 transition-all duration-150 ${
                  isActive('/roadmap') ? 'text-white bg-white/[0.08]' : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Compass size={14} className="opacity-80" />
                Roadmap
              </Link>
              <Link
                to="/interview"
                className={`px-2.5 py-1.5 text-xs lg:text-sm font-medium rounded-lg flex items-center gap-1.5 transition-all duration-150 ${
                  isActive('/interview') ? 'text-white bg-white/[0.08]' : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Mic size={14} className="opacity-80" />
                Interview
              </Link>
              <Link
                to="/tools"
                className={`px-2.5 py-1.5 text-xs lg:text-sm font-medium rounded-lg flex items-center gap-1.5 transition-all duration-150 ${
                  isActive('/tools') ? 'text-white bg-white/[0.08]' : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Wand2 size={14} className="opacity-80" />
                AI Tools
              </Link>
              <Link
                to="/builder"
                className={`px-2.5 py-1.5 text-xs lg:text-sm font-medium rounded-lg flex items-center gap-1.5 transition-all duration-150 ${
                  isActive('/builder') ? 'text-white bg-white/[0.08]' : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Layout size={14} className="opacity-80" />
                Builder
              </Link>
              <Link
                to="/tracker"
                className={`px-2.5 py-1.5 text-xs lg:text-sm font-medium rounded-lg flex items-center gap-1.5 transition-all duration-150 ${
                  isActive('/tracker') ? 'text-white bg-white/[0.08]' : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Kanban size={14} className="opacity-80" />
                Tracker
              </Link>
              <Link
                to="/history"
                className={`px-2.5 py-1.5 text-xs lg:text-sm font-medium rounded-lg flex items-center gap-1.5 transition-all duration-150 ${
                  isActive('/history') ? 'text-white bg-white/[0.08]' : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <History size={14} className="opacity-80" />
                History
              </Link>
            </>
          )}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-2">
          {!isAuthenticated ? (
            <>
              <Link to="/login">
                <GlassButton variant="ghost" size="sm">
                  Sign In
                </GlassButton>
              </Link>
              <Link to="/analyze">
                <GlassButton variant="primary" size="sm" icon={<Sparkles size={13} />}>
                  Analyze Resume
                </GlassButton>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/profile" className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all">
                <div className="w-5 h-5 rounded-md bg-white/10 text-zinc-200 flex items-center justify-center font-semibold text-[11px] font-mono">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-medium text-white max-w-[100px] truncate">{user?.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-1.5 rounded-lg text-text-secondary hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded-lg text-text-secondary hover:text-white bg-white/[0.05] hover:bg-white/[0.1] transition-all cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {/* Mobile Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 inset-x-4 bg-[#111318]/95 backdrop-blur-md rounded-xl p-4 shadow-elevated border border-white/10 pointer-events-auto flex flex-col gap-2 animate-in fade-in duration-150">
          {!isAuthenticated ? (
            <>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/[0.06] flex items-center justify-between"
              >
                <span>Home</span>
                <ChevronRight size={14} className="text-text-muted" />
              </Link>
              <Link
                to="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/[0.06] flex items-center justify-between"
              >
                <span>Explore Jobs</span>
                <ChevronRight size={14} className="text-text-muted" />
              </Link>
              <a
                href="/#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/[0.06] flex items-center justify-between"
              >
                <span>Features</span>
                <ChevronRight size={14} className="text-text-muted" />
              </a>
              <a
                href="/#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/[0.06] flex items-center justify-between"
              >
                <span>Workflow</span>
                <ChevronRight size={14} className="text-text-muted" />
              </a>
              <div className="h-px bg-white/10 my-1" />
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <GlassButton variant="secondary" className="w-full">
                  Sign In
                </GlassButton>
              </Link>
              <Link to="/analyze" onClick={() => setMobileMenuOpen(false)}>
                <GlassButton variant="primary" className="w-full" icon={<Sparkles size={14} />}>
                  Analyze Resume
                </GlassButton>
              </Link>
            </>
          ) : (
            <>
              <div className="px-3 py-2 mb-1 flex items-center gap-2.5 bg-white/[0.03] rounded-lg border border-white/5">
                <div className="w-7 h-7 rounded-md bg-white/10 text-white flex items-center justify-center font-bold text-xs font-mono">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="truncate">
                  <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
                  <div className="text-xs text-text-secondary truncate">{user?.email}</div>
                </div>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/[0.06] flex items-center gap-2.5"
              >
                <LayoutDashboard size={16} className="text-zinc-400" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/analyze"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/[0.06] flex items-center gap-2.5"
              >
                <FileUp size={16} className="text-zinc-400" />
                <span>Analyze Resume</span>
              </Link>
              <Link
                to="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/[0.06] flex items-center gap-2.5"
              >
                <Briefcase size={16} className="text-zinc-400" />
                <span>Job Recommendations</span>
              </Link>
              <Link
                to="/roadmap"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/[0.06] flex items-center gap-2.5"
              >
                <Compass size={16} className="text-zinc-400" />
                <span>Career Roadmap</span>
              </Link>
              <Link
                to="/interview"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/[0.06] flex items-center gap-2.5"
              >
                <Mic size={16} className="text-zinc-400" />
                <span>Mock Interview</span>
              </Link>
              <Link
                to="/tools"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/[0.06] flex items-center gap-2.5"
              >
                <Wand2 size={16} className="text-zinc-400" />
                <span>Cover Letter & LinkedIn</span>
              </Link>
              <Link
                to="/builder"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/[0.06] flex items-center gap-2.5"
              >
                <Layout size={16} className="text-zinc-400" />
                <span>Resume Builder</span>
              </Link>
              <Link
                to="/tracker"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/[0.06] flex items-center gap-2.5"
              >
                <Kanban size={16} className="text-zinc-400" />
                <span>Application Tracker</span>
              </Link>
              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/[0.06] flex items-center gap-2.5"
              >
                <History size={16} className="text-zinc-400" />
                <span>Analysis History</span>
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/[0.06] flex items-center gap-2.5"
              >
                <User size={16} className="text-zinc-400" />
                <span>My Profile</span>
              </Link>
              <div className="h-px bg-white/10 my-1" />
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-rose-500/10 text-rose-400 flex items-center gap-2.5 text-left cursor-pointer"
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
