import { notFound } from 'next/navigation';
import { TradingLockBadge } from '@/components/collection/TradingLockBadge';
import { ChainBadge } from '@/components/collection/ChainBadge';
import { MintProgress } from '@/components/collection/MintProgress';
import { PhaseRoadmap } from '@/components/collection/PhaseRoadmap';
import { getCollectionBySlug } from '@/lib/mock-data';
import { formatCount } from '@/lib/utils';

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) notFound();

  const activePhase = collection.phases.find((p) => p.status === 'active');

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div
        className="h-40 rounded-xl sm:h-56"
        style={{ background: `linear-gradient(135deg, ${collection.bannerColor}40, #0B0C11)` }}
      />

      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold">{collection.name}</h1>
            <ChainBadge chainId={collection.chainId} />
            <TradingLockBadge locked={collection.tradingLocked} />
          </div>
          <p className="mt-2 max-w-md text-muted">{collection.description}</p>
          <p className="mt-2 font-mono text-xs text-muted">
            by {collection.creator} · {formatCount(collection.totalSupply)} items
          </p>
        </div>

        {/* Mint panel */}
        <div className="w-full max-w-xs rounded-xl border border-border bg-panel p-5 sm:shrink-0">
          {activePhase ? (
            <>
              <MintProgress phase={activePhase} />

              {/* TODO: replace with a real eligibility check against the connected wallet's Merkle proof for this phase */}
              <div className="mt-4 rounded-lg border border-accent/30 bg-accent/[0.06] px-3 py-2 text-sm text-accent">
                ✓ You're eligible for {activePhase.name}
              </div>

              <button className="mt-4 w-full rounded-xl bg-accent py-2.5 font-semibold text-white transition-colors hover:bg-accent-dim">
                Mint · {activePhase.priceEth === 0 ? 'Free' : `${activePhase.priceEth} ETH`}
              </button>
            </>
          ) : (
            <p className="text-sm text-muted">No phase is currently live.</p>
          )}
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-6 font-display text-xl font-semibold">Mint phases</h2>
        <PhaseRoadmap phases={collection.phases} />
      </section>
    </div>
  );
}
