import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export function Progress({
  value = 0,
  max = 100,
  className = '',
  height = 6,
  showLabel = false,
  label,
  variant = 'default',
  animated = true,
  stripes = false,
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const variants = {
    default: 'bg-primary-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-500',
    error: 'bg-red-600',
    info: 'bg-blue-600',
    purple: 'bg-purple-600',
  };

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label || `${Math.round(percentage)}%`}</span>
          {showLabel && <span className="text-sm text-gray-500 dark:text-gray-400 tabular-nums">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div
        className={cn(
          'relative h-full rounded-full overflow-hidden bg-gray-200 dark:bg-slateink-700',
          height === 6 && 'h-1.5',
          height === 8 && 'h-2',
          height === 12 && 'h-3',
          height === 16 && 'h-4',
        )}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <motion.div
          initial={animated ? { width: 0 } : undefined}
          animate={{ width: `${percentage}%` }}
          transition={animated ? { duration: 1.2, ease: [0.4, 0, 0.2, 1] } : { duration: 0 }}
          className={cn(
            'h-full rounded-full transition-all duration-500',
            variants[variant],
            stripes && 'bg-[linear-gradient(45deg,rgba(255,255,255,.15)25%,transparent25%,transparent50%,rgba(255,255,255,.15)50%,rgba(255,255,255,.15)75%,transparent75%,transparent)] bg-[size:1rem_1rem] animate-stripes'
          )}
          style={{ width: animated ? undefined : `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function CircularProgress({
  value = 0,
  max = 100,
  size = 120,
  strokeWidth = 8,
  className = '',
  showValue = true,
  children,
  variant = 'default',
  animated = true,
  trackColor,
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const variants = {
    default: 'text-primary-600',
    success: 'text-green-600',
    warning: 'text-yellow-500',
    error: 'text-red-600',
    info: 'text-blue-600',
    purple: 'text-purple-600',
  };

  const trackColors = {
    default: 'text-primary-100 dark:text-primary-500/15',
    success: 'text-green-100 dark:text-green-500/15',
    warning: 'text-yellow-100 dark:text-amber-500/15',
    error: 'text-red-100 dark:text-red-500/15',
    info: 'text-blue-100 dark:text-blue-500/15',
    purple: 'text-purple-100 dark:text-purple-500/15',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className={cn('transition-all duration-1000', trackColor || trackColors[variant])}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <motion.circle
          initial={animated ? { strokeDashoffset: circumference } : undefined}
          animate={{ strokeDashoffset: offset }}
          transition={animated ? { duration: 1.5, ease: [0.4, 0, 0.2, 1] } : { duration: 0 }}
          className={cn('transition-all duration-1000', variants[variant])}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {showValue && (
          <motion.span
            initial={animated ? { opacity: 0, scale: 0.5 } : undefined}
            animate={animated ? { opacity: 1, scale: 1 } : undefined}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
            className="text-2xl font-bold text-gray-900 dark:text-slate-50 tabular-nums"
          >
            {Math.round(percentage)}%
          </motion.span>
        )}
        {children && !showValue && children}
      </div>
    </div>
  );
}

export function StepProgress({ steps, currentStep, className = '', variant = 'default' }) {
  const variants = {
    default: { active: 'bg-primary-600', completed: 'bg-primary-600', inactive: 'bg-gray-300 dark:bg-slateink-700' },
    success: { active: 'bg-green-600', completed: 'bg-green-600', inactive: 'bg-gray-300 dark:bg-slateink-700' },
  };

  const colors = variants[variant];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <motion.div
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2"
          >
            <div className="relative flex items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: index * 0.1 }}
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium z-10',
                  isCompleted ? colors.completed : isActive ? colors.active : colors.inactive
                )}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : index + 1}
              </motion.div>
              {!isLast && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: isCompleted || isActive ? '100%' : 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                  className={cn(
                    'absolute left-full h-0.5 -ml-1 rounded',
                    isCompleted ? colors.completed : isActive ? colors.active : colors.inactive
                  )}
                  style={{ width: '2rem' }}
                />
              )}
            </div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'text-sm font-medium hidden sm:block',
                isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
              )}
            >
              {step}
            </motion.span>
          </motion.div>
        );
      })}
    </div>
  );
}