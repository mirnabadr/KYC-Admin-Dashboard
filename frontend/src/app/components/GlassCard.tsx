import { ReactNode } from 'react';
import { cn } from './ui/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-xl border transition-all duration-300',
        // Light theme
        'bg-white/80 backdrop-blur-sm border-slate-200/50',
        'shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
        // Dark theme - dark blue-slate cards
        'dark:bg-slate-800/90 dark:border-slate-600/30',
        'dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]',
        hover && [
          'hover:scale-[1.02] hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)]',
          'dark:hover:shadow-[0_20px_50px_rgb(0,0,0,0.5)]',
          'hover:border-blue-200 dark:hover:border-blue-500/50',
          'cursor-pointer',
        ],
        className
      )}
    >
      {/* Glow effect on hover */}
      {hover && (
        <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-purple-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-400/0 dark:via-blue-400/30 dark:to-purple-400/0 -z-10" />
      )}
      {children}
    </div>
  );
}
