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
  useSetPhaseActive,
  useIsAdmin,
  useTransferOwnership,
} from "@/hooks/useCollection";
import { formatEther, formatCount, shortenAddress } from "@/lib/utils";
import { PhaseBuilder } from "@/components/dashboard/PhaseBuilder";
import { CollectionInfoEditor } from "@/components/dashboard/CollectionInfoEditor";
import { AllowlistManager } from "@/components/dashboard/AllowlistManager";
import { SocialsEditor } from "@/components/dashboard/SocialsEditor";
import {
  TrendingUp, Layers, Lock, Unlock, AlertCircle,
  Loader2, Crown, Users, Globe,
} from "lucide-react";

export default function DashboardPage() {
  const { slug } = useParams();
  const address = slug as Address;
  const { address: userAddress } = useAccount();
  const { isAdmin } = useIsAdmin();

  const {
    name, symbol, maxSupply, totalSupply,
    tradingLocked, owner, isLoading,
  } = useCollectionInfo(address);

  const { data: totalPhases } = useTotalPhases(address);
  const { setLocked, isPending: lockPending, isConfirming: lockConfirming, isConfirmed: lockConfirmed } =
    useSetTradingLock(address);

  const [confirmingLockChange, setConfirmingLockChange] = useState(false);
  const [showPhaseBuilder, setShowPhaseBuilder] = useState(false);
  const [editingPhaseId, setEditingPhaseId] = useState<number | null>(null);
  const [adminKey, setAdminKey] = useState("");
  const [adminKeyEntered, setAdminKeyEntered] = useState(false);

  const isOwner = !!userAddress && !!owner &&
    userAddress.toLowerCase() === owner.toLowerCase();
  const hasAccess = isOwner || isAdmin;

  const phaseIds = totalPhases ? Array.from({ length: Number(totalPhases) }, (_, i) => i) : [];

  const minted = totalSupply ?? 0n;
  const supply = maxSupply ?? 0n;
  const pct = supply > 0n ? Math.round((Number(minted) / Number(supply)) * 100) : 0;

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

  if (!hasAccess) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
        <h1 className="text-2xl font-bold text-main-text">Access Denied</h1>
        <p className="text-muted-text">Only the collection owner can access this dashboard.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-main-text">{name}</h1>
              {isAdmin && (
                <span className="rounded-full bg-accent-blue/10 px-2.5 py-1 text-xs font-medium text-accent-blue flex items-center gap-1">
                  <Crown size={11} /> Admin
                </span>
              )}
            </div>
            <p className="text-sm text-muted-text font-mono">
              ${symbol} · {shortenAddress(address)}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<TrendingUp className="h-4 w-4 text-accent-blue" />} label="Minted"
            value={`${formatCount(minted)} / ${supply > 0n ? formatCount(supply) : "∞"}`}
            sub={supply > 0n ? `${pct}%` : undefined} />
          <StatCard icon={<Layers className="h-4 w-4 text-green-400" />} label="Phases"
            value={String(phaseIds.length)} />
          <StatCard
            icon={tradingLocked ? <Lock className="h-4 w-4 text-red-400" /> : <Unlock className="h-4 w-4 text-green-400" />}
            label="Trading" value={tradingLocked ? "Locked" : "Open"} />
          <StatCard icon={<Users className="h-4 w-4 text-muted-text" />} label="Owner"
            value={isOwner ? "You" : shortenAddress(owner ?? "0x")} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Phase Breakdown */}
            <div className="rounded-xl border border-border bg-panel p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-main-text">Phase Breakdown</h2>
                {isAdmin && (
                  <button
                    onClick={() => { setShowPhaseBuilder((s) => !s); setEditingPhaseId(null); }}
                    className="rounded-lg border border-accent-blue/30 px-3 py-1.5 text-xs font-medium text-accent-blue hover:bg-accent-blue/10 transition-colors"
                  >
                    {showPhaseBuilder ? "Cancel" : "+ Add Phase"}
                  </button>
                )}
              </div>

              {isAdmin && showPhaseBuilder && (
                <div className="mb-6 rounded-lg border border-border bg-background p-4">
                  <PhaseBuilder collection={address} onDone={() => setShowPhaseBuilder(false)} />
                </div>
              )}

              {phaseIds.length === 0 ? (
                <p className="text-sm text-muted-text">
                  {isAdmin ? "No phases yet. Add one to start minting." : "No phases yet. Check back soon."}
                </p>
              ) : (
                <div className="space-y-3">
                  {phaseIds.map((id) => (
                    <div key={id}>
                      <PhaseRow
                        collection={address}
                        phaseId={id}
                        isAdmin={isAdmin}
                        isEditing={editingPhaseId === id}
                        onEditToggle={() => {
                          setEditingPhaseId((cur) => (cur === id ? null : id));
                          setShowPhaseBuilder(false);
                        }}
                      />
                      {editingPhaseId === id && isAdmin && (
                        <EditPhasePanel collection={address} phaseId={id} onDone={() => setEditingPhaseId(null)} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Allowlist management */}
            {phaseIds.length > 0 && (
              <div className="rounded-xl border border-border bg-panel p-6">
                <h2 className="text-sm font-semibold text-main-text mb-4">Manage Allowlists</h2>
                <AllowlistManager collection={address} phaseIds={phaseIds} />
              </div>
            )}

            {/* Admin: Collection Info */}
            {isAdmin && (
              <div className="rounded-xl border border-border bg-panel p-6">
                <h2 className="text-sm font-semibold text-main-text mb-4 flex items-center gap-2">
                  <Crown size={14} className="text-accent-blue" /> Collection Info
                </h2>
                <CollectionInfoEditor collection={address} />
              </div>
            )}

            {/* Admin: Socials & Verification */}
            {isAdmin && (
              <div className="rounded-xl border border-border bg-panel p-6">
                <h2 className="text-sm font-semibold text-main-text mb-4 flex items-center gap-2">
                  <Globe size={14} className="text-accent-blue" /> Socials & Verification
                </h2>
                {!adminKeyEntered ? (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-text">Enter your admin key to manage socials and verification status.</p>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={adminKey}
                        onChange={(e) => setAdminKey(e.target.value)}
                        placeholder="Admin key"
                        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-main-text focus:border-accent-blue/50 focus:outline-none"
                      />
                      <button
                        onClick={() => setAdminKeyEntered(true)}
                        disabled={!adminKey}
                        className="rounded-lg bg-accent-blue px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                      >
                        Unlock
                      </button>
                    </div>
                  </div>
                ) : (
                  <SocialsEditor collection={address} adminKey={adminKey} />
                )}
              </div>
            )}

            {/* Admin: Reveal */}
            {isAdmin && (
              <div className="rounded-xl border border-border bg-panel p-6">
                <h2 className="text-sm font-semibold text-main-text mb-2 flex items-center gap-2">
                  <Crown size={14} className="text-accent-blue" /> Reveal Collection
                </h2>
                <p className="text-sm text-muted-text">
                  Upload all token images + traits CSV → get baseURI → call reveal(). Not built yet.
                </p>
              </div>
            )}

            {/* Admin: Transfer ownership */}
            {isAdmin && (
              <TransferOwnershipPanel collection={address} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Trading lock */}
            <div className="rounded-xl border border-border bg-panel p-5">
              <h3 className="text-sm font-semibold text-main-text mb-1">Trading</h3>
              <p className="text-xs text-muted-text mb-3">
                {tradingLocked
                  ? "Holders cannot transfer or list right now."
                  : "Holders can freely trade this collection."}
              </p>

              {!confirmingLockChange ? (
                <button
                  onClick={() => setConfirmingLockChange(true)}
                  disabled={lockPending || lockConfirming}
                  className={`w-full flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
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
                      ? "Unlocking lets holders transfer immediately. Continue?"
                      : "Locking stops all transfers immediately. Continue?"}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => { await setLocked(!tradingLocked); setConfirmingLockChange(false); }}
                      disabled={lockPending || lockConfirming}
                      className="rounded-lg bg-accent-blue px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {lockPending || lockConfirming ? <Loader2 size={12} className="animate-spin" /> : null}
                      Confirm
                    </button>
                    <button onClick={() => setConfirmingLockChange(false)} className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-text">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {lockConfirmed && <p className="mt-2 text-xs text-green-400">Trading status updated.</p>}
            </div>

            {/* Contract info — updated to mainnet */}
            <div className="rounded-xl border border-border bg-panel p-5">
              <h3 className="text-sm font-semibold text-main-text mb-3">Contract</h3>
              <a
                href={`https://etherscan.io/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent-blue hover:underline font-mono block"
              >
                {shortenAddress(address)}
              </a>
              <p className="text-xs text-muted-text mt-1">Ethereum Mainnet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function StatCard({ icon, label, value, sub }: {
  icon: React.ReactNode; label: string; value: string; sub?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-panel p-4">
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-muted-text">{label}</span></div>
      <p className="text-xl font-bold text-main-text">
        {value}
        {sub && <span className="text-xs text-muted-text font-normal ml-1.5">({sub})</span>}
      </p>
    </div>
  );
}

function PhaseRow({ collection, phaseId, isAdmin, isEditing, onEditToggle }: {
  collection: Address; phaseId: number; isAdmin: boolean; isEditing: boolean; onEditToggle: () => void;
}) {
  const { phase, phaseMinted } = usePhase(collection, phaseId);
  const { setPhaseActive, isPending, isConfirming } = useSetPhaseActive(collection);
  const toggling = isPending || isConfirming;

  if (!phase) return <div className="h-12 animate-pulse rounded-lg bg-background" />;

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0 gap-3">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-main-text">{phase.name}</p>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
            phase.active ? "bg-green-500/10 text-green-400" : "bg-muted-text/10 text-muted-text"
          }`}>
            {phase.active ? "Active" : "Inactive"}
          </span>
        </div>
        <p className="text-xs text-muted-text">
          {phaseMinted?.toString() ?? "0"} / {phase.maxSupply > 0n ? phase.maxSupply.toString() : "∞"} minted
          {" · "}{phase.price === 0n ? "Free" : `${formatEther(phase.price)} ETH`}
        </p>
      </div>
      {isAdmin && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPhaseActive(phaseId, !phase.active)}
            disabled={toggling}
            className="rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-text hover:text-main-text disabled:opacity-50 transition-colors"
          >
            {toggling ? <Loader2 size={12} className="animate-spin" /> : phase.active ? "Pause" : "Resume"}
          </button>
          <button
            onClick={onEditToggle}
            className={`rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
              isEditing
                ? "border-accent-blue/40 text-accent-blue bg-accent-blue/10"
                : "border-border text-muted-text hover:text-main-text"
            }`}
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>
      )}
    </div>
  );
}

function EditPhasePanel({ collection, phaseId, onDone }: {
  collection: Address; phaseId: number; onDone: () => void;
}) {
  const { phase } = usePhase(collection, phaseId);
  if (!phase) return <div className="mt-2 h-48 animate-pulse rounded-lg bg-background" />;
  return (
    <div className="mt-2 mb-4 rounded-lg border border-accent-blue/20 bg-background p-4">
      <PhaseBuilder collection={collection} mode="edit" phaseId={phaseId} existingPhase={phase} onDone={onDone} />
    </div>
  );
}

function TransferOwnershipPanel({ collection }: { collection: Address }) {
  const [newOwner, setNewOwner] = useState("");
  const [confirming, setConfirming] = useState(false);
  const { transferOwnership, isPending, isConfirming, isConfirmed } = useTransferOwnership(collection);
  const busy = isPending || isConfirming;

  return (
    <div className="rounded-xl border border-border bg-panel p-6">
      <h2 className="text-sm font-semibold text-main-text mb-1 flex items-center gap-2">
        <Crown size={14} className="text-accent-blue" /> Transfer to Creator
      </h2>
      <p className="text-xs text-muted-text mb-4">
        Once transferred, the creator's wallet will own this collection. This cannot be undone.
      </p>

      {!confirming ? (
        <div className="flex gap-2">
          <input
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
            placeholder="Creator's wallet address 0x..."
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-main-text focus:border-accent-blue/50 focus:outline-none font-mono"
          />
          <button
            onClick={() => setConfirming(true)}
            disabled={!newOwner.startsWith("0x") || newOwner.length !== 42}
            className="rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-40 transition-colors"
          >
            Transfer
          </button>
        </div>
      ) : (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm">
          <p className="text-red-400 mb-3">
            Transfer ownership to <span className="font-mono">{shortenAddress(newOwner)}</span>? This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={async () => { await transferOwnership(newOwner as Address); }}
              disabled={busy}
              className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 flex items-center gap-1.5"
            >
              {busy ? <Loader2 size={12} className="animate-spin" /> : null}
              Confirm Transfer
            </button>
            <button onClick={() => setConfirming(false)} className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-text">
              Cancel
            </button>
          </div>
        </div>
      )}
      {isConfirmed && <p className="mt-2 text-xs text-green-400">Ownership transferred successfully.</p>}
    </div>
  );
}
