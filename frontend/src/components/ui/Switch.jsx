import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { useReducedMotion } from '../../utils/animations';

export function Switch({
  checked,
  onChange,
  disabled = false,
  className = '',
  id,
  label,
  description,
}) {
  const switchId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const reducedMotion = useReducedMotion();

  return (
    <div className={cn('flex items-center', className)}>
      {label && (
        <label htmlFor={switchId} className="flex-1 cursor-pointer">
          {description && <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>}
        </label>
      )}
      <label className={cn('relative inline-flex items-center cursor-pointer', disabled && 'opacity-50 cursor-not-allowed')}>
        <input
          type="checkbox"
          id={switchId}
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
          aria-describedby={description ? `${switchId}-desc` : undefined}
        />
        <motion.span
          initial={false}
          animate={{
            backgroundColor: checked ? '#338bff' : '#d1d5db',
            boxShadow: checked ? '0 0 0 2px rgba(51, 139, 255, 0.3)' : 'none',
          }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
          className={cn(
            'w-11 h-6 rounded-full transition-all duration-200',
            'dark:bg-gray-600 dark:hover:bg-gray-500',
            checked && 'bg-primary-600',
            disabled && 'opacity-50'
          )}
        >
          <motion.span
            animate={{ x: checked ? 24 : 2 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, duration: reducedMotion ? 0 : 0.2 }}
            className="block w-5 h-5 rounded-full bg-white shadow-lg transform"
          />
        </motion.span>
      </label>
    </div>
  );
}