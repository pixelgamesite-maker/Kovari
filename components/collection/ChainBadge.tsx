import { chainMeta } from '@/lib/wagmi';

export function ChainBadge({ chainId }: { chainId: keyof typeof chainMeta }) {
  const meta = chainMeta[chainId];

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
      {meta.label}
    </span>
  );
}
