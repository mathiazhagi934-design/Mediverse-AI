import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const variants = {
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 bg-transparent',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1 text-sm',
};

export function Badge({ children, variant = 'default', size = 'md', className = '', animated = true, dot = false, dotColor }) {
  return (
    <motion.span
      initial={animated ? { opacity: 0, scale: 0.8 } : undefined}
      animate={animated ? { opacity: 1, scale: 1 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && (
        <motion.span
          className={cn('w-1.5 h-1.5 rounded-full', dotColor)}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
        />
      )}
      {children}
    </motion.span>
  );
}

export function StatusBadge({ status, className = '', ...props }) {
  const config = {
    normal: { variant: 'success', label: 'Normal', dot: true, dotColor: 'bg-green-500' },
    low: { variant: 'warning', label: 'Low', dot: true, dotColor: 'bg-yellow-500' },
    high: { variant: 'error', label: 'High', dot: true, dotColor: 'bg-red-500' },
    critical: { variant: 'error', label: 'Critical', dot: true, dotColor: 'bg-red-600' },
    pending: { variant: 'info', label: 'Pending', dot: false },
    completed: { variant: 'success', label: 'Completed', dot: true, dotColor: 'bg-green-500' },
    failed: { variant: 'error', label: 'Failed', dot: true, dotColor: 'bg-red-500' },
    processing: { variant: 'warning', label: 'Processing', dot: false },
  };

  const cfg = config[status] || config.pending;

  return <Badge {...cfg} className={className} {...props} />;
}

export function ConfidenceBadge({ confidence, className = '' }) {
  if (confidence >= 0.8) {
    return <Badge variant="success" className={className} dot dotColor="bg-green-500">High {(confidence * 100).toFixed(0)}%</Badge>;
  }
  if (confidence >= 0.5) {
    return <Badge variant="warning" className={className} dot dotColor="bg-yellow-500">Medium {(confidence * 100).toFixed(0)}%</Badge>;
  }
  return <Badge variant="error" className={className} dot dotColor="bg-red-500">Low {(confidence * 100).toFixed(0)}%</Badge>;
}