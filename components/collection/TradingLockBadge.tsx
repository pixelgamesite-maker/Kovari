import { Lock, LockOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TradingLockBadge({ lock }: { lock: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        lock
          ? 'border-accent-red/30 bg-accent-red/10 text-accent-red'
          : 'border-accent-blue/30 bg-accent-blue/10 text-accent-blue'
      )}
    >
      {lock ? <Lock size={12} /> : <LockOpen size={12} />}
      {lock ? 'Trading locked' : 'Trading open'}
    </span>
  );
}
