import { Lock, LockOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TradingLockBadge({ locked }: { locked: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        locked
          ? 'border-alert/30 bg-alert/10 text-alert'
          : 'border-accent/30 bg-accent/10 text-accent'
      )}
    >
      {locked ? <Lock size={12} /> : <LockOpen size={12} />}
      {locked ? 'Trading locked' : 'Trading open'}
    </span>
  );
}
