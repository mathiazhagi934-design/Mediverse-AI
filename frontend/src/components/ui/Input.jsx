import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <motion.label
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          {label}
        </motion.label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <motion.input
          id={inputId}
          className={cn(
            'w-full rounded-xl border transition-all duration-200',
            'bg-white dark:bg-slateink-900',
            'text-gray-900 dark:text-slate-100',
            'placeholder:text-gray-400 dark:placeholder:text-slate-500',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'disabled:bg-gray-100 dark:disabled:bg-slateink-800 disabled:cursor-not-allowed',
            leftIcon ? 'pl-10' : 'px-4',
            rightIcon ? 'pr-10' : 'px-4',
            'py-2.5',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-slateink-500 hover:border-gray-400 dark:hover:border-slateink-400'
          )}
          whileHover={{ borderColor: error ? 'red-500' : 'gray-400' }}
          whileFocus={{ scale: 1.01 }}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          id={`${inputId}-error`}
          className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
          role="alert"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-3.5 h-3.5 flex-shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          </motion.span>
          {error}
        </motion.p>
      )}
      {hint && !error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          id={`${inputId}-hint`}
          className="mt-1.5 text-sm text-gray-500 dark:text-gray-400"
        >
          {hint}
        </motion.p>
      )}
    </div>
  );
}

export function Textarea({ label, error, hint, className = '', id, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <motion.label
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          {label}
        </motion.label>
      )}
      <motion.textarea
        id={inputId}
        className={cn(
          'w-full rounded-xl border transition-all duration-200 resize-y min-h-[80px]',
          'bg-white dark:bg-slateink-900',
          'text-gray-900 dark:text-slate-100',
          'placeholder:text-gray-400 dark:placeholder:text-slate-500',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'disabled:bg-gray-100 dark:disabled:bg-slateink-800 disabled:cursor-not-allowed',
          'px-4 py-2.5',
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 dark:border-slateink-500 hover:border-gray-400 dark:hover:border-slateink-400'
        )}
        whileHover={{ borderColor: error ? 'red-500' : 'gray-400' }}
        whileFocus={{ scale: 1.01 }}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          id={`${inputId}-error`}
          className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
          role="alert"
        >
          {error}
        </motion.p>
      )}
      {hint && !error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          id={`${inputId}-hint`}
          className="mt-1.5 text-sm text-gray-500 dark:text-gray-400"
        >
          {hint}
        </motion.p>
      )}
    </div>
  );
}

export function Select({ label, error, hint, options, placeholder, className = '', id, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <motion.label
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          {label}
        </motion.label>
      )}
      <motion.select
        id={inputId}
        className={cn(
          'w-full rounded-xl border transition-all duration-200 appearance-none',
          'bg-white dark:bg-slateink-900',
          'text-gray-900 dark:text-slate-100',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'disabled:bg-gray-100 dark:disabled:bg-slateink-800 disabled:cursor-not-allowed',
          'px-4 py-2.5 pr-10',
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 dark:border-slateink-500 hover:border-gray-400 dark:hover:border-slateink-400'
        )}
        whileHover={{ borderColor: error ? 'red-500' : 'gray-400' }}
        whileFocus={{ scale: 1.01 }}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </motion.select>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          id={`${inputId}-error`}
          className="mt-1.5 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </motion.p>
      )}
      {hint && !error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          id={`${inputId}-hint`}
          className="mt-1.5 text-sm text-gray-500 dark:text-gray-400"
        >
          {hint}
        </motion.p>
      )}
    </div>
  );
}