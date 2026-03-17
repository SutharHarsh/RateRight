import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type LogoSize = 'sm' | 'md' | 'lg';

interface LogoProps {
  size?: LogoSize;
  withLink?: boolean;
  className?: string;
}

const textSizes: Record<LogoSize, string> = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl',
};

const iconSizes: Record<LogoSize, string> = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

function LogoMark({ size = 'md', className }: { size?: LogoSize; className?: string }) {
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <TrendingUp className={cn(iconSizes[size], 'text-indigo-500')} />
      <span
        className={cn(
          textSizes[size],
          'font-extrabold tracking-tight bg-gradient-to-r from-[#6366F1] to-[#06B6D4] bg-clip-text text-transparent'
        )}
      >
        RateRight
      </span>
    </div>
  );
}

export function Logo({ size = 'md', withLink = true, className }: LogoProps) {
  if (!withLink) {
    return <LogoMark size={size} className={className} />;
  }

  return (
    <Link href="/" className={cn('inline-flex', className)} aria-label="RateRight home">
      <LogoMark size={size} />
    </Link>
  );
}
