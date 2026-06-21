import { formatCount, cn } from '@/lib/utils';
import type { Phase } from '@/lib/mock-data';

type MintProgressProps =
  | { phase: Phase; minted?: never; totalSupply?: never; size?: 'sm' | 'lg' }
  | { phase?: never; minted: number; totalSupply: number; size?: 'sm' | 'lg' };

export function MintProgress(props: MintProgressProps) {
  const minted = props.phase ? props.phase.minted : props.minted;
  const cap = props.phase ? props.phase.maxMints : props.totalSupply;
  const label = props.phase ? `${props.phase.name} minted` : 'Total minted';
  const pct = Math.min(100, Math.round((minted / cap) * 100));
  const size = props.size ?? 'sm';

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between font-mono text-sm">
        <span className="text-muted">{label}</span>
        <span>
          {formatCount(minted)} <span className="text-muted">/ {formatCount(cap)}</span>
        </span>
      </div>
      <div className={cn('w-full overflow-hidden rounded-full bg-panel', size === 'lg' ? 'h-3' : 'h-2')}>
        <div
          className="h-full rounded-full bg-accent shadow-glow-accent transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
