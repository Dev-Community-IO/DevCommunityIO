import React from 'react';

const cardClass =
  'overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm dark:border-white/[0.08] dark:bg-zinc-900/40 animate-pulse';

export const PageCardSkeleton: React.FC = () => {
  return (
    <div className={cardClass}>
      <div className="h-24 bg-zinc-200 dark:bg-zinc-800" />
      <div className="relative px-4 pb-4 pt-10">
        <div className="absolute -top-8 left-4 h-14 w-14 rounded-xl bg-zinc-300 dark:bg-zinc-700" />
        <div className="mb-2 h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mb-1 h-3 w-1/3 rounded bg-zinc-100 dark:bg-zinc-800/80" />
        <div className="mb-4 space-y-1.5">
          <div className="h-3 w-full rounded bg-zinc-100 dark:bg-zinc-800/80" />
          <div className="h-3 w-4/5 rounded bg-zinc-100 dark:bg-zinc-800/80" />
        </div>
        <div className="flex gap-2 border-t border-zinc-100 pt-3 dark:border-white/[0.06]">
          <div className="h-7 flex-1 rounded-md bg-zinc-100 dark:bg-zinc-800/80" />
          <div className="h-7 flex-1 rounded-md bg-zinc-100 dark:bg-zinc-800/80" />
          <div className="h-7 flex-1 rounded-md bg-zinc-100 dark:bg-zinc-800/80" />
        </div>
      </div>
    </div>
  );
};

export const PageCardSkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
      {Array.from({ length: count }).map((_, index) => (
        <PageCardSkeleton key={index} />
      ))}
    </div>
  );
};
