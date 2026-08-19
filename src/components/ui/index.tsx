import type { ReactNode } from 'react';
import { classNames } from '@/lib/utils';

export { Button } from './Button';
export { Input, Textarea, Select } from './Input';
export { Modal } from './Modal';
export { Spinner, LoadingPage, LoadingInline, EmptyState, ErrorState, SkeletonCard } from './Feedback';

export function Badge({
  children,
  variant = 'slate',
  className,
}: {
  children: ReactNode;
  variant?: 'turquoise' | 'sky' | 'orange' | 'slate' | 'success' | 'danger' | 'warning';
  className?: string;
}) {
  const variantClass = {
    turquoise: 'badge-turquoise',
    sky: 'badge-sky',
    orange: 'badge-orange',
    slate: 'badge-slate',
    success: 'badge-success',
    danger: 'badge-danger',
    warning: 'badge-warning',
  }[variant];
  return <span className={classNames(variantClass, className)}>{children}</span>;
}

export function Card({ children, className, hover }: { children: ReactNode; className?: string; hover?: boolean }) {
  return (
    <div className={classNames('card', hover && 'card-hover', className)}>{children}</div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  trendUp,
  accent = 'turquoise',
}: {
  label: string;
  value: string;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  accent?: 'turquoise' | 'sky' | 'orange' | 'slate';
}) {
  const accentBg = {
    turquoise: 'bg-turquoise-50 text-turquoise-500',
    sky: 'bg-sky-50 text-sky-500',
    orange: 'bg-orange-50 text-orange-500',
    slate: 'bg-slate-100 text-slate-500',
  }[accent];

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={classNames('h-10 w-10 rounded-xl flex items-center justify-center', accentBg)}>{icon}</div>
        {trend && (
          <span className={classNames('text-xs font-semibold', trendUp ? 'text-turquoise-600' : 'text-red-500')}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-ink tracking-tight">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmer',
  danger = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}) {
  return (
    <div className={classNames('fixed inset-0 z-[1001] flex items-center justify-center p-4', !open && 'hidden')}>
      {open && <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />}
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-float animate-scale-in p-6">
        <h3 className="text-h4 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <div className="flex items-center justify-end gap-3">
          <button onClick={onClose} className="btn-ghost">
            Annuler
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={danger ? 'btn bg-red-500 text-white hover:bg-red-600' : 'btn-primary'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { value: T; label: string; count?: number }[];
  active: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex items-center gap-1 border-b border-slate-100 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={classNames(
            'relative px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
            active === tab.value ? 'text-ink' : 'text-slate-400 hover:text-slate-600'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={classNames('ml-2 text-xs px-1.5 py-0.5 rounded-md', active === tab.value ? 'bg-turquoise-50 text-turquoise-600' : 'bg-slate-100 text-slate-400')}>
              {tab.count}
            </span>
          )}
          {active === tab.value && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-turquoise-400 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
