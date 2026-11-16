import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../glass/Logo';
import { GlassButton } from '../glass/GlassButton';
import { 
  Menu, X, Sparkles, LayoutDashboard, FileUp, 
  Briefcase, Compass, History, User, LogOut, ChevronRight,
  Mic, Wand2, Layout, Kanban, ChevronDown, LucideIcon
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const PRIMARY_AUTH_LINKS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analyze', label: 'Analyze', icon: FileUp },
  { to: '/jobs', label: 'Jobs', icon: Briefcase },
];

const MORE_AUTH_LINKS: NavItem[] = [
  { to: '/roadmap', label: 'Roadmap', icon: Compass },
  { to: '/interview', label: 'Interview', icon: Mic },
  { to: '/tools', label: 'AI Tools', icon: Wand2 },
  { to: '/builder', label: 'Builder', icon: Layout },
  { to: '/tracker', label: 'Tracker', icon: Kanban },
  { to: '/history', label: 'History', icon: History },
  { to: '/profile', label: 'Profile', icon: User },
];

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerButtonRef = useRef<HTMLButtonElement>(null);
  const menuItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);
  const isMoreActive = MORE_AUTH_LINKS.some(link => isActive(link.to));

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
    navigate('/');
  };

  // Close menus on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
  }, [location.pathname]);

  // Click outside and Escape key handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        moreDropdownRef.current &&
        !moreDropdownRef.current.contains(target)
      ) {
        setMoreMenuOpen(false);
      }
      if (
        mobileMenuRef.current &&
        hamburgerButtonRef.current &&
        !mobileMenuRef.current.contains(target) &&
        !hamburgerButtonRef.current.contains(target)
      ) {
        setMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (moreMenuOpen) {
          setMoreMenuOpen(false);
          moreButtonRef.current?.focus();
        }
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          hamburgerButtonRef.current?.focus();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [moreMenuOpen, mobileMenuOpen]);

  // Close mobile drawer on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard navigation within More dropdown
  const handleMoreMenuKeyDown = (e: React.KeyboardEvent) => {
    const items = menuItemsRef.current.filter(Boolean) as HTMLAnchorElement[];
    const activeIndex = items.findIndex(item => item === document.activeElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = activeIndex < items.length - 1 ? activeIndex + 1 : 0;
      items[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = activeIndex > 0 ? activeIndex - 1 : items.length - 1;
      items[prevIndex]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      items[items.length - 1]?.focus();
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex justify-center px-3 sm:px-4 md:px-6 pt-3 pointer-events-none">
      <nav 
        className="w-full max-w-6xl rounded-xl bg-[#0D0F14]/90 backdrop-blur-md border border-white/10 shadow-card px-3 sm:px-4 py-2 flex items-center justify-between pointer-events-auto transition-all duration-200"
        aria-label="Main Navigation"
      >
        {/* Brand Logo */}
        <div className="shrink-0 flex items-center">
          <Logo />
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 lg:gap-1.5">
          {!isAuthenticated ? (
            <>
              <Link
                to="/"
                className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-all duration-150 ${
                  isActive('/') 
                    ? 'text-white bg-white/[0.08] shadow-sm' 
                    : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
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
                  isActive('/jobs') 
                    ? 'text-white bg-white/[0.08] shadow-sm' 
                    : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
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
              {/* Primary Authenticated Links */}
              {PRIMARY_AUTH_LINKS.map(link => {
                const Icon = link.icon;
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg flex items-center gap-1.5 transition-all duration-150 shrink-0 ${
                      active 
                        ? 'text-white bg-white/[0.09] shadow-sm font-semibold' 
                        : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon size={14} className={`shrink-0 ${active ? 'text-white' : 'text-zinc-400'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {/* Compact "More" Dropdown Menu */}
              <div className="relative" ref={moreDropdownRef}>
                <button
                  ref={moreButtonRef}
                  type="button"
                  id="more-menu-trigger"
                  aria-haspopup="menu"
                  aria-expanded={moreMenuOpen}
                  aria-controls="more-menu-dropdown"
                  onClick={() => setMoreMenuOpen(prev => !prev)}
                  className={`px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg flex items-center gap-1.5 transition-all duration-150 cursor-pointer shrink-0 ${
                    isMoreActive
                      ? 'text-white bg-white/[0.09] shadow-sm font-semibold'
                      : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span>More</span>
                  <ChevronDown 
                    size={13} 
                    className={`shrink-0 opacity-70 transition-transform duration-200 ${
                      moreMenuOpen ? 'rotate-180 text-white' : ''
                    }`} 
                  />
                </button>

                {moreMenuOpen && (
                  <div
                    id="more-menu-dropdown"
                    role="menu"
                    aria-labelledby="more-menu-trigger"
                    onKeyDown={handleMoreMenuKeyDown}
                    className="absolute left-0 mt-2 w-52 rounded-xl bg-[#0D0F14]/95 backdrop-blur-md border border-white/10 shadow-elevated p-1.5 z-50 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100"
                  >
                    {MORE_AUTH_LINKS.map((link, idx) => {
                      const Icon = link.icon;
                      const active = isActive(link.to);
                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          ref={el => (menuItemsRef.current[idx] = el)}
                          role="menuitem"
                          onClick={() => setMoreMenuOpen(false)}
                          className={`px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2.5 transition-all duration-150 ${
                            active
                              ? 'text-white bg-white/[0.10] font-semibold'
                              : 'text-text-secondary hover:text-white hover:bg-white/[0.05]'
                          }`}
                        >
                          <Icon size={14} className={`shrink-0 ${active ? 'text-white' : 'text-zinc-400'}`} />
                          <span>{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
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
              <Link 
                to="/profile" 
                title="Profile & Settings"
                className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border transition-all ${
                  isActive('/profile')
                    ? 'bg-white/[0.09] border-white/20 text-white'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white'
                }`}
              >
                <div className="w-5 h-5 rounded-md bg-white/10 text-zinc-200 flex items-center justify-center font-semibold text-[11px] font-mono">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-medium text-white max-w-[100px] truncate">{user?.name || 'User'}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                title="Log Out"
                aria-label="Log Out"
                className="p-1.5 rounded-lg text-text-secondary hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          ref={hamburgerButtonRef}
          type="button"
          onClick={() => setMobileMenuOpen(prev => !prev)}
          className="md:hidden p-2 rounded-lg text-text-secondary hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-all cursor-pointer shrink-0"
          aria-label="Toggle Navigation Menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-drawer"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {/* Mobile Drawer Backdrop Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden pointer-events-auto"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Drawer"
          className="md:hidden fixed top-16 inset-x-3 sm:inset-x-4 max-h-[calc(100vh-5rem)] overflow-y-auto bg-[#0D0F14]/95 backdrop-blur-xl rounded-xl p-3 sm:p-4 shadow-elevated border border-white/10 pointer-events-auto flex flex-col gap-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {!isAuthenticated ? (
            <>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center justify-between transition-colors ${
                  isActive('/') ? 'text-white bg-white/[0.08]' : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span>Home</span>
                <ChevronRight size={14} className="text-text-muted" />
              </Link>
              <Link
                to="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center justify-between transition-colors ${
                  isActive('/jobs') ? 'text-white bg-white/[0.08]' : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span>Explore Jobs</span>
                <ChevronRight size={14} className="text-text-muted" />
              </Link>
              <a
                href="/#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-white hover:bg-white/[0.04] rounded-lg flex items-center justify-between transition-colors"
              >
                <span>Features</span>
                <ChevronRight size={14} className="text-text-muted" />
              </a>
              <a
                href="/#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-white hover:bg-white/[0.04] rounded-lg flex items-center justify-between transition-colors"
              >
                <span>Workflow</span>
                <ChevronRight size={14} className="text-text-muted" />
              </a>
              <a
                href="/#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-white hover:bg-white/[0.04] rounded-lg flex items-center justify-between transition-colors"
              >
                <span>FAQ</span>
                <ChevronRight size={14} className="text-text-muted" />
              </a>

              <div className="h-px bg-white/10 my-1.5" />

              <div className="flex flex-col gap-2 pt-1">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                  <GlassButton variant="secondary" className="w-full">
                    Sign In
                  </GlassButton>
                </Link>
                <Link to="/analyze" onClick={() => setMobileMenuOpen(false)} className="w-full">
                  <GlassButton variant="primary" className="w-full" icon={<Sparkles size={14} />}>
                    Analyze Resume
                  </GlassButton>
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* User Identity Header Card */}
              <div className="px-3 py-2.5 mb-1 flex items-center gap-2.5 bg-white/[0.03] rounded-lg border border-white/5">
                <div className="w-8 h-8 rounded-md bg-white/10 text-white flex items-center justify-center font-bold text-xs font-mono shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="truncate">
                  <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
                  <div className="text-[11px] text-text-secondary truncate">{user?.email}</div>
                  {user?.target_role && (
                    <div className="text-[10px] text-blue-400 font-mono mt-0.5 truncate">
                      {user.target_role}
                    </div>
                  )}
                </div>
              </div>

              {/* Primary Links */}
              <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted px-3 pt-1">
                Navigation
              </div>
              {PRIMARY_AUTH_LINKS.map(link => {
                const Icon = link.icon;
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-2.5 transition-colors ${
                      active ? 'text-white bg-white/[0.09] font-semibold' : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon size={16} className={`shrink-0 ${active ? 'text-white' : 'text-zinc-400'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              <div className="h-px bg-white/10 my-1" />

              {/* Secondary Tools & Intelligence */}
              <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted px-3 pt-1">
                Tools & Tracking
              </div>
              {MORE_AUTH_LINKS.map(link => {
                const Icon = link.icon;
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-2.5 transition-colors ${
                      active ? 'text-white bg-white/[0.09] font-semibold' : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon size={16} className={`shrink-0 ${active ? 'text-white' : 'text-zinc-400'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              <div className="h-px bg-white/10 my-1.5" />

              {/* Logout Action */}
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-2 text-sm font-medium rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
              >
                <LogOut size={16} className="shrink-0" />
                <span>Log Out</span>
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
