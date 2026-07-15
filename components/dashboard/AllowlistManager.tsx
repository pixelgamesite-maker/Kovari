"use client";

import { useMemo, useState } from "react";
import { type Address, isAddress } from "viem";
import { usePhase } from "@/hooks/useCollection";
import { buildMerkleRoot } from "@/lib/platform-api";
import { Loader2, AlertTriangle } from "lucide-react";
import { useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { COLLECTION_ABI } from "@/lib/contracts";

interface Props {
  collection: Address;
  phaseIds: number[];
}

export function AllowlistManager({ collection, phaseIds }: Props) {
  const [selectedPhase, setSelectedPhase] = useState(phaseIds[0] ?? 0);

  return (
    <div>
      {phaseIds.length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {phaseIds.map((id) => (
            <PhaseTab key={id} collection={collection} phaseId={id}
              isSelected={selectedPhase === id} onSelect={() => setSelectedPhase(id)} />
          ))}
        </div>
      )}
      <AllowlistEditor collection={collection} phaseId={selectedPhase} />
    </div>
  );
}

function PhaseTab({ collection, phaseId, isSelected, onSelect }: {
  collection: Address; phaseId: number; isSelected: boolean; onSelect: () => void;
}) {
  const { phase } = usePhase(collection, phaseId);
  return (
    <button
      onClick={onSelect}
      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
        isSelected
          ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
          : "border-border text-muted-text hover:text-main-text"
      }`}
    >
      {phase?.name ?? `Phase ${phaseId}`}
    </button>
  );
}

function AllowlistEditor({ collection, phaseId }: { collection: Address; phaseId: number }) {
  const { phase } = usePhase(collection, phaseId);
  const chainId = useChainId();
  const chain = chainId === 8453 ? "base" : "mainnet";
  const [addressText, setAddressText] = useState("");
  const [isBuilding, setIsBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContract, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const addresses = useMemo(() =>
    addressText.split("\n").map((l) => l.trim()).filter((l) => l.length > 0 && isAddress(l)),
    [addressText]
  );

  const isPublicPhase = phase?.merkleRoot === "0x0000000000000000000000000000000000000000000000000000000000000000";
  const busy = isBuilding || isPending || isConfirming;

  const handleUpdate = async () => {
    setError(null);
    if (addresses.length === 0) {
      setError("No valid addresses found.");
      return;
    }
    try {
      setIsBuilding(true);
      const { root } = await buildMerkleRoot(addresses, collection, phaseId, chain as "mainnet" | "base");
      setIsBuilding(false);
      await writeContract({
        address: collection,
        abi: COLLECTION_ABI,
        functionName: 'setMerkleRoot',
        args: [BigInt(phaseId), root],
      });
    } catch (err: any) {
      setIsBuilding(false);
      setError(err.message || "Failed to update allowlist");
    }
  };

  if (!phase) return <div className="h-32 animate-pulse rounded-lg bg-background" />;

  if (isPublicPhase) {
    return (
      <div className="rounded-lg border border-border bg-background p-4 text-sm text-muted-text">
        This is a public phase — no allowlist required.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 flex items-start gap-2 text-xs text-yellow-400">
        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
        <span>
          Paste the <strong>complete</strong> wallet list — all existing wallets plus any new ones you're adding.
          The current list can't be read back from the chain, so updating it fully replaces whatever was there before.
        </span>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-main-text">Wallet addresses</label>
          <span className="text-xs text-muted-text">{addresses.length} valid</span>
        </div>
        <p className="text-xs text-muted-text mb-2">Enter addresses separated by new lines. No CSV, no cap.</p>
        <textarea
          value={addressText}
          onChange={(e) => setAddressText(e.target.value)}
          rows={8}
          placeholder={"0x83be849f0f51D23F17e49838f2811E3178226d6a\n0x1504734c6e17ee446a65d987c239952e46fb28e5"}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-main-text focus:border-accent-blue/50 focus:outline-none"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-400">{error}</div>
      )}

      {isConfirmed && (
        <p className="text-sm text-green-400">Allowlist updated successfully.</p>
      )}

      <button
        onClick={handleUpdate}
        disabled={busy || addresses.length === 0}
        className="w-full rounded-lg bg-accent-blue py-3 font-medium text-white hover:bg-accent-blue/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        {isBuilding ? (
          <><Loader2 size={16} className="animate-spin" /> Building allowlist...</>
        ) : isPending ? (
          <><Loader2 size={16} className="animate-spin" /> Confirm in wallet...</>
        ) : isConfirming ? (
          <><Loader2 size={16} className="animate-spin" /> Updating...</>
        ) : (
          `Update Allowlist (${addresses.length} addresses)`
        )}
      </button>
    </div>
  );
}
