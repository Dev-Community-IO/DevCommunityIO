import { GlassCard } from '../GlassCard';
import { compactPostGridClass } from '../postCardSurface';

export function PageViewSkeleton() {
  return (
    <div className="min-h-screen animate-pulse pb-20 sm:pb-24">
      <div className="relative h-48 bg-zinc-200 dark:bg-zinc-800 sm:h-56 md:h-64" />

      <div className="relative z-10 -mt-8 px-4 sm:-mt-9 sm:px-6 md:-mt-10 md:px-8">
        <GlassCard className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="mx-auto h-16 w-16 shrink-0 rounded-xl bg-zinc-200 dark:bg-zinc-800 sm:mx-0" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="h-6 w-48 max-w-full rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-32 rounded bg-zinc-100 dark:bg-zinc-800/80" />
              <div className="h-3 w-full rounded bg-zinc-100 dark:bg-zinc-800/80" />
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="mt-4 border-b border-zinc-200/80 px-4 py-2 dark:border-white/[0.06] sm:px-6 md:px-8">
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 w-20 rounded-lg bg-zinc-100 dark:bg-zinc-800/80" />
          ))}
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6 md:px-8 md:py-8">
        <div className={compactPostGridClass}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white dark:border-white/[0.08] dark:bg-zinc-900/40"
            >
              {i % 2 === 0 && (
                <div className="aspect-[16/9] w-full bg-zinc-100 dark:bg-zinc-800/80" />
              )}
              {i % 2 !== 0 && (
                <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800/80" />
              )}
              <div className="flex flex-1 flex-col p-4">
                <div className="mb-3 flex items-center gap-2.5">
                  <div className="h-9 w-9 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-2.5 w-14 rounded bg-zinc-100 dark:bg-zinc-800/80" />
                  </div>
                </div>
                <div className="mb-2 h-4 w-[90%] rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="mb-1 h-3 w-full rounded bg-zinc-100 dark:bg-zinc-800/80" />
                <div className="mb-4 h-3 w-4/5 rounded bg-zinc-100 dark:bg-zinc-800/80" />
                <div className="mt-auto flex justify-between border-t border-zinc-100 pt-3 dark:border-white/[0.06]">
                  <div className="h-3 w-20 rounded bg-zinc-100 dark:bg-zinc-800/80" />
                  <div className="h-3 w-12 rounded bg-zinc-100 dark:bg-zinc-800/80" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
