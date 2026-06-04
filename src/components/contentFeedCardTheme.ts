import {
  postActionBtnClass,
  postCardDividerClass,
  postCardSurfaceClass,
  postTagClass,
} from './postCardSurface';

export const contentFeedCardClass = `${postCardSurfaceClass} overflow-hidden p-3 sm:p-4`;

export const contentFeedTitleClass =
  'line-clamp-2 text-base font-semibold leading-snug tracking-tight text-zinc-900 transition-colors group-hover:text-zinc-700 dark:text-zinc-50 dark:group-hover:text-zinc-200 sm:text-[17px]';

export const contentFeedPreviewClass =
  'line-clamp-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-sm';

export const contentFeedCoverClass =
  'relative mb-1 h-32 w-full shrink-0 overflow-hidden rounded-lg border border-zinc-200/60 bg-zinc-100 dark:border-white/[0.06] dark:bg-zinc-900/80 sm:h-36';

export const contentTypePillClass =
  'inline-flex items-center gap-1 rounded-md border border-zinc-200/70 bg-zinc-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400';

export const contentMetaChipClass =
  'inline-flex items-center gap-1 rounded-md border border-zinc-200/70 bg-zinc-50/90 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400';

export const contentAuthorLinkClass =
  'cursor-pointer truncate text-sm font-medium text-zinc-800 transition-colors hover:text-zinc-600 dark:text-zinc-200 dark:hover:text-zinc-100';

export const contentTimestampClass = 'whitespace-nowrap text-xs text-zinc-500 dark:text-zinc-400';

export const contentPageThumbClass =
  'relative z-10 h-9 w-9 cursor-pointer overflow-hidden rounded-lg border border-zinc-200/80 bg-zinc-50 dark:border-white/10 dark:bg-white/[0.04]';

export const contentStackedUserClass =
  'relative z-20 -ml-2 h-7 w-7 cursor-pointer overflow-hidden rounded-full border-2 border-white dark:border-zinc-900';

export const contentIconBtnClass =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-white/[0.06] dark:hover:text-zinc-200';

export const contentEmojiActiveClass =
  'flex items-center gap-0.5 rounded-md bg-zinc-200/90 px-1.5 py-0.5 text-xs text-zinc-900 ring-1 ring-zinc-300/80 dark:bg-white/10 dark:text-zinc-100 dark:ring-white/15';

export const contentEmojiInactiveClass =
  'flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/[0.06]';

export const contentEmojiPickerClass =
  'min-w-[200px] rounded-lg border border-zinc-200/80 bg-white p-2 shadow-lg dark:border-white/10 dark:bg-zinc-900 sm:min-w-[220px]';

export const contentBookmarkActiveClass =
  'rounded-lg bg-zinc-200/90 p-2 text-zinc-800 dark:bg-white/10 dark:text-zinc-100';

export const contentBookmarkIdleClass =
  'rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-white/[0.06]';

export { postActionBtnClass, postCardDividerClass, postTagClass };
