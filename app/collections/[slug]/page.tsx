"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  useCollectionInfo,
  useTotalPhases,
  useContractMetadata,
} from "@/hooks/useCollection";
import { useCollectionMeta } from "@/hooks/useCollectionMeta";
import { MintProgress } from "@/components/collection/MintProgress";
import { PhaseRoadmap } from "@/components/collection/PhaseRoadmap";
import { SocialLinks } from "@/components/collection/SocialLinks";
import { shortenAddress, formatCount, toGateway } from "@/lib/utils";
import { useAccount, useChainId, usePublicClient } from "wagmi";
import { type Address, isAddress } from "viem";
import { COLLECTION_ABI } from "@/lib/contracts";
import { Crown, ExternalLink, Flame } from "lucide-react";
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

  const { metadata } = useContractMetadata(address);
  const { meta } = useCollectionMeta(address);
  const { data: totalPhases } = useTotalPhases(address);

  const [activeTab, setActiveTab] = useState<"mint" | "activity">("mint");

  const isOwner = userAddress?.toLowerCase() === owner?.toLowerCase();
  const minted = totalSupply ?? 0n;
  const supply = maxSupply ?? 0n;
  const pct = supply > 0n ? Math.round((Number(minted) / Number(supply)) * 100) : 0;
  const soldOut = supply > 0n && minted >= supply;

  const phaseIds = useMemo(() =>
    totalPhases ? Array.from({ length: Number(totalPhases) }, (_, i) => i) : [],
    [totalPhases]
  );

  const bannerUrl = toGateway(metadata?.banner);
  const logoUrl = toGateway(metadata?.image ?? (placeholderURI as string | undefined));

  if (!isAddress(address)) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center text-red-400">
        Invalid collection address
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 w-full bg-panel" />
        <div className="mx-auto max-w-3xl px-4 py-8 space-y-4">
          <div className="h-8 w-1/3 rounded bg-panel" />
          <div className="h-4 w-full rounded bg-panel" />
        </div>
      </div>
    );
  }

  if (!name) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center text-muted-text">
        Collection not found
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Full-width banner */}
      <div className="relative w-full h-48 sm:h-64 overflow-hidden bg-panel">
        {bannerUrl ? (
          <img src={bannerUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-accent-blue/30 to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Collection identity */}
        <div className="relative -mt-12 mb-6 flex items-end gap-4">
          {/* Logo */}
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-background bg-panel shadow-xl">
            {logoUrl ? (
              <img src={logoUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-accent-blue/10 text-accent-blue text-2xl font-bold">
                {name[0]}
              </div>
            )}
          </div>

          <div className="flex-1 pb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-main-text">{name}</h1>
              {meta?.verified && (
                <span className="flex items-center gap-1 rounded-full bg-accent-blue/10 px-2 py-0.5 text-xs font-medium text-accent-blue">
                  ✓ Verified
                </span>
              )}
              {meta?.featured && !soldOut && (
                <span className="flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-400">
                  <Flame size={10} /> Hot
                </span>
              )}
              {soldOut && (
                <span className="rounded-full bg-muted-text/10 px-2 py-0.5 text-xs font-medium text-muted-text">
                  Sold Out
                </span>
              )}
            </div>
            <p className="text-sm text-muted-text font-mono">${symbol}</p>
          </div>

          {isOwner && (
            <Link
              href={`/dashboard/${address}`}
              className="rounded-lg bg-accent-blue/10 border border-accent-blue/30 px-3 py-1.5 text-xs font-medium text-accent-blue flex items-center gap-1.5 hover:bg-accent-blue/20 transition-colors"
            >
              <Crown size={12} />
              Dashboard
            </Link>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="font-medium text-main-text">{pct}% minted</span>
            <span className="text-muted-text font-mono">
              {formatCount(minted)} / {supply > 0n ? formatCount(supply) : "∞"}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-panel">
            <div
              className="h-full rounded-full bg-accent-blue transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Description */}
        {metadata?.description && (
          <p className="mb-4 text-sm text-muted-text leading-relaxed">{metadata.description}</p>
        )}

        {/* Socials + contract */}
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <SocialLinks address={address} />
          <a
            href={`https://etherscan.io/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-text hover:text-main-text transition-colors"
          >
            <ExternalLink size={12} />
            {shortenAddress(address)}
          </a>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border mb-6">
          <TabButton active={activeTab === "mint"} onClick={() => setActiveTab("mint")}>
            ✨ Mint
          </TabButton>
          <TabButton active={activeTab === "activity"} onClick={() => setActiveTab("activity")}>
            📋 Activity
          </TabButton>
        </div>

        {activeTab === "mint" && (
          <div className="space-y-6 pb-12">
            <MintProgress collection={address} platformFlatFee={platformFlatFee} />

            {phaseIds.length > 0 && (
              <div>
                <h3 className="font-semibold text-main-text mb-3">Phases</h3>
                <div className="space-y-3">
                  {phaseIds.map((id) => (
                    <PhaseRoadmap key={id} collection={address} phaseId={id} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="pb-12">
            <ActivityFeed collection={address} />
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
        active
          ? "border-accent-blue text-accent-blue"
          : "border-transparent text-muted-text hover:text-main-text"
      }`}
    >
      {children}
    </button>
  );
}

type MintEvent = {
  minter: string;
  quantity: bigint;
  startTokenId: bigint;
  phaseId: bigint;
  txHash: string;
  blockNumber: bigint;
  timestamp?: number;
};

function ActivityFeed({ collection }: { collection: Address }) {
  const [events, setEvents] = useState<MintEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const publicClient = usePublicClient();

  useEffect(() => {
    if (!publicClient) return;

    publicClient.getLogs({
      address: collection,
      event: {
        type: "event",
        name: "Minted",
        inputs: [
          { type: "address", name: "minter", indexed: true },
          { type: "uint256", name: "phaseId", indexed: true },
          { type: "uint256", name: "quantity", indexed: false },
          { type: "uint256", name: "startTokenId", indexed: false },
        ],
      },
      fromBlock: "earliest",
    })
      .then(async (logs) => {
        const parsed = logs
          .slice(-20) // last 20 mint events
          .reverse()
          .map((log) => ({
            minter: log.args.minter as string,
            quantity: log.args.quantity as bigint,
            startTokenId: log.args.startTokenId as bigint,
            phaseId: log.args.phaseId as bigint,
            txHash: log.transactionHash ?? "",
            blockNumber: log.blockNumber ?? 0n,
          }));
        setEvents(parsed);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [collection, publicClient]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-panel" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="py-16 text-center text-muted-text">
        No mints yet — be the first!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event, i) => (
        <div
          key={`${event.txHash}-${i}`}
          className="flex items-center gap-3 rounded-xl border border-border bg-panel px-4 py-3"
        >
          {/* Avatar */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-blue/10 text-xs font-bold text-accent-blue">
            {event.minter.slice(2, 4).toUpperCase()}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-main-text truncate">
              <span className="font-mono">{shortenAddress(event.minter)}</span>
              {" "}minted{" "}
              <span className="font-semibold">{event.quantity.toString()} NFT{event.quantity > 1n ? "s" : ""}</span>
            </p>
          </div>

          {/* Tx link */}
          <a
            href={`https://etherscan.io/tx/${event.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-muted-text hover:text-accent-blue transition-colors"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      ))}
    </div>
  );
}
