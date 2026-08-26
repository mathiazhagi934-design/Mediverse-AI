import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { cn } from '../utils/cn';
import {
  LayoutDashboard, Activity, History, FileText, Scan, User, LogOut, Menu, X, Heart,
  Bell, Sun, Moon, Monitor, MessageCircle, Settings, ChevronRight, ChevronDown,
  BarChart3, Calendar, Shield, TrendingUp
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
    ],
  },
  {
    label: 'Health',
    items: [
      { to: '/app/predict', icon: Activity, label: 'Disease Prediction' },
      { to: '/app/history', icon: History, label: 'Prediction History' },
      { to: '/app/analytics', icon: BarChart3, label: 'Health Analytics' },
      { to: '/app/timeline', icon: Calendar, label: 'Health Timeline' },
    ],
  },
  {
    label: 'Medical',
    items: [
      { to: '/app/reports', icon: FileText, label: 'Medical Reports' },
      { to: '/app/skin', icon: Scan, label: 'Skin Analysis' },
    ],
  },
  {
    label: 'AI Assistant',
    items: [
      { to: '/app/assistant', icon: MessageCircle, label: 'Chat Assistant' },
    ],
  },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, resolvedTheme, toggleTheme, setThemeMode } = useTheme();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800',
          'transform transition-transform duration-200 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          sidebarCollapsed ? 'w-20' : 'w-64',
        )}
      >
        <div className={cn(
          'flex items-center gap-3 px-4 py-5 border-b border-gray-200 dark:border-gray-800',
          'transition-all duration-200',
          sidebarCollapsed && 'justify-center px-3'
        )}>
          <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Heart className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <div>
                <h1 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">MediVerse</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">AI Health Platform</p>
              </div>
            </motion.div>
          )}
          <motion.button
            onClick={toggleSidebarCollapse}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={cn('ml-auto flex-shrink-0 p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors', sidebarCollapsed && 'mx-auto')}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </motion.button>
        </div>

        <nav className="p-3 space-y-1" aria-label="Main navigation">
          {navSections.map((section, sectionIndex) => (
            <motion.div
              key={section.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.05 }}
              className={cn('transition-all duration-200', sidebarCollapsed && 'hidden')}
            >
              <h3 className="px-3 py-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {section.label}
              </h3>
              {section.items.map(({ to, icon: Icon, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
                      sidebarCollapsed && 'justify-center px-2'
                    )}
                >
                  <Icon className={cn('w-5 h-5 flex-shrink-0', sidebarCollapsed && 'mx-auto')} />
                  {!sidebarCollapsed && <span>{label}</span>}
                </NavLink>
              ))}
            </motion.div>
          ))}
        </nav>

        <div className={cn('absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 dark:border-gray-800', sidebarCollapsed && 'hidden')}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-3 py-2 mb-2"
          >
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.username}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
          </motion.div>
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </motion.button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <header className={cn(
          'bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-4',
          'lg:px-8 transition-colors duration-300'
        )}>
          <motion.button
            onClick={() => setSidebarOpen(true)}
            whileTap={{ scale: 0.95 }}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </motion.button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <div className="relative">
              <motion.button
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={`Current theme: ${theme}. Click to change.`}
              >
                {resolvedTheme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </motion.button>
              <AnimatePresence>
                {themeMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                  >
                    {['light', 'dark', 'system'].map((t) => (
                      <motion.button
                        key={t}
                        onClick={() => { setThemeMode(t); setThemeMenuOpen(false); }}
                        whileHover={{ x: 4 }}
                        className={cn(
                          'w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors',
                          theme === t
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        )}
                      >
                        {t === 'light' && <Sun className="w-4 h-4" />}
                        {t === 'dark' && <Moon className="w-4 h-4" />}
                        {t === 'system' && <Monitor className="w-4 h-4" />}
                        <span className="capitalize">{t}</span>
                        {theme === t && <span className="ml-auto text-primary-500">✓</span>}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notification Bell */}
            <NotificationBell />

            {/* AI Assistant Button */}
            <motion.button
              onClick={() => setAiAssistantOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
              aria-label="Open AI Assistant"
            >
              <MessageCircle className="w-5 h-5" />
            </motion.button>

            {/* User Menu */}
            <div className="relative">
              <motion.button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="User menu"
              >
                <Avatar name={user?.username} size="sm" />
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {user?.username}
                  </motion.span>
                )}
              </motion.button>

              <AnimatePresence>
                {profileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                  >
                    <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.username}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => { navigate('/app/profile'); setProfileMenuOpen(false); }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                    <button
                      onClick={() => { navigate('/app/settings'); setProfileMenuOpen(false); }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* AI Assistant Floating Panel */}
      <AIAssistant isOpen={aiAssistantOpen} onClose={() => setAiAssistantOpen(false)} />
    </div>
  );
}