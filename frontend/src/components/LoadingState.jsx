import { cn } from '../utils/cn';

export function Skeleton({ className = '' }) {
  return <div className={cn('skeleton', className)} aria-hidden="true" />;
}

export default function LoadingState({ rows = 3, className = '' }) {
  return (
    <div className={cn('space-y-4', className)} aria-label="Loading" role="status">
      <div className="flex items-center gap-3">
        <Skeleton className="w-40 h-6" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="card !p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="w-11 h-11 rounded-xl" />
              <Skeleton className="w-14 h-5 rounded-md" />
            </div>
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-16 h-7 rounded-md" />
            <Skeleton className="w-full h-1.5 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="card space-y-4" aria-label="Loading" role="status">
      <div className="flex items-center justify-between">
        <Skeleton className="w-32 h-5" />
        <Skeleton className="w-20 h-8 rounded-md" />
      </div>
      <Skeleton className="w-full h-56 rounded-xl" />
    </div>
  );
}