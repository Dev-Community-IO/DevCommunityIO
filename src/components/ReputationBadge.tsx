interface ReputationBadgeProps {
  value: number;
  className?: string;
}

export function ReputationBadge({ value, className = '' }: ReputationBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-baseline gap-0.5 rounded-md border border-zinc-200/70 bg-zinc-50/90 px-1.5 py-0.5 text-[10px] leading-none dark:border-white/10 dark:bg-white/[0.05] ${className}`}
    >
      <span className="tabular-nums font-semibold text-zinc-700 dark:text-zinc-300">
        {value.toLocaleString()}
      </span>
      <span className="font-medium text-zinc-500 dark:text-zinc-500">rep</span>
    </span>
  );
}
