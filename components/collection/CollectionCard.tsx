"use client";

import { useEffect } from "react";
import Link from "next/link";
import { type Address } from "viem";
import { useCollectionInfo, useTotalPhases, usePhase } from "@/hooks/useCollection";
import { useCollectionMeta } from "@/hooks/useCollectionMeta";
import { TradingLockBadge } from "./TradingLockBadge";
import { VerifiedBadge } from "./SocialLinks";
import { formatCount, isPhaseActive, toGateway } from "@/lib/utils";
import { ImageOff } from "lucide-react";

type Category = "live" | "upcoming" | "ended";

interface Props {
  address: Address;
  filter?: Category;
  onCategorize?: (address: Address, category: Category) => void;
}

export function CollectionCard({ address, filter, onCategorize }: Props) {
  const { name, symbol, maxSupply, totalSupply, tradingLocked, placeholderURI, isLoading } = useCollectionInfo(address);
  const { data: totalPhases } = useTotalPhases(address);
  const { meta } = useCollectionMeta(address);

  const hasPhases = !!totalPhases && Number(totalPhases) > 0;
  const { phase } = usePhase(address, hasPhases ? 0 : -1);
  const status = phase ? isPhaseActive(phase.startTime, phase.endTime, phase.active).status : null;

  const category: Category | undefined = hasPhases && status ? (status as Category) : undefined;

  useEffect(() => {
    if (!onCategorize || isLoading || !name || !category) return;
    onCategorize(address, category);
  }, [onCategorize, address, category, isLoading, name]);

  if (filter && category !== filter) return null;

  if (isLoading || !name) {
    return <div className="rounded-xl border border-border bg-panel h-[300px] animate-pulse" />;
  }

  const minted = totalSupply ?? 0n;
  const supply = maxSupply ?? 0n;
  const pct = supply > 0n ? Math.round((Number(minted) / Number(supply)) * 100) : 0;
  const imageUrl = toGateway(placeholderURI as string | undefined);

  return (
    <Link
      href={`/collections/${address}`}
      className="group block overflow-hidden rounded-xl border border-border bg-panel transition-all hover:border-accent-blue/40 hover:shadow-lg"
    >
      <div className="relative h-48 w-full overflow-hidden bg-panel">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-text">
            <ImageOff size={40} />
          </div>
        )}
        {tradingLocked && (
          <div className="absolute top-3 right-3">
            <TradingLockBadge lock={true} />
          </div>
        )}
        {status === 'live' && (
          <div className="absolute top-3 left-3 rounded-full bg-green-500/90 px-2.5 py-1 text-xs font-semibold text-white flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            Live
          </div>
        )}
        {status === 'upcoming' && (
          <div className="absolute top-3 left-3 rounded-full bg-yellow-500/90 px-2.5 py-1 text-xs font-semibold text-white">
            Coming Soon
          </div>
        )}
        {status === 'ended' && (
          <div className="absolute top-3 left-3 rounded-full bg-muted-text/80 px-2.5 py-1 text-xs font-semibold text-white">
            Ended
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-main-text leading-tight">{name}</h3>
          {meta?.verified && <VerifiedBadge />}
        </div>
        <p className="font-mono text-xs text-muted-text mb-3">${symbol}</p>

        <div className="flex items-center justify-between font-mono text-xs text-muted-text mb-2">
          <span>{formatCount(minted)} / {supply > 0n ? formatCount(supply) : "∞"} minted</span>
          {supply > 0n && <span>{pct}%</span>}
        </div>
        {supply > 0n && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-background">
            <div className="h-full rounded-full bg-accent-blue transition-all" style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>
    </Link>
  );
}
