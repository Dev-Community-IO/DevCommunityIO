import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'gradient' | 'subtle';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  const sizes = {
    sm: 'inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-md',
    md: 'inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full',
  };

  const variants = {
    subtle:
      'bg-zinc-100 text-zinc-600 border border-zinc-200/70 dark:bg-zinc-800/70 dark:text-zinc-300 dark:border-white/[0.08]',
    default:
      'backdrop-blur-xl bg-white/20 dark:bg-black/30 border border-white/30 dark:border-white/20 text-zinc-700 dark:text-zinc-200',
    gradient:
      'bg-blue-500/10 text-blue-700 border border-blue-500/25 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-400/20',
  };

  return (
    <span
      className={`transition-colors duration-200 ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
