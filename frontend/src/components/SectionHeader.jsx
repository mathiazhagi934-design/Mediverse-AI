import { cn } from '../utils/cn';

export default function SectionHeader({ title, description, eyebrow, right, className = '' }) {
  return (
    <div className={cn('mb-6', className)}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && <p className="section-eyebrow mb-1.5">{eyebrow}</p>}
          <h1 className="page-title">{title}</h1>
          {description && <p className="page-subtitle">{description}</p>}
        </div>
        {right && <div className="flex items-center gap-3 flex-shrink-0">{right}</div>}
      </div>
    </div>
  );
}

export function InlineSectionHeader({ icon: Icon, title, description, right, className = '' }) {
  return (
    <div className={cn('flex items-start justify-between gap-3 mb-4', className)}>
      <div className="flex items-start gap-2.5 min-w-0">
        {Icon && (
          <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5 dark:bg-primary-900/20 dark:text-primary-400">
            <Icon className="w-5 h-5" />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="section-title">{title}</h3>
          {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
        </div>
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  );
}