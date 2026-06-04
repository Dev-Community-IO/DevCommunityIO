export function ProfileTabsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="border-b border-zinc-200/80 py-2 dark:border-white/10">
        <div className="inline-flex gap-1 rounded-xl border border-zinc-200/80 bg-white/90 p-1 dark:border-white/10 dark:bg-black/25">
          {[72, 64, 56, 96, 72].map((w, i) => (
            <div
              key={i}
              className="h-8 rounded-lg bg-zinc-200 dark:bg-zinc-700"
              style={{ width: w }}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-200/80 bg-white p-6 dark:border-white/10 dark:bg-black/20"
          >
            <div className="flex gap-4">
              <div className="h-12 w-12 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-700" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-4 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
                <div className="h-4 w-5/6 rounded bg-zinc-100 dark:bg-zinc-800" />
                <div className="mt-4 flex gap-4">
                  <div className="h-8 w-16 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
                  <div className="h-8 w-16 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
                  <div className="h-8 w-16 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
