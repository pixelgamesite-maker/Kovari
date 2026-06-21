import { CollectionCard } from '@/components/collection/CollectionCard';
import { mockCollections } from '@/lib/mock-data';

const tabs = ['Featured', 'Minting', 'Ended'] as const;

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="mb-12">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Self-launch, open to anyone</p>
        <h1 className="mt-3 max-w-xl font-display text-4xl font-bold leading-tight text-balance sm:text-5xl">
          Launch a collection. Run it in phases. You stay in control.
        </h1>
        <p className="mt-4 max-w-lg text-muted">
          Cap each phase, gate it to an exact wallet list, and lock trading until you're ready. No gatekeepers
          between you and your mint.
        </p>
      </section>

      <section>
        <div className="mb-6 flex items-center gap-6 border-b border-border">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              className={
                i === 0
                  ? 'border-b-2 border-accent pb-3 text-sm font-medium text-foreground'
                  : 'pb-3 text-sm text-muted hover:text-foreground transition-colors'
              }
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mockCollections.map((collection) => (
            <CollectionCard key={collection.slug} collection={collection} />
          ))}
        </div>
      </section>
    </div>
  );
}
