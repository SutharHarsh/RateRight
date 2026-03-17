import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/40',
  {
    variants: {
      variant: {
        default:
          'border-violet-500/30 bg-violet-500/15 text-violet-300 hover:bg-violet-500/25',
        secondary:
          'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.06)] text-slate-300 hover:bg-[rgba(255,255,255,0.1)]',
        destructive:
          'border-red-500/30 bg-red-500/15 text-red-400 hover:bg-red-500/25',
        outline:
          'border-[rgba(255,255,255,0.12)] text-slate-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

