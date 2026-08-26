import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { X, Check, AlertCircle, Info, Loader2 } from 'lucide-react';

const alertVariants = {
  default: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
  info: 'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300',
};

const iconMap = {
  default: Info,
  success: Check,
  warning: AlertCircle,
  error: AlertCircle,
  info: Info,
};

export function Alert({
  children,
  variant = 'default',
  className = '',
  dismissible = false,
  onDismiss,
  title,
  icon = true,
  animated = true,
}) {
  const Icon = iconMap[variant];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        className={cn(
          'relative flex items-start gap-3 rounded-xl border p-4 transition-all duration-300',
          alertVariants[variant],
          className
        )}
        role="alert"
      >
        {icon && (
          <motion.span
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="flex-shrink-0 mt-0.5 w-5 h-5"
          >
            <Icon className="w-5 h-5" />
          </motion.span>
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-medium mb-1"
            >
              {title}
            </motion.p>
          )}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {children}
          </motion.div>
        </div>
        {dismissible && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4 opacity-60 hover:opacity-100" />
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export function LoadingAlert({ variant = 'info', title = 'Loading...', children }) {
  return (
    <Alert variant={variant} title={title} icon>
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>{children}</span>
      </div>
    </Alert>
  );
}