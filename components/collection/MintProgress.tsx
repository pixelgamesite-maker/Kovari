import { formatCount } from '@/lib/utils';
import type { Phase } from '@/lib/mock-data';

export function MintProgress({ phase }: { phase: Phase }) {
  const pct = Math.min(100, Math.round((phase.minted / phase.cap) * 100));

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between font-mono text-sm">
        <span className="text-muted">{phase.name} minted</span>
        <span>
          {formatCount(phase.minted)} <span className="text-muted">/ {formatCount(phase.cap)}</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-panel">
        <div
          className="h-full rounded-full bg-accent shadow-glow-accent transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
