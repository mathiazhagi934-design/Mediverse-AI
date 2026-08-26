import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { cn } from '../utils/cn';
import { Search, Command, X, Keyboard, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CommandCenterContext = createContext(null);

const COMMANDS = [
  { id: 'dashboard', label: 'Go to Dashboard', description: 'View your health overview', icon: 'layout-dashboard', shortcut: '⌘1', action: '/app' },
  { id: 'predict', label: 'Predict Disease', description: 'Analyze symptoms with AI', icon: 'activity', shortcut: '⌘2', action: '/app/predict' },
  { id: 'history', label: 'Prediction History', description: 'View past predictions', icon: 'history', shortcut: '⌘3', action: '/app/history' },
  { id: 'reports', label: 'Medical Reports', description: 'Upload and view reports', icon: 'file-text', shortcut: '⌘4', action: '/app/reports' },
  { id: 'skin', label: 'Skin Analysis', description: 'Analyze skin conditions', icon: 'scan', shortcut: '⌘5', action: '/app/skin' },
  { id: 'analytics', label: 'Health Analytics', description: 'View health trends and charts', icon: 'bar-chart-3', shortcut: '⌘6', action: '/app/analytics' },
  { id: 'timeline', label: 'Health Timeline', description: 'View your health journey', icon: 'calendar', shortcut: '⌘7', action: '/app/timeline' },
  { id: 'assistant', label: 'AI Assistant', description: 'Chat with health assistant', icon: 'message-circle', shortcut: '⌘8', action: '/app/assistant' },
  { id: 'profile', label: 'Profile Settings', description: 'Manage your profile', icon: 'user', shortcut: '⌘9', action: '/app/profile' },
  { id: 'settings', label: 'App Settings', description: 'Configure preferences', icon: 'settings', shortcut: '⌘,', action: '/app/settings' },
];

export function CommandCenterProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const filteredCommands = COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
        setSelectedIndex(0);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleSelect = (command) => {
    if (command.action.startsWith('/')) {
      navigate(command.action);
    } else {
      command.action();
    }
    setIsOpen(false);
    setSearchQuery('');
    setSelectedIndex(0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleSelect(filteredCommands[selectedIndex]);
      }
    }
  };

  const iconMap = {
    'layout-dashboard': 'LayoutDashboard',
    'activity': 'Activity',
    'history': 'History',
    'file-text': 'FileText',
    'scan': 'Scan',
    'bar-chart-3': 'BarChart3',
    'calendar': 'Calendar',
    'message-circle': 'MessageCircle',
    'user': 'User',
    'settings': 'Settings',
  };

  const CommandCenter = () => {
    if (!isOpen) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-20"
          onClick={() => { setIsOpen(false); setSearchQuery(''); setSelectedIndex(0); }}
          role="dialog"
          aria-modal="true"
          aria-label="Command center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-2xl mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Keyboard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSelectedIndex(0); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search MediVerse... (⌘K to open)"
                  className="w-full pl-10 pr-12 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-[50vh] overflow-y-auto">
              {filteredCommands.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCommands.map((cmd, index) => (
                    <motion.li
                      key={cmd.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <button
                        onClick={() => handleSelect(cmd)}
                        className={cn(
                          'w-full px-4 py-3 flex items-center gap-3 text-left transition-colors',
                          index === selectedIndex
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        )}
                      >
                        <div className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                          index === selectedIndex
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        )}>
                          {cmd.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{cmd.label}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{cmd.description}</p>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                          {cmd.shortcut}
                        </span>
                        <ChevronRight className={cn('w-4 h-4 flex-shrink-0', index === selectedIndex ? 'text-primary-500' : 'text-gray-400')} />
                      </button>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Search className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No commands found</p>
                </div>
              )}
            </div>
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>⌘K to close</span>
              <span>↑↓ to navigate • Enter to select</span>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <CommandCenterContext.Provider value={{ isOpen, setIsOpen, searchQuery, setSearchQuery }}>
      {children}
      <CommandCenter />
    </CommandCenterContext.Provider>
  );
}

export function useCommandCenter() {
  const context = useContext(CommandCenterContext);
  if (!context) {
    throw new Error('useCommandCenter must be used within a CommandCenterProvider');
  }
  return context;
}