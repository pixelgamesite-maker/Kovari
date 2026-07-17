"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  useCollectionInfo,
  useTotalPhases,
  useContractMetadata,
  useIsAdmin,
} from "@/hooks/useCollection";
import { useCollectionMeta } from "@/hooks/useCollectionMeta";
import { MintProgress } from "@/components/collection/MintProgress";
import { SocialLinks } from "@/components/collection/SocialLinks";
import { shortenAddress, formatCount, toGateway, isPhaseActive, formatEther } from "@/lib/utils";
import { useAccount, useChainId, usePublicClient, useReadContract } from "wagmi";
import { type Address, isAddress, zeroHash } from "viem";
import { COLLECTION_ABI } from "@/lib/contracts";
import { Crown, ExternalLink, Flame, CheckCircle, ShieldX, Loader2, Clock } from "lucide-react";
import Link from "next/link";
import { getMerkleProof, MerkleProofError } from "@/lib/platform-api";

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
  const { isAdmin } = useIsAdmin();

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
    return <div className="mx-auto max-w-7xl px-4 py-24 text-center text-red-400">Invalid collection address</div>;
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 w-full bg-panel" />
        <div className="mx-auto max-w-2xl px-4 py-8 space-y-4">
          <div className="h-8 w-1/3 rounded bg-panel" />
          <div className="h-4 w-full rounded bg-panel" />
        </div>
      </div>
    );
  }

  if (!name) {
    return <div className="mx-auto max-w-7xl px-4 py-24 text-center text-muted-text">Collection not found</div>;
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Banner */}
      <div className="relative w-full h-52 sm:h-72 overflow-hidden bg-panel">
        {bannerUrl ? (
          <img src={bannerUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-accent-blue/20 to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

        {/* Description overlaid on banner */}
        {metadata?.description && (
          <div className="absolute bottom-4 left-4 right-4 max-w-lg">
            <p className="text-xs text-white/80 leading-relaxed line-clamp-2 drop-shadow">
              {metadata.description}
            </p>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        {/* Identity row */}
        <div className="relative -mt-10 mb-5 flex items-end gap-3">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-background bg-panel shadow-xl">
            {logoUrl ? (
              <img src={logoUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-accent-blue/10 text-accent-blue text-2xl font-bold">
                {name[0]}
              </div>
            )}
          </div>
          <div className="flex-1 pb-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-main-text truncate">{name}</h1>
              {meta?.verified && (
                <span className="flex items-center gap-1 rounded-full bg-accent-blue/10 px-2 py-0.5 text-xs font-medium text-accent-blue shrink-0">
                  <CheckCircle size={10} /> Verified
                </span>
              )}
            </div>
          </div>
          {(isOwner || isAdmin) && (
            <Link
              href={`/dashboard/${address}`}
              className="rounded-lg bg-accent-blue/10 border border-accent-blue/30 px-3 py-1.5 text-xs font-medium text-accent-blue flex items-center gap-1.5 hover:bg-accent-blue/20 transition-colors shrink-0"
            >
              <Crown size={12} /> Dashboard
            </Link>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-main-text">{pct}% minted</span>
            <span className="text-muted-text font-mono">
              {formatCount(minted)} / {supply > 0n ? formatCount(supply) : "∞"}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-panel">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-blue to-blue-400 transition-all"
              style={{ width: `${Math.max(pct, pct > 0 ? 2 : 0)}%` }}
            />
          </div>
        </div>

        {/* Tag chips */}
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <a
            href={`https://etherscan.io/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-muted-text hover:text-main-text transition-colors font-mono"
          >
            ◆ {shortenAddress(address)}
          </a>
          <span className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-muted-text">
            📄 ERC721
          </span>
          {!soldOut && phaseIds.length > 0 && (
            <span className="flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-xs text-green-400">
              ✨ Minting
            </span>
          )}
          {soldOut && (
            <span className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-muted-text">
              ✓ Sold Out
            </span>
          )}
          {meta?.featured && !soldOut && (
            <span className="flex items-center gap-1 rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-xs text-orange-400">
              <Flame size={10} /> Hot
            </span>
          )}
        </div>

        {/* Social links (icon only + OpenSea auto) */}
        <div className="mb-6">
          <SocialLinks address={address} />
        </div>

        {/* Phases with eligibility */}
        {phaseIds.length > 0 && (
          <div className="mb-6 space-y-3">
            <h3 className="text-sm font-semibold text-main-text">Phases</h3>
            {phaseIds.map((id) => (
              <PhaseCard
                key={id}
                collection={address}
                phaseId={id}
                userAddress={userAddress}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}

        {/* Mint widget */}
        <div className="mb-8">
          <MintProgress collection={address} platformFlatFee={platformFlatFee} />
        </div>

        {/* Activity feed — inline, no tab */}
        <div>
          <h3 className="text-sm font-semibold text-main-text mb-3">Recent Activity</h3>
          <ActivityFeed collection={address} chainId={chainId} />
        </div>
      </div>
    </div>
  );
}

// Phase card with eligibility badge
function PhaseCard({ collection, phaseId, userAddress, isAdmin }: {
  collection: Address;
  phaseId: number;
  userAddress?: string;
  isAdmin: boolean;
}) {
  const { data: phase } = useReadContract({
    address: collection,
    abi: COLLECTION_ABI,
    functionName: 'getPhase',
    args: [BigInt(phaseId)],
  });
  const { data: phaseMinted } = useReadContract({
    address: collection,
    abi: COLLECTION_ABI,
    functionName: 'phaseMinted',
    args: [BigInt(phaseId)],
  });

  const [eligibility, setEligibility] = useState<'idle' | 'checking' | 'eligible' | 'ineligible'>('idle');

  useEffect(() => {
    if (!phase || !userAddress) return;
    const isAllowlist = phase.merkleRoot !== zeroHash;
    if (!isAllowlist || isAdmin) { setEligibility('eligible'); return; }

    setEligibility('checking');
    getMerkleProof({ collection, phaseId, address: userAddress })
      .then(() => setEligibility('eligible'))
      .catch((err) => {
        if (err instanceof MerkleProofError && (err.status === 404 || err.status === 400)) {
          setEligibility('ineligible');
        } else {
          setEligibility('idle');
        }
      });
  }, [phase, userAddress, collection, phaseId, isAdmin]);

  if (!phase) return <div className="h-20 animate-pulse rounded-xl bg-panel" />;

  const status = isPhaseActive(phase.startTime, phase.endTime, phase.active);
  const isAllowlist = phase.merkleRoot !== zeroHash;

  return (
    <div className={`rounded-xl border bg-panel p-4 ${
      status.status === 'live' ? 'border-green-500/30' : 'border-border'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-medium text-main-text text-sm">{phase.name}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              status.status === 'live' ? 'bg-green-500/10 text-green-400' :
              status.status === 'upcoming' ? 'bg-yellow-500/10 text-yellow-400' :
              'bg-muted-text/10 text-muted-text'
            }`}>
              {status.status === 'live' ? 'Live' : status.status === 'upcoming' ? 'Soon' : 'Ended'}
            </span>
            {isAllowlist && (
              <span className="rounded-full border border-accent-blue/20 bg-accent-blue/5 px-2 py-0.5 text-[10px] text-accent-blue">
                Allowlist
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-text flex-wrap">
            <span className="font-mono">{phase.price === 0n ? 'Free' : `${formatEther(phase.price)} ETH`}</span>
            {phase.maxPerWallet > 0 && (
              <span>Limit: {phase.maxPerWallet} per wallet</span>
            )}
            {phase.startTime > 0n && (
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {new Date(Number(phase.startTime) * 1000).toLocaleDateString(undefined, {
                  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                })}
              </span>
            )}
          </div>
        </div>

        {/* Eligibility badge — only show if wallet connected */}
        {userAddress && (
          <div className="shrink-0">
            {eligibility === 'checking' && (
              <span className="flex items-center gap-1 rounded-full bg-muted-text/10 px-2.5 py-1 text-xs text-muted-text">
                <Loader2 size={10} className="animate-spin" /> Checking
              </span>
            )}
            {eligibility === 'eligible' && (
              <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-1 text-xs text-green-400">
                <CheckCircle size={11} /> Eligible
              </span>
            )}
            {eligibility === 'ineligible' && (
              <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs text-red-400">
                <ShieldX size={11} /> Not eligible
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Activity feed — inline, no tab needed
type MintEvent = {
  minter: string;
  quantity: bigint;
  txHash: string;
};

function ActivityFeed({ collection, chainId }: { collection: Address; chainId: number }) {
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
      .then((logs) => {
        setEvents(
          logs.slice(-15).reverse().map((log) => ({
            minter: log.args.minter as string,
            quantity: log.args.quantity as bigint,
            txHash: log.transactionHash ?? "",
          }))
        );
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [collection, publicClient]);

  const etherscanBase = chainId === 8453 ? 'https://basescan.org' : 'https://etherscan.io';

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-xl bg-panel" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-panel py-10 text-center text-sm text-muted-text">
        No mints yet — be the first!
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-panel overflow-hidden divide-y divide-border">
      {events.map((event, i) => (
        <div key={`${event.txHash}-${i}`} className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-blue/10 text-[11px] font-bold text-accent-blue">
            {event.minter.slice(2, 4).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-main-text">
              <span className="font-mono text-xs">{shortenAddress(event.minter)}</span>
              {" "}
              <span className="text-muted-text">minted</span>
              {" "}
              <span className="font-semibold">{event.quantity.toString()} NFT{event.quantity > 1n ? "s" : ""}</span>
            </p>
          </div>
          <a
            href={`${etherscanBase}/tx/${event.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-muted-text hover:text-accent-blue transition-colors"
          >
            <ExternalLink size={13} />
          </a>
        </div>
      ))}
    </div>
  );
}
