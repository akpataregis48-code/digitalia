import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return <Loader2 className={className} style={{ width: size, height: size }} />;
}

export function LoadingPage({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <Loader2 className="h-7 w-7 text-turquoise-400 animate-spin" />
      <p className="text-sm text-slate-400 font-medium">{label}</p>
    </div>
  );
}

export function LoadingInline({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-400">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
        {icon}
      </div>
      <h3 className="text-h4 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-5">{description}</p>
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-400 mb-4">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
        </svg>
      </div>
      <h3 className="text-h4 mb-1.5">Something went wrong</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-5">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline">
          Try again
        </button>
      )}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card p-5">
      <div className="skeleton h-32 w-full mb-4" />
      <div className="skeleton h-4 w-3/4 mb-2" />
      <div className="skeleton h-3 w-1/2" />
    </div>
  );
}
