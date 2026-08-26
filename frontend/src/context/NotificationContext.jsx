import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const NotificationContext = createContext(null);

const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  PREDICTION_COMPLETE: 'prediction_complete',
  REPORT_PROCESSED: 'report_processed',
  PROFILE_UPDATED: 'profile_updated',
  HEALTH_SCORE_UPDATED: 'health_score_updated',
  MODEL_UNAVAILABLE: 'model_unavailable',
  UPLOAD_FAILED: 'upload_failed',
};

const DEFAULT_DURATION = 5000;

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = useCallback((notification) => {
    const id = uuidv4();
    const newNotification = {
      id,
      read: false,
      timestamp: new Date().toISOString(),
      duration: DEFAULT_DURATION,
      ...notification,
    };

    setNotifications((prev) => [newNotification, ...prev].slice(0, 50));
    setUnreadCount((prev) => prev + 1);

    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => {
      const notification = prev.find((n) => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
      return prev.filter((n) => n.id !== id);
    });
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const notify = useCallback((type, title, message, options = {}) => {
    const configs = {
      [NOTIFICATION_TYPES.SUCCESS]: { icon: 'check-circle', color: 'success' },
      [NOTIFICATION_TYPES.ERROR]: { icon: 'alert-circle', color: 'error' },
      [NOTIFICATION_TYPES.WARNING]: { icon: 'alert-triangle', color: 'warning' },
      [NOTIFICATION_TYPES.INFO]: { icon: 'info', color: 'info' },
      [NOTIFICATION_TYPES.PREDICTION_COMPLETE]: { icon: 'activity', color: 'success', title: 'Prediction Complete' },
      [NOTIFICATION_TYPES.REPORT_PROCESSED]: { icon: 'file-text', color: 'info', title: 'Report Processed' },
      [NOTIFICATION_TYPES.PROFILE_UPDATED]: { icon: 'user', color: 'success', title: 'Profile Updated' },
      [NOTIFICATION_TYPES.HEALTH_SCORE_UPDATED]: { icon: 'heart', color: 'info', title: 'Health Score Updated' },
      [NOTIFICATION_TYPES.MODEL_UNAVAILABLE]: { icon: 'alert-triangle', color: 'warning', title: 'Model Unavailable' },
      [NOTIFICATION_TYPES.UPLOAD_FAILED]: { icon: 'x-circle', color: 'error', title: 'Upload Failed' },
    };

    const config = configs[type] || configs[NOTIFICATION_TYPES.INFO];

    return addNotification({
      type,
      title: title || config.title,
      message,
      icon: config.icon,
      color: config.color,
      action: options.action,
      ...options,
    });
  }, [addNotification]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        localStorage.setItem('notifications', JSON.stringify(notifications.slice(0, 20)));
      } catch (e) {}
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [notifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        removeNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        notify,
        types: NOTIFICATION_TYPES,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}