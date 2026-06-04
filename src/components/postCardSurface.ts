/** Shared feed / profile post card surfaces (matches sidebar zinc panels). */

export const postCardSurfaceClass =
  'group flex h-full w-full flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm transition-[border-color,background-color,box-shadow] duration-200 cursor-pointer touch-manipulation hover:border-zinc-300 hover:bg-zinc-50/90 hover:shadow-sm dark:border-white/[0.08] dark:bg-zinc-900/40 dark:hover:border-white/[0.12] dark:hover:bg-zinc-900/55 active:bg-zinc-100 dark:active:bg-zinc-900/70';

export const postCardPaddingClass = 'p-3 sm:p-4';

export const postTagClass =
  'inline-flex max-w-full items-center rounded-md border border-zinc-200/70 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400 sm:text-[11px]';

export const postActionBtnClass =
  'flex items-center gap-1 rounded-md px-1.5 sm:px-2 py-1 text-[10px] sm:text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-zinc-200 touch-manipulation';

export const postMentionClass =
  'font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-200';

export const postCardDividerClass = 'border-t border-zinc-100 dark:border-white/[0.06]';

/** Compact zinc panel for sidebars (page/author cards, widgets). */
export const asidePanelClass =
  'rounded-xl border border-zinc-200/80 bg-white/90 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900/40';

export const asidePanelPadding = 'p-3 sm:p-3.5';

export const asideStatChipClass =
  'inline-flex items-baseline gap-1 rounded-md border border-zinc-200/70 bg-zinc-50 px-2 py-0.5 dark:border-white/10 dark:bg-white/[0.04]';

export const asideGhostBtnClass =
  'flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-200/80 bg-zinc-50/90 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300 dark:hover:bg-white/[0.08] dark:hover:text-zinc-100';

/** Page / profile post card — editorial grid tile */
export const compactPostCardClass =
  'group relative flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm transition-[border-color,box-shadow] duration-200 cursor-pointer touch-manipulation hover:border-zinc-300 hover:shadow-md dark:border-white/[0.08] dark:bg-zinc-900/45 dark:hover:border-white/[0.12] dark:hover:bg-zinc-900/55 active:bg-zinc-50 dark:active:bg-zinc-900/70';

/** Responsive grid: cards stay ≥280px wide, never cram into unreadable columns */
export const compactPostGridClass =
  'grid items-stretch gap-4 sm:gap-5 [grid-template-columns:repeat(auto-fill,minmax(min(100%,17.5rem),1fr))]';
