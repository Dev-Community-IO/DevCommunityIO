import type { LucideIcon } from 'lucide-react';

export interface TabPillItem<T extends string = string> {
  id: T;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

interface TabPillsProps<T extends string> {
  tabs: TabPillItem<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  ariaLabel?: string;
  className?: string;
  size?: 'sm' | 'md';
  /** Segmented pills in a bar (default) or equal-width stretch row */
  variant?: 'segmented' | 'stretch';
  scrollable?: boolean;
}

const pillBase =
  'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-200 active:scale-[0.98] touch-manipulation whitespace-nowrap';

const pillActive = 'bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900';
const pillInactive =
  'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100';

const containerClass =
  'inline-flex min-w-0 items-center gap-0.5 rounded-xl border border-zinc-200/80 bg-white/90 p-1 shadow-sm dark:border-white/10 dark:bg-black/25';

export function TabPills<T extends string>({
  tabs,
  activeTab,
  onChange,
  ariaLabel = 'Tabs',
  className = '',
  size = 'sm',
  variant = 'segmented',
  scrollable = true,
}: TabPillsProps<T>) {
  const padding = size === 'sm' ? 'px-2.5 py-1.5 sm:px-3 sm:py-2' : 'px-3 py-2 sm:px-4 sm:py-2.5';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const iconSize = size === 'sm' ? 15 : 16;

  const pills = (
    <div
      className={`${containerClass} ${variant === 'stretch' ? 'flex w-full' : ''}`}
      role="presentation"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onChange(tab.id)}
            className={`${pillBase} ${padding} ${textSize} ${
              variant === 'stretch' ? 'flex-1' : ''
            } ${isActive ? pillActive : pillInactive}`}
          >
            {Icon && (
              <Icon
                size={iconSize}
                strokeWidth={isActive ? 2.25 : 2}
                className="shrink-0 opacity-90"
                aria-hidden
              />
            )}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums ${
                  isActive
                    ? 'bg-white/20 dark:bg-black/10'
                    : 'bg-zinc-200/90 text-zinc-600 dark:bg-white/10 dark:text-zinc-400'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  if (!scrollable && variant !== 'stretch') {
    return (
      <nav role="tablist" aria-label={ariaLabel} className={className}>
        {pills}
      </nav>
    );
  }

  return (
    <nav
      role="tablist"
      aria-label={ariaLabel}
      className={`${scrollable ? 'overflow-x-auto scrollbar-hide' : ''} ${className}`}
    >
      {pills}
    </nav>
  );
}
