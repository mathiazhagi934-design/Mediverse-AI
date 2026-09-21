import { CircleAlert, RotateCw } from 'lucide-react';

export default function ErrorState({ title = 'Something went wrong', description, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 border border-dashed border-red-200 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/30 rounded-xl">
      <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 flex items-center justify-center mb-4">
        <CircleAlert className="w-7 h-7 text-red-500 dark:text-red-400" />
      </div>
      <h3 className="font-semibold text-slateink-900 dark:text-slate-100">{title}</h3>
      {description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">{description}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 py-2 px-4 rounded-lg bg-white border border-slate-200 hover:border-primary-300 transition-colors dark:bg-slateink-800 dark:border-slateink-700 dark:text-primary-400 dark:hover:border-slateink-600"
        >
          <RotateCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}