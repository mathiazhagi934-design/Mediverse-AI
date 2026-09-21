import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { useNotifications } from '../context/NotificationContext';
import { Bell, X, Check, AlertCircle, Info, FileText, Activity, Heart, User, Clock } from 'lucide-react';
import { Badge } from './ui/Badge';
import { Avatar } from './ui/Avatar';
import { formatDistanceToNow } from 'date-fns';

const iconMap = {
  success: Check,
  error: AlertCircle,
  warning: AlertCircle,
  info: Info,
  prediction_complete: Activity,
  report_processed: FileText,
  profile_updated: User,
  health_score_updated: Heart,
  model_unavailable: AlertCircle,
  upload_failed: X,
};

const colorMap = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
  prediction_complete: 'text-primary-500',
  report_processed: 'text-green-500',
  profile_updated: 'text-blue-500',
  health_score_updated: 'text-red-500',
  model_unavailable: 'text-yellow-500',
  upload_failed: 'text-red-500',
};

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, removeNotification } = useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type) => {
    const Icon = iconMap[type] || Info;
    return <Icon className={cn('w-5 h-5', colorMap[type] || 'text-gray-500')} />;
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.action) {
      notification.action();
    }
    setOpen(false);
  };

  if (typeof window === 'undefined') return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={cn(
          'relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-slateink-800 transition-colors',
          unreadCount > 0 && 'text-primary-600 dark:text-primary-400'
        )}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slateink-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slateink-700 overflow-hidden z-50"
            role="menu"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slateink-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <motion.button
                    onClick={markAllAsRead}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Mark all read
                  </motion.button>
                )}
                <motion.button
                  onClick={clearAll}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  Clear all
                </motion.button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">You're all caught up</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">No new notifications</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-slateink-800">
                  {notifications.slice(0, 20).map((notification, index) => (
                    <motion.li
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={cn(
                        'p-3 hover:bg-gray-50 dark:hover:bg-slateink-800/50 transition-colors',
                        !notification.read && 'bg-primary-50/50 dark:bg-primary-500/10'
                      )}
                      role="menuitem"
                    >
                      <button
                        onClick={() => handleNotificationClick(notification)}
                        className="w-full flex items-start gap-3 text-left"
                      >
                        <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5', !notification.read ? 'bg-primary-100 dark:bg-primary-500/20' : 'bg-gray-100 dark:bg-slateink-800')}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn('font-medium text-sm', !notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300')}>
                              {notification.title}
                            </p>
                            <time className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                            </time>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{notification.message}</p>
                        </div>
                        {!notification.read && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2"
                          />
                        )}
                      </button>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {notifications.length > 20 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Showing 20 of {notifications.length} notifications</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}