import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { asidePanelClass, asideStatChipClass } from './postCardSurface';

export const profileInputClass =
  'h-9 w-full rounded-lg border border-zinc-200/80 bg-white px-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 dark:border-white/10 dark:bg-[#0a1020]/90 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500';

export const profileTextareaClass =
  'w-full rounded-lg border border-zinc-200/80 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 dark:border-white/10 dark:bg-[#0a1020]/90 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 resize-none';

export function ProfileTabPanel({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${asidePanelClass} p-3 sm:p-4 ${className}`}>{children}</div>;
}

export function ProfileTabHeader({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-50 text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400">
          <Icon size={18} strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-xs leading-snug text-zinc-500 dark:text-zinc-400">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

export function ProfileStatChip({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <span className={`${asideStatChipClass} flex flex-col items-center gap-0.5 px-2.5 py-1.5 text-center`}>
      <span className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{value}</span>
      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{label}</span>
    </span>
  );
}

export function ProfileToggleRow({
  title,
  description,
  enabled,
  onToggle,
}: {
  title: string;
  description?: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-100 px-3 py-2.5 dark:border-white/[0.06]">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{title}</p>
        {description && (
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
          enabled ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-200 dark:bg-zinc-700'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform dark:bg-zinc-900 ${
            enabled ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export function ProfileAlert({
  variant,
  title,
  children,
  action,
}: {
  variant: 'info' | 'success' | 'warning' | 'danger';
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  const styles = {
    info: 'border-zinc-200/80 bg-zinc-50/90 dark:border-white/10 dark:bg-white/[0.04]',
    success: 'border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20',
    warning: 'border-amber-200/80 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20',
    danger: 'border-red-200/80 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20',
  }[variant];

  return (
    <div className={`rounded-lg border p-3 ${styles}`}>
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{title}</p>
      <div className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{children}</div>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export const profilePrimaryBtnClass =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200/80 bg-zinc-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white';

export const profileDangerBtnClass =
  'inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200/80 bg-red-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:bg-red-700 dark:hover:bg-red-600';
