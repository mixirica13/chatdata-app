import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface LiquidGlassProps {
  children: ReactNode;
  className?: string;
}

export const LiquidGlass = ({ children, className }: LiquidGlassProps) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl',
        'bg-white/5 backdrop-blur-xl',
        'border border-white/10',
        'shadow-[0_8px_32px_0_rgba(70,204,198,0.15)]',
        'transition-all duration-300',
        'hover:bg-white/10 hover:border-[#46CCC6]/30',
        'hover:shadow-[0_8px_32px_0_rgba(70,204,198,0.25)]',
        className
      )}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#46CCC6]/10 via-transparent to-transparent opacity-50" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
