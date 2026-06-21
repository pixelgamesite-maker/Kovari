import Link from 'next/link';
import Image from 'next/image';
import { TradingLockBadge } from './TradingLockBadge';
import { ChainBadge } from './ChainBadge';
import { formatCount } from '@/lib/utils';
import type { Collection } from '@/lib/mock-data';

export function CollectionCard({ collection }: { collection: Collection }) {
  const activePhase = collection.phases.find((p) => p.status === 'active') ?? collection.phases[0];
  const pct = Math.round((collection.minted / collection.totalSupply) * 100);

  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="group block overflow-hidden rounded-xl border border-border bg-panel transition-colors hover:border-accent-blue/40"
    >
      <div className="relative h-32 w-full">
        <Image src={collection.banner} alt={collection.name} fill className="object-cover" />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display font-semibold text-main-text">{collection.name}</h3>
          <div className="flex items-center gap-2">
            <ChainBadge chainId={collection.chainId} />
            <TradingLockBadge lock={collection.tradingLock} />
          </div>
        </div>
        <p className="mt-1 font-mono text-xs text-muted-text">by {collection.creator.name}</p>

        <div className="mt-4 flex items-center justify-between font-mono text-xs text-muted-text">
          <span>
            {formatCount(collection.minted)} / {formatCount(collection.totalSupply)} minted
          </span>
          <span className="text-accent-blue">{activePhase?.name ?? '—'}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background">
          <div className="h-full rounded-full bg-accent-blue" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </Link>
  );
}
