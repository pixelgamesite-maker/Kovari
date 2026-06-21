import Link from 'next/link';
import { TradingLockBadge } from './TradingLockBadge';
import { formatCount } from '@/lib/utils';
import type { Collection } from '@/lib/mock-data';

export function CollectionCard({ collection }: { collection: Collection }) {
  const activePhase = collection.phases.find((p) => p.status === 'active') ?? collection.phases[0];
  const pct = Math.round((collection.totalMinted / collection.totalSupply) * 100);

  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="group block overflow-hidden rounded-xl border border-border bg-panel transition-colors hover:border-accent/40"
    >
      <div
        className="h-32 w-full"
        style={{
          background: `linear-gradient(135deg, ${collection.bannerColor}33, #0B0C11)`,
        }}
      />
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display font-semibold">{collection.name}</h3>
          <TradingLockBadge locked={collection.tradingLocked} />
        </div>
        <p className="mt-1 font-mono text-xs text-muted">by {collection.creator}</p>

        <div className="mt-4 flex items-center justify-between font-mono text-xs text-muted">
          <span>
            {formatCount(collection.totalMinted)} / {formatCount(collection.totalSupply)} minted
          </span>
          <span className="text-accent">{activePhase?.name ?? '—'}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background">
          <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </Link>
  );
}
