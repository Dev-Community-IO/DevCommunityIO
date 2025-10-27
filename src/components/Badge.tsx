import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'gradient';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'backdrop-blur-xl bg-white/20 dark:bg-black/30 border border-white/30 dark:border-white/20',
    gradient: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30'
  };

  return (
    <span className={`
      px-3 py-1 rounded-full text-xs font-medium
      transition-all duration-300
      ${variants[variant]}
      ${className}
    `}>
      {children}
    </span>
  );
}
