import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className = '', hover = false, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        backdrop-blur-xl bg-white dark:bg-black/20
        border border-gray-200 dark:border-white/10
        rounded-2xl shadow-sm
        transition-all duration-300
        ${hover ? 'hover:bg-gray-50 dark:hover:bg-black/30 hover:shadow-md hover:scale-[1.01] cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
