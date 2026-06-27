"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useCollectionInfo, useTotalPhases, useTotalTicketPhases } from "@/hooks/useCollection";
import { MintProgress } from "@/components/collection/MintProgress";
import { PhaseRoadmapItem } from "@/components/collection/PhaseRoadmap";
import { TradingLockBadge } from "@/components/collection/TradingLockBadge";
import { ChainBadge } from "@/components/collection/ChainBadge";
import { shortenAddress, formatCount } from "@/lib/utils";
import { useAccount, useChainId } from "wagmi";
import { type Address, isAddress } from "viem";
import { ImageOff, ExternalLink, Crown } from "lucide-react";
import Link from "next/link";

export default function CollectionPage() {
  const { slug } = useParams();
  const address = slug as Address;
  const { address: userAddress } = useAccount();
  const chainId = useChainId();

  const {
    name, symbol, maxSupply, totalSupply, revealed,
    tradingLocked, owner, placeholderURI, platformFlatFee, isLoading
  } = useCollectionInfo(address);

  const { data: totalPhases } = useTotalPhases(address);
  const { data: totalTicketPhases } = useTotalTicketPhases(address);

  const isOwner = userAddress?.toLowerCase() === owner?.toLowerCase();
  const minted = totalSupply ?? 0n;

  const isUnlimited = maxSupply === 0n;
  const supply = isUnlimited ? null : (maxSupply ?? 1n);
  const pct = supply && supply > 0n
    ? Math.round((Number(minted) / Number(supply)) * 100)
    : 0;

  const phaseIds = useMemo(() =>
    totalPhases ? Array.from({ length: Number(totalPhases) }, (_, i) => i) : [],
    [totalPhases]
  );

  if (!isAddress(address)) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center text-red-400">
        Invalid collection address
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="animate-pulse space-y-4 max-w-md mx-auto">
          <div className="h-64 rounded-xl bg-panel" />
          <div className="h-8 w-1/2 rounded bg-panel mx-auto" />
          <div className="h-4 w-1/3 rounded bg-panel mx-auto" />
        </div>
      </div>
    );
  }

  if (!name) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center text-muted-text">
        Collection not found or failed to load
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-text">
        <Link href="/" className="hover:text-main-text transition-colors">Discover</Link>
        <span>/</span>
        <span className="text-main-text">{name}</span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-6">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-panel">
            {placeholderURI ? (
              <Image
                src={placeholderURI}
                alt={name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-text">
                <ImageOff size={64} />
              </div>
            )}
            {tradingLocked && (
              <div className="absolute top-4 right-4">
                <TradingLockBadge lock={true} />
              </div>
            )}
            {isOwner && (
              <Link
                href={`/dashboard/${address}`}
                className="absolute top-4 left-4 rounded-lg bg-accent-blue/90 px-3 py-1.5 text-xs font-medium text-white flex items-center gap-1.5 hover:bg-accent-blue transition-colors"
              >
                <Crown size={14} />
                Dashboard
              </Link>
            )}
          </div>

          <div className="rounded-xl border border-border bg-panel p-5 space-y-4">
            <h3 className="font-semibold text-main-text">Collection Info</h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-xs text-muted-text mb-1">Contract</span>
                <a
                  href={`https://sepolia.etherscan.io/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-accent-blue hover:underline flex items-center gap-1"
                >
                  {shortenAddress(address)}
                  <ExternalLink size={12} />
                </a>
              </div>
              <div>
                <span className="block text-xs text-muted-text mb-1">Creator</span>
                <span className="font-mono text-main-text">{shortenAddress(owner ?? "0x")}</span>
              </div>
              <div>
                <span className="block text-xs text-muted-text mb-1">Symbol</span>
                <span className="font-mono text-main-text">${symbol}</span>
              </div>
              <div>
                <span className="block text-xs text-muted-text mb-1">Chain</span>
                <ChainBadge chainId={chainId} />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-text">Minted</span>
                <span className="font-mono text-sm">
                  {formatCount(minted)} / {supply !== null ? formatCount(supply) : "∞"}
                  {supply !== null && ` (${pct}%)`}
                </span>
              </div>
              {supply !== null && (
                <div className="h-2 w-full rounded-full bg-background overflow-hidden">
                  <div className="h-full rounded-full bg-accent-blue transition-all" style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>

            {revealed && (
              <div className="pt-2 text-xs text-green-400">✓ Revealed</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-main-text mb-2">{name}</h1>
            <p className="text-muted-text">${symbol} on Sepolia Testnet</p>
          </div>

          <MintProgress collection={address} platformFlatFee={platformFlatFee} />

          {phaseIds.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-main-text">Mint Phases</h3>
              <div className="space-y-3">
                {phaseIds.map((id) => (
                  <PhaseRoadmapItem key={id} collection={address} phaseId={id} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
