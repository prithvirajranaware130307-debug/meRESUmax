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
    <header className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 sm:px-6 pt-4 pointer-events-none">
      <nav className="w-full max-w-6xl liquid-nav rounded-2xl px-4 sm:px-6 py-2.5 flex items-center justify-between pointer-events-auto transition-all duration-300">
        {/* Logo */}
        <Logo />

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {!isAuthenticated ? (
            <>
              <Link
                to="/"
                className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive('/') ? 'text-white bg-white/10' : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                Home
              </Link>
              <a
                href="/#features"
                className="px-3 py-1.5 text-xs lg:text-sm font-medium text-text-secondary hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
              >
                Features
              </a>
              <a
                href="/#how-it-works"
                className="px-3 py-1.5 text-xs lg:text-sm font-medium text-text-secondary hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
              >
                How It Works
              </a>
              <Link
                to="/jobs"
                className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive('/jobs') ? 'text-white bg-white/10' : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                Explore Jobs
              </Link>
              <a
                href="/#faq"
                className="px-3 py-1.5 text-xs lg:text-sm font-medium text-text-secondary hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
              >
                FAQ
              </a>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-xl flex items-center gap-1.5 transition-all duration-200 ${
                  isActive('/dashboard') ? 'text-white bg-white/10' : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
              <Link
                to="/analyze"
                className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-xl flex items-center gap-1.5 transition-all duration-200 ${
                  isActive('/analyze') ? 'text-white bg-white/10' : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <FileUp size={15} />
                Analyze
              </Link>
              <Link
                to="/jobs"
                className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-xl flex items-center gap-1.5 transition-all duration-200 ${
                  isActive('/jobs') ? 'text-white bg-white/10' : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <Briefcase size={15} />
                Jobs
              </Link>
              <Link
                to="/roadmap"
                className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-xl flex items-center gap-1.5 transition-all duration-200 ${
                  isActive('/roadmap') ? 'text-white bg-white/10' : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <Compass size={15} />
                Roadmap
              </Link>
              <Link
                to="/interview"
                className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-xl flex items-center gap-1.5 transition-all duration-200 ${
                  isActive('/interview') ? 'text-white bg-white/10' : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <Mic size={15} />
                Interview
              </Link>
              <Link
                to="/tools"
                className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-xl flex items-center gap-1.5 transition-all duration-200 ${
                  isActive('/tools') ? 'text-white bg-white/10' : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <Wand2 size={15} />
                AI Tools
              </Link>
              <Link
                to="/builder"
                className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-xl flex items-center gap-1.5 transition-all duration-200 ${
                  isActive('/builder') ? 'text-white bg-white/10' : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <Layout size={15} />
                Builder
              </Link>
              <Link
                to="/tracker"
                className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-xl flex items-center gap-1.5 transition-all duration-200 ${
                  isActive('/tracker') ? 'text-white bg-white/10' : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <Kanban size={15} />
                Tracker
              </Link>
              <Link
                to="/history"
                className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-xl flex items-center gap-1.5 transition-all duration-200 ${
                  isActive('/history') ? 'text-white bg-white/10' : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <History size={15} />
                History
              </Link>
            </>
          )}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          {!isAuthenticated ? (
            <>
              <Link to="/login">
                <GlassButton variant="ghost" size="sm">
                  Sign In
                </GlassButton>
              </Link>
              <Link to="/analyze">
                <GlassButton variant="primary" size="sm" icon={<Sparkles size={14} />}>
                  Analyze Resume
                </GlassButton>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
                <div className="w-6 h-6 rounded-full bg-brand-blue/20 text-brand-cyan flex items-center justify-center font-bold text-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-medium text-white max-w-[100px] truncate">{user?.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-2 rounded-xl text-text-secondary hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 transition-all"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-20 inset-x-4 liquid-glass-elevated rounded-2xl p-5 shadow-2xl border border-white/20 pointer-events-auto flex flex-col gap-3 animate-in fade-in duration-200">
          {!isAuthenticated ? (
            <>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-white/10 flex items-center justify-between"
              >
                <span>Home</span>
                <ChevronRight size={16} className="text-text-muted" />
              </Link>
              <Link
                to="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-white/10 flex items-center justify-between"
              >
                <span>Explore Jobs</span>
                <ChevronRight size={16} className="text-text-muted" />
              </Link>
              <a
                href="/#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-white/10 flex items-center justify-between"
              >
                <span>Features</span>
                <ChevronRight size={16} className="text-text-muted" />
              </a>
              <a
                href="/#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-white/10 flex items-center justify-between"
              >
                <span>How It Works</span>
                <ChevronRight size={16} className="text-text-muted" />
              </a>
              <div className="h-px bg-white/10 my-1" />
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <GlassButton variant="secondary" className="w-full">
                  Sign In
                </GlassButton>
              </Link>
              <Link to="/analyze" onClick={() => setMobileMenuOpen(false)}>
                <GlassButton variant="primary" className="w-full" icon={<Sparkles size={16} />}>
                  Analyze Resume
                </GlassButton>
              </Link>
            </>
          ) : (
            <>
              <div className="px-4 py-2 mb-1 flex items-center gap-3 bg-white/5 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-brand-blue/30 text-brand-cyan flex items-center justify-center font-bold text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{user?.name}</div>
                  <div className="text-xs text-text-secondary">{user?.email}</div>
                </div>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-white/10 flex items-center gap-3"
              >
                <LayoutDashboard size={18} className="text-brand-blue" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/analyze"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-white/10 flex items-center gap-3"
              >
                <FileUp size={18} className="text-brand-cyan" />
                <span>Analyze Resume</span>
              </Link>
              <Link
                to="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-white/10 flex items-center gap-3"
              >
                <Briefcase size={18} className="text-brand-violet" />
                <span>Job Recommendations</span>
              </Link>
              <Link
                to="/roadmap"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-white/10 flex items-center gap-3"
              >
                <Compass size={18} className="text-brand-mint" />
                <span>Career Roadmap</span>
              </Link>
              <Link
                to="/interview"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-white/10 flex items-center gap-3"
              >
                <Mic size={18} className="text-purple-400" />
                <span>AI Mock Interview</span>
              </Link>
              <Link
                to="/tools"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-white/10 flex items-center gap-3"
              >
                <Wand2 size={18} className="text-pink-400" />
                <span>Cover Letter & LinkedIn</span>
              </Link>
              <Link
                to="/builder"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-white/10 flex items-center gap-3"
              >
                <Layout size={18} className="text-brand-cyan" />
                <span>Resume Builder</span>
              </Link>
              <Link
                to="/tracker"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-white/10 flex items-center gap-3"
              >
                <Kanban size={18} className="text-brand-mint" />
                <span>Application Tracker</span>
              </Link>
              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-white/10 flex items-center gap-3"
              >
                <History size={18} className="text-brand-amber" />
                <span>Analysis History</span>
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-white/10 flex items-center gap-3"
              >
                <User size={18} className="text-text-secondary" />
                <span>My Profile</span>
              </Link>
              <div className="h-px bg-white/10 my-1" />
              <button
                onClick={handleLogout}
                className="px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-rose-500/10 text-rose-400 flex items-center gap-3 text-left"
              >
                <LogOut size={18} />
                <span>Log Out</span>
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
