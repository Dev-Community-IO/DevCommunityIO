import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  'aria-label': ariaLabel,
}: ButtonProps) {
  const baseClasses =
    'inline-flex shrink-0 items-center justify-center gap-1.5 font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/80 focus-visible:ring-offset-2 dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-950';

  const variants = {
    primary:
      'border border-transparent bg-zinc-900 text-white shadow-sm hover:bg-zinc-800 active:bg-zinc-950 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:active:bg-zinc-200',
    secondary:
      'border border-zinc-200/80 bg-white text-zinc-800 hover:bg-zinc-50 active:bg-zinc-100 dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-200 dark:hover:bg-zinc-800/80 dark:active:bg-zinc-800',
    ghost:
      'border border-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-zinc-100',
    danger:
      'border border-transparent bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800 dark:bg-red-600 dark:hover:bg-red-500',
  };

  const sizes = {
    sm: 'h-8 rounded-lg px-3 text-xs',
    md: 'h-10 rounded-lg px-4 text-sm',
    lg: 'h-11 rounded-lg px-5 text-base',
  };

  const iconSizes = { sm: 15, md: 17, lg: 18 } as const;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`.trim()}
    >
      {Icon && <Icon size={iconSizes[size]} strokeWidth={2} className="shrink-0 opacity-90" />}
      {children}
    </button>
  );
}
