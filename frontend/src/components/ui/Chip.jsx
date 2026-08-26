import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { X, Check } from 'lucide-react';

export function Chip({
  children,
  onRemove,
  removable = false,
  selected = false,
  variant = 'default',
  className = '',
  onClick,
  icon,
  animated = true,
}) {
  const variants = {
    default: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
    primary: 'bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-900/50',
    success: 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 bg-transparent',
  };

  return (
    <motion.button
      initial={animated ? { opacity: 0, scale: 0.8, y: 10 } : undefined}
      animate={animated ? { opacity: 1, scale: 1, y: 0 } : undefined}
      exit={animated ? { opacity: 0, scale: 0.8, y: -10 } : undefined}
      whileHover={{ scale: onClick || onRemove ? 1.03 : 1 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        variants[variant],
        selected && 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20',
        className
      )}
      disabled={!onClick && !onRemove}
      aria-pressed={selected}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      <AnimatePresence>
        {removable && (
          <motion.button
            initial={{ opacity: 0, scale: 0, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0, rotate: 90 }}
            onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
            className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex-shrink-0"
            aria-label="Remove"
          >
            <X className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export function FilterChip({ label, count, onClick, active = false, className = '' }) {
  return (
    <Chip
      variant={active ? 'primary' : 'outline'}
      selected={active}
      onClick={onClick}
      className={className}
    >
      {label}
      {count !== undefined && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            'ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium',
            active ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          )}
        >
          {count}
        </motion.span>
      )}
    </Chip>
  );
}

export function InputChip({ label, value, onRemove, className = '', icon }) {
  return (
    <Chip
      removable
      onRemove={onRemove}
      variant="primary"
      className={className}
      icon={icon}
    >
      {label}
    </Chip>
  );
}