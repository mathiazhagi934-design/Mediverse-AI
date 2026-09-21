import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-6 border border-dashed border-slate-200 dark:border-slateink-600 bg-slate-50/50 dark:bg-slateink-900/40 rounded-xl',
        className
      )}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slateink-800 border border-slate-200 dark:border-slateink-600 shadow-soft flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-slate-300 dark:text-slate-500" />
        </div>
      )}
      {title && <h3 className="font-semibold text-slateink-900 dark:text-slate-100">{title}</h3>}
      {description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}