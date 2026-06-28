"use client";

import Link from "next/link";
import { type Address } from "viem";
import { useCollectionInfo, useTotalPhases, usePhase } from "@/hooks/useCollection";
import { TradingLockBadge } from "./TradingLockBadge";
import { formatCount, isPhaseActive } from "@/lib/utils";

interface Props {
  address: Address;
  filter?: "live" | "upcoming" | "ended";
}

export function CollectionCard({ address, filter }: Props) {
  const { name, symbol, maxSupply, totalSupply, tradingLocked, isLoading } = useCollectionInfo(address);
  const { data: totalPhases } = useTotalPhases(address);

  // Filtering by phase 0's status only - a reasonable heuristic for bucketing
  // cards into Live/Upcoming/Ended on the home page. The collection detail
  // page already shows full per-phase status; this is just for sorting cards
  // into sections here, not meant to be perfectly precise for multi-phase
  // collections where one phase has ended but another is live.
  const hasPhases = !!totalPhases && Number(totalPhases) > 0;
  const { phase } = usePhase(address, hasPhases ? 0 : -1);
  const status = phase ? isPhaseActive(phase.startTime, phase.endTime, phase.active).status : null;

  if (filter && status && status !== filter) return null;
  // If a filter was requested but we don't know the status yet, render
  // nothing rather than flashing the card into the wrong section.
  if (filter && !status) return null;

  if (isLoading || !name) {
    return <div className="rounded-xl border border-border bg-panel h-[280px] animate-pulse" />;
  }

  const minted = totalSupply ?? 0n;
  const supply = maxSupply ?? 0n;
  const pct = supply > 0n ? Math.round((Number(minted) / Number(supply)) * 100) : 0;

  return (
    <Link
      href={`/collections/${address}`}
      className="group block overflow-hidden rounded-xl border border-border bg-panel transition-colors hover:border-accent-blue/40"
    >
      <div className="h-32 w-full bg-gradient-to-br from-accent-blue/20 to-background" />
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-main-text">{name}</h3>
          <TradingLockBadge lock={!!tradingLocked} />
        </div>
        <p className="mt-1 font-mono text-xs text-muted-text">${symbol}</p>

        <div className="mt-4 flex items-center justify-between font-mono text-xs text-muted-text">
          <span>
            {formatCount(minted)} / {supply > 0n ? formatCount(supply) : "∞"} minted
          </span>
        </div>
        {supply > 0n && (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background">
            <div className="h-full rounded-full bg-accent-blue" style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>
    </Link>
  );
}
