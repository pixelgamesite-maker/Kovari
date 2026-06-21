import { Check, Lock, Users } from 'lucide-react';
import { cn, formatCount } from '@/lib/utils';
import type { Phase } from '@/lib/mock-data';

const statusStyles: Record<Phase['status'], string> = {
  completed: 'border-border text-muted',
  active: 'border-accent/40 bg-accent/[0.06] shadow-glow-accent',
  upcoming: 'border-border text-muted opacity-60',
};

export function PhaseRoadmap({ phases }: { phases: Phase[] }) {
  return (
    <ol className="relative">
      {phases.map((phase, i) => (
        <li key={phase.index} className="relative pl-10 pb-8 last:pb-0">
          {/* connector line */}
          {i < phases.length - 1 && (
            <span className="absolute left-[15px] top-7 h-full w-px bg-border" aria-hidden />
          )}

          {/* marker - numbered because phase order genuinely gates the next phase */}
          <span
            className={cn(
              'absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border font-mono text-xs',
              phase.status === 'completed' && 'border-accent bg-accent text-white',
              phase.status === 'active' && 'border-accent text-accent',
              phase.status === 'upcoming' && 'border-border text-muted'
            )}
          >
            {phase.status === 'completed' ? <Check size={14} /> : phase.index}
          </span>

          <div className={cn('rounded-xl border p-4', statusStyles[phase.status])}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-medium">{phase.name}</h3>
                {phase.walletGated && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted">
                    <Users size={11} /> allowlist
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide',
                  phase.status === 'completed' && 'text-muted',
                  phase.status === 'active' && 'text-accent',
                  phase.status === 'upcoming' && 'text-muted'
                )}
              >
                {phase.status === 'completed' ? 'Ended' : phase.status === 'active' ? 'Live' : 'Upcoming'}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-4 font-mono text-sm text-muted">
              <span>
                <span className="text-foreground">{formatCount(phase.minted)}</span> / {formatCount(phase.cap)}
              </span>
              <span>{phase.priceEth === 0 ? 'Free' : `${phase.priceEth} ETH`}</span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
