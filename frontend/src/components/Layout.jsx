import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCommandCenter } from '../context/CommandCenterContext';
import { cn } from '../utils/cn';
import {
  LayoutDashboard, HeartPulse, Stethoscope, BarChart3, Calendar, FileText, Scan,
  History, MessageCircle, Settings, Menu, ChevronRight, ChevronDown, LogOut,
  Sun, Moon, Search, ChevronsLeft, ChevronsRight, UserRound, Sparkles,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import AIAssistant from './AIAssistant';
import NotificationBell from './NotificationBell';

const navSections = [
  {
    label: 'Overview',
    items: [
      { to: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
      { to: '/app', icon: HeartPulse, label: 'Health Score', end: true, shortcut: true },
    ],
  },
  {
    label: 'Clinical',
    items: [
      { to: '/app/predict', icon: Stethoscope, label: 'Disease Prediction' },
      { to: '/app/analytics', icon: BarChart3, label: 'Health Analytics' },
      { to: '/app/timeline', icon: Calendar, label: 'Health Timeline' },
    ],
  },
  {
    label: 'Records',
    items: [
      { to: '/app/reports', icon: FileText, label: 'Medical Reports' },
      { to: '/app/skin', icon: Scan, label: 'Skin Analysis' },
      { to: '/app/history', icon: History, label: 'Prediction History' },
    ],
  },
  {
    label: 'Support',
    items: [
      { to: '/app/assistant', icon: MessageCircle, label: 'AI Assistant' },
      { to: '/app/profile', icon: UserRound, label: 'Patient Profile' },
      { to: '/app/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

const PAGE_META = {
  '/app': { title: 'Dashboard', description: "Here's an overview of your health today." },
  '/app/predict': { title: 'Disease Prediction', description: 'Enter symptoms for an AI-assisted clinical assessment.' },
  '/app/history': { title: 'Prediction History', description: 'Review all of your previous AI assessments.' },
  '/app/reports': { title: 'Medical Reports', description: 'Your secure digital health records.' },
  '/app/skin': { title: 'Skin Analysis', description: 'AI-assisted dermatology screening from an image.' },
  '/app/analytics': { title: 'Health Analytics', description: 'Monitor your health trends and clinical insights.' },
  '/app/timeline': { title: 'Health Timeline', description: 'Your chronological health journey.' },
  '/app/assistant': { title: 'AI Health Assistant', description: 'Your educational health companion.' },
  '/app/profile': { title: 'Patient Profile', description: 'Your personal, contact and health information.' },
  '/app/settings': { title: 'Settings', description: 'Manage your account, privacy and preferences.' },
};

const getChildMeta = (pathname) => {
  const meta = PAGE_META[pathname];
  if (meta) return meta;
  for (const [base, value] of Object.entries(PAGE_META)) {
    if (base !== '/app' && pathname.startsWith(base + '/')) return value;
  }
  return PAGE_META['/app'];
};

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  const { setIsOpen: setIsCommandCenterOpen } = useCommandCenter();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [disableAnimations, setDisableAnimations] = useState(false);

  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    setDisableAnimations(settings?.animationsEnabled === false);
  }, []);

  const pageMeta = getChildMeta(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderNavItem = ({ to, icon: Icon, label, end, shortcut }, itemKey) => (
    <NavLink
      key={`${itemKey}-${label}`}
      to={to}
      end={end}
      onClick={() => setSidebarOpen(false)}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center rounded-lg text-sm transition-colors duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
          shortcut && isActive
            ? ''
            : isActive
              ? 'bg-primary-600 text-white font-medium'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slateink-900 dark:text-slate-400 dark:hover:bg-slateink-800 dark:hover:text-white'
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && !shortcut && (
            <motion.span
              layoutId={`nav-active-${itemKey}`}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-white"
            />
          )}
          <Icon
            className={cn(
              'w-[18px] h-[18px] flex-shrink-0',
              isActive && !shortcut ? 'text-white' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white',
              shortcut && isActive && 'text-primary-500'
            )}
          />
          {!sidebarCollapsed && <span className="truncate">{label}</span>}
          {shortcut && !sidebarCollapsed && (
            <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-300" />
          )}
        </>
      )}
    </NavLink>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 transition-colors duration-300 dark:bg-slateink-950">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slateink-950/40 backdrop-blur-[2px] z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-slate-200 dark:bg-slateink-600 dark:border-slateink-700',
          'transform transition-all duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          sidebarCollapsed ? 'lg:w-[68px]' : 'lg:w-64',
          'w-64 lg:w-64'
        )}
        style={{ height: '100dvh' }}
      >
        {/* Brand */}
        <div className={cn(
          'flex items-center gap-3 px-4 h-16 border-b border-slate-100 dark:border-slateink-950 flex-shrink-0',
          sidebarCollapsed && 'lg:justify-center lg:px-2'
        )}>
          <LinkBrand collapsed={sidebarCollapsed} />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5" aria-label="Main navigation">
          {navSections.map((section, sectionIndex) => (
            <motion.div
              key={section.label}
              initial={false}
              className={cn('transition-all duration-200', sidebarCollapsed && 'lg:hidden')}
            >
              <h3 className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {section.label}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => renderNavItem(item, sectionIndex))}
              </div>
            </motion.div>
          ))}

          {/* Collapsed icon-only nav */}
          {sidebarCollapsed && (
            <div className="lg:hidden flex flex-col items-center gap-1">
              {navSections.flatMap((section, sectionIndex) =>
                section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.end
                      ? location.pathname === item.to
                      : location.pathname.startsWith(item.to);
                  return (
                    <NavLink
                      key={`${sectionIndex}-${item.label}`}
                      to={item.to}
                      end={item.end}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'p-2.5 rounded-lg transition-colors',
                        isActive && !item.shortcut
                          ? 'bg-primary-600 text-white'
                          : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slateink-800'
                      )}
                      title={item.label}
                    >
                      <Icon className="w-[18px] h-[18px]" />
                    </NavLink>
                  );
                })
              )}
            </div>
          )}
        </nav>

        {/* Sidebar footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slateink-950 flex-shrink-0">
          <div className={cn(
            'flex items-center gap-3 rounded-xl p-2.5',
            sidebarCollapsed && 'lg:justify-center lg:p-1.5'
          )}>
            <Avatar
              name={user?.username}
              size="sm"
              status="online"
              className="flex-shrink-0"
            />
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slateink-900 dark:text-white truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-slate-400 truncate">Patient portal</p>
              </div>
            )}
            {!sidebarCollapsed && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                aria-label="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            )}
          </div>
          <div className={cn('hidden lg:block', sidebarCollapsed && 'hidden')}>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="mt-1 w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-slateink-700 dark:hover:text-slate-300 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slateink-800 transition-colors"
            >
              {sidebarCollapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
              {!sidebarCollapsed && 'Collapse'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/85 dark:bg-slateink-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slateink-700">
          <div className="flex items-center gap-3 px-4 lg:px-8 h-16">
            <motion.button
              onClick={() => setSidebarOpen(true)}
              whileTap={{ scale: 0.95 }}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slateink-800 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </motion.button>

            <div className="min-w-0 hidden md:block">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-600">
                MediVerse Health Portal
              </p>
              <h1 className="text-[17px] font-bold text-slateink-900 dark:text-white leading-tight truncate">
                {pageMeta.title}
              </h1>
              <p className="text-[12px] text-slate-500 truncate">{pageMeta.description}</p>
            </div>
            {/* Mobile title */}
            <div className="md:hidden min-w-0">
              <h1 className="text-base font-bold text-slateink-900 dark:text-white truncate">
                {pageMeta.title}
              </h1>
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-1.5">
              {/* Command center search */}
              <button
                onClick={() => setIsCommandCenterOpen(true)}
                className="hidden sm:flex items-center gap-2 text-sm text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-slateink-900 dark:hover:bg-slateink-800 dark:border-slateink-700 dark:text-slate-400 rounded-lg pl-3 pr-2 py-2 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span className="text-slate-400 dark:text-slate-500">Search...</span>
                <kbd className="hidden md:inline-flex items-center gap-0.5 text-[11px] font-sans text-slate-400 bg-white border border-slate-200 dark:bg-slateink-800 dark:border-slateink-700 rounded px-1.5 py-0.5">
                  ⌘K
                </kbd>
              </button>

              {/* System status */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-100 dark:bg-green-500/15 dark:border-green-800/50">
                <span className="status-dot bg-green-500 animate-pulse-soft" />
                <span className="text-xs font-medium text-green-700 dark:text-green-400">Systems online</span>
              </div>

              {/* Theme toggle */}
              <div className="relative">
                <motion.button
                  onClick={toggleTheme}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slateink-800 transition-colors"
                  aria-label={`Theme: ${theme}. Toggle theme.`}
                >
                  {resolvedTheme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
                </motion.button>
              </div>

              {/* Notifications */}
              <NotificationBell />

              {/* AI Assistant */}
              <motion.button
                onClick={() => setAiAssistantOpen(true)}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-500/15 dark:text-primary-400 dark:hover:bg-primary-500/25 transition-colors"
                aria-label="Open AI Health Assistant"
              >
                <Sparkles className="w-[18px] h-[18px]" />
              </motion.button>

              {/* User menu */}
              <div className="relative">
                <motion.button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slateink-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slateink-700"
                  aria-label="User menu"
                  aria-expanded={profileMenuOpen}
                >
                  <Avatar name={user?.username} size="sm" status="online" />
                  <span className="hidden xl:block text-sm font-medium text-slateink-900 dark:text-white max-w-[120px] truncate">
                    {user?.username}
                  </span>
                  <ChevronDown className="hidden xl:block w-3.5 h-3.5 text-slate-400" />
                </motion.button>

                <AnimatePresence>
                  {profileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slateink-900 rounded-xl border border-slate-200 dark:border-slateink-700 shadow-card py-1.5 z-50"
                    >
                      <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slateink-800">
                        <p className="text-sm font-semibold text-slateink-900 dark:text-white truncate">{user?.username}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                      </div>
                      <button
                        onClick={() => { navigate('/app/profile'); setProfileMenuOpen(false); }}
                        className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slateink-800 flex items-center gap-2.5 transition-colors"
                      >
                        <UserRound className="w-4 h-4 text-slate-400" />
                        Patient Profile
                      </button>
                      <button
                        onClick={() => { navigate('/app/settings'); setProfileMenuOpen(false); }}
                        className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slateink-800 flex items-center gap-2.5 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        Settings
                      </button>
                      <hr className="my-1 border-slate-100 dark:border-slateink-800" />
                      <button
                        onClick={handleLogout}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2.5 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-[1400px] w-full mx-auto">
          <motion.div
            key={location.pathname}
            initial={disableAnimations ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* AI Assistant Floating Panel */}
      <AIAssistant isOpen={aiAssistantOpen} onClose={() => setAiAssistantOpen(false)} />
    </div>
  );
}

function LinkBrand({ collapsed }) {
  return (
    <div className={cn('flex items-center gap-3 min-w-0', collapsed && 'lg:gap-0')}>
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-soft flex-shrink-0">
        <HeartPulse className="w-5 h-5 text-white" />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p className="font-bold text-[15px] text-slateink-900 dark:text-white leading-tight truncate">
            MediVerse <span className="text-primary-600">AI</span>
          </p>
          <p className="text-[11px] text-slate-400 truncate">Hospital Health Portal</p>
        </div>
      )}
    </div>
  );
}