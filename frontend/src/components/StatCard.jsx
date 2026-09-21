import { motion } from 'framer-motion';
import { cn } from '../utils/cn';
import { TrendingUp, TrendingDown } from 'lucide-react';

const tones = {
  primary: { box: 'bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400', bar: 'bg-primary-600' },
  success: { box: 'bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400', bar: 'bg-green-500' },
  warning: { box: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400', bar: 'bg-amber-500' },
  danger: { box: 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400', bar: 'bg-red-500' },
  info: { box: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400', bar: 'bg-sky-500' },
  medical: { box: 'bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400', bar: 'bg-teal-500' },
  neutral: { box: 'bg-slate-100 text-slate-600 dark:bg-slateink-700 dark:text-slate-300', bar: 'bg-slate-500' },
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = 'primary',
  trend,
  trendLabel,
  progress,
  progressMax = 100,
  className = '',
  index = 0,
}) {
  const t = tones[tone] || tones.neutral;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -3 }}
      className={cn(
        'group bg-white dark:bg-slateink-900 rounded-xl border border-slate-200 dark:border-slateink-700 shadow-soft p-5 transition-shadow duration-300 hover:shadow-card hover:border-slate-300 dark:hover:border-slateink-600',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', t.box)}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
        {trend !== undefined && (
          <div className="flex flex-col items-end gap-0.5">
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              className={cn(
                'inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5',
                trend >= 0 ? 'text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-500/15' : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/15'
              )}
            >
              {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {trend > 0 ? '+' : ''}{trend}%
            </motion.span>
            {trendLabel && <span className="text-[11px] text-slate-400">{trendLabel}</span>}
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-[1.75rem] leading-tight font-bold text-slateink-900 dark:text-slate-50 tabular-nums mt-1">{value}</p>
        {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
      </div>

      {progress !== undefined && (
        <div className="mt-4">
          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slateink-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(Math.max((progress / progressMax) * 100, 0), 100)}%` }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              className={cn('h-full rounded-full transition-all', t.bar)}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}