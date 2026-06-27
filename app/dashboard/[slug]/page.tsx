"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { type Address, isAddress } from "viem";
import {
  useCollectionInfo,
  useTotalPhases,
  usePhase,
  useSetTradingLock,
} from "@/hooks/useCollection";
import { formatEther, formatCount, shortenAddress } from "@/lib/utils";
import {
  TrendingUp,
  Layers,
  Lock,
  Unlock,
  AlertCircle,
  Settings,
  Loader2,
} from "lucide-react";

export default function DashboardPage() {
  const { slug } = useParams();
  const address = slug as Address;
  const { address: userAddress } = useAccount();

  const {
    name, symbol, maxSupply, totalSupply, revealed,
    tradingLocked, owner, isLoading,
  } = useCollectionInfo(address);

  const { data: totalPhases } = useTotalPhases(address);
  const { setLocked, isPending, isConfirming, isConfirmed } = useSetTradingLock(address);
  const [confirmingLockChange, setConfirmingLockChange] = useState(false);

  const isOwner = !!userAddress && !!owner && userAddress.toLowerCase() === owner.toLowerCase();

  const phaseIds = totalPhases ? Array.from({ length: Number(totalPhases) }, (_, i) => i) : [];

  if (!isAddress(address)) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center text-red-400">
        Invalid collection address
      </div>
    );
  }

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-24 text-center text-muted-text">Loading...</div>;
  }

  if (!name) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center text-muted-text">
        Collection not found or failed to load
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
        <h1 className="text-2xl font-bold text-main-text">Access Denied</h1>
        <p className="text-muted-text">Only the collection owner can access this dashboard.</p>
      </div>
    );
  }

  const minted = totalSupply ?? 0n;
  const supply = maxSupply ?? 0n;
  const pct = supply > 0n ? Math.round((Number(minted) / Number(supply)) * 100) : 0;

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-main-text">{name}</h1>
            <p className="text-sm text-muted-text font-mono">
              ${symbol} · {shortenAddress(address)}
            </p>
          </div>
          <button className="rounded-lg border border-border px-4 py-2 text-sm text-muted-text hover:text-main-text hover:border-accent-blue/30 transition-colors flex items-center gap-1.5">
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<TrendingUp className="h-4 w-4 text-accent-blue" />}
            label="Minted"
            value={`${formatCount(minted)} / ${supply > 0n ? formatCount(supply) : "∞"}`}
            sub={supply > 0n ? `${pct}%` : undefined}
          />
          <StatCard
            icon={<Layers className="h-4 w-4 text-green-400" />}
            label="Phases"
            value={String(phaseIds.length)}
          />
          <StatCard
            icon={revealed ? <Unlock className="h-4 w-4 text-green-400" /> : <Lock className="h-4 w-4 text-yellow-400" />}
            label="Reveal Status"
            value={revealed ? "Revealed" : "Hidden"}
          />
          <StatCard
            icon={tradingLocked ? <Lock className="h-4 w-4 text-red-400" /> : <Unlock className="h-4 w-4 text-green-400" />}
            label="Trading"
            value={tradingLocked ? "Locked" : "Open"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-border bg-panel p-6">
              <h2 className="text-sm font-semibold text-main-text mb-4">Phase Breakdown</h2>
              {phaseIds.length === 0 ? (
                <p className="text-sm text-muted-text">
                  No phases yet. Add one to start minting. (Add Phase form — coming soon.)
                </p>
              ) : (
                <div className="space-y-3">
                  {phaseIds.map((id) => (
                    <PhaseStatRow key={id} collection={address} phaseId={id} />
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-panel p-6">
              <h2 className="text-sm font-semibold text-main-text mb-2">Reveal Collection</h2>
              <p className="text-sm text-muted-text">
                Upload metadata via the platform's metadata API, then call reveal(baseURI). Not built yet.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-panel p-5">
              <h3 className="text-sm font-semibold text-main-text mb-3">Trading</h3>
              <p className="text-xs text-muted-text mb-3">
                {tradingLocked
                  ? "Holders cannot transfer or list this collection right now."
                  : "Holders can freely trade this collection."}
              </p>

              {!confirmingLockChange ? (
                <button
                  onClick={() => setConfirmingLockChange(true)}
                  disabled={isPending || isConfirming}
                  className={`w-full rounded-lg border py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
                    tradingLocked
                      ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                      : "border-accent-blue/30 text-accent-blue hover:bg-accent-blue/10"
                  }`}
                >
                  {tradingLocked ? <Unlock size={14} /> : <Lock size={14} />}
                  {tradingLocked ? "Unlock trading" : "Lock trading"}
                </button>
              ) : (
                <div className="rounded-lg border border-border bg-background p-3 text-sm">
                  <p className="text-main-text mb-3">
                    {tradingLocked
                      ? "Unlocking lets holders transfer and list immediately. Continue?"
                      : "Locking stops all transfers immediately, including marketplace listings. Continue?"}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        await setLocked(!tradingLocked);
                        setConfirmingLockChange(false);
                      }}
                      disabled={isPending || isConfirming}
                      className="rounded-lg bg-accent-blue px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {isPending || isConfirming ? <Loader2 size={12} className="animate-spin" /> : null}
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmingLockChange(false)}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-text"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {isConfirmed && (
                <p className="mt-2 text-xs text-green-400">Trading status updated.</p>
              )}
            </div>

            <div className="rounded-xl border border-border bg-panel p-5">
              <h3 className="text-sm font-semibold text-main-text mb-3">Allowlist</h3>
              <p className="text-xs text-muted-text">
                Upload a wallet list and call the Merkle API to get a root. Not built yet.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-panel p-5">
              <h3 className="text-sm font-semibold text-main-text mb-3">Contract</h3>
              <code className="text-xs text-muted-text font-mono block">{shortenAddress(address)}</code>
              <p className="text-xs text-muted-text mt-1">Sepolia testnet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-panel p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-muted-text">{label}</span>
      </div>
      <p className="text-xl font-bold text-main-text">
        {value}
        {sub && <span className="text-xs text-muted-text font-normal ml-1.5">({sub})</span>}
      </p>
    </div>
  );
}

function PhaseStatRow({ collection, phaseId }: { collection: Address; phaseId: number }) {
  const { phase, phaseMinted } = usePhase(collection, phaseId);

  if (!phase) {
    return <div className="h-12 animate-pulse rounded-lg bg-background" />;
  }

  const revenue = phase.price * (phaseMinted ?? 0n);

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-medium text-main-text">{phase.name}</p>
        <p className="text-xs text-muted-text">
          {phaseMinted?.toString() ?? "0"} / {phase.maxSupply > 0n ? phase.maxSupply.toString() : "∞"} minted
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm text-main-text">
          {phase.price === 0n ? "Free" : `${formatEther(phase.price)} ETH`}
        </p>
        <p className="text-xs text-muted-text">
          {phase.price === 0n ? "-" : `${formatEther(revenue)} ETH revenue`}
        </p>
      </div>
    </div>
  );
}
