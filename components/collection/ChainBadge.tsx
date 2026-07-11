import { chainMeta } from '@/lib/chains';

export function ChainBadge({ chainId }: { chainId: number }) {
  const meta = (chainMeta as Record<number, { label: string; color: string }>)[chainId];

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: meta?.color ?? '#8B8FA3' }}
      />
      {meta?.label ?? `Chain ${chainId}`}
    </span>
  );
}
