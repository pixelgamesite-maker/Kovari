"use client";

import { useState, useCallback, useMemo } from "react";
import { useAccount } from "wagmi";
import { useMint, usePhase, useTotalPhases } from "@/hooks/useCollection";
import { getMerkleProof } from "@/lib/platform-api";
import { formatEther, isPhaseActive } from "@/lib/utils";
import { type Address } from "viem";
import { Minus, Plus, AlertTriangle, Loader2, CheckCircle } from "lucide-react";

interface Props {
  collection: Address;
  platformFlatFee: bigint | undefined;
}

export function MintProgress({ collection, platformFlatFee }: Props) {
  const { address } = useAccount();
  const { data: totalPhases } = useTotalPhases(collection);
  const [quantity, setQuantity] = useState(1);
  const [selectedPhaseId, setSelectedPhaseId] = useState<number | null>(null);
  const [isFetchingProof, setIsFetchingProof] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { mint, isPending, hash } = useMint(collection);

  const phaseIds = useMemo(() =>
    totalPhases ? Array.from({ length: Number(totalPhases) }, (_, i) => i) : [],
    [totalPhases]
  );

  const effectivePhaseId = selectedPhaseId ?? (phaseIds.length > 0 ? phaseIds[0] : null);
  const { phase, phaseMinted, claimed } = usePhase(collection, effectivePhaseId ?? -1);

  const handleMint = useCallback(async () => {
    if (!address || effectivePhaseId === null || !phase || platformFlatFee === undefined) return;

    setError(null);
    setSuccess(false);
    setIsFetchingProof(true);

    try {
      const status = isPhaseActive(phase.startTime, phase.endTime, phase.active);
      if (status.status !== "live") {
        throw new Error(`Phase is ${status.status}: ${status.label}`);
      }

      if (phase.maxPerWallet > 0n) {
        const alreadyClaimed = claimed ?? 0n;
        if (alreadyClaimed + BigInt(quantity) > BigInt(phase.maxPerWallet)) {
          throw new Error(`Wallet limit: ${phase.maxPerWallet} per wallet. You've claimed ${alreadyClaimed}.`);
        }
      }

      if (phase.maxSupply > 0n && phaseMinted && phaseMinted + BigInt(quantity) > BigInt(phase.maxSupply)) {
        throw new Error("Not enough supply remaining in this phase");
      }

      let proof: `0x${string}`[] = [];
      const isAllowlist = phase.merkleRoot !== "0x0000000000000000000000000000000000000000000000000000000000000000";

      if (isAllowlist) {
        const proofRes = await getMerkleProof({
          collection,
          phaseId: effectivePhaseId,
          address,
        });
        proof = proofRes.proof;
      }

      const unitPrice = phase.price + platformFlatFee;
      const totalPayment = BigInt(quantity) * unitPrice;

      setIsFetchingProof(false);
      await mint(effectivePhaseId, quantity, proof, totalPayment);
      setSuccess(true);
    } catch (err: any) {
      setIsFetchingProof(false);
      setError(err.message || "Mint failed");
    }
  }, [address, effectivePhaseId, phase, platformFlatFee, quantity, claimed, phaseMinted, collection, mint]);

  if (!address) {
    return (
      <div className="rounded-xl border border-border bg-panel p-6 text-center">
        <p className="text-muted-text">Connect your wallet to mint</p>
      </div>
    );
  }

  if (!phase) {
    return (
      <div className="rounded-xl border border-border bg-panel p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-1/2 rounded bg-background" />
          <div className="h-8 w-full rounded bg-background" />
        </div>
      </div>
    );
  }

  const status = isPhaseActive(phase.startTime, phase.endTime, phase.active);
  const isAllowlist = phase.merkleRoot !== "0x0000000000000000000000000000000000000000000000000000000000000000";
  const unitPrice = phase.price + (platformFlatFee ?? 0n);
  const totalCost = BigInt(quantity) * unitPrice;

  const remainingInPhase = phase.maxSupply > 0n
    ? ((phaseMinted ?? 0n) >= BigInt(phase.maxSupply)
        ? 0n
        : BigInt(phase.maxSupply) - (phaseMinted ?? 0n))
    : null;

  const walletRemaining = phase.maxPerWallet > 0n
    ? ((claimed ?? 0n) >= BigInt(phase.maxPerWallet)
        ? 0n
        : BigInt(phase.maxPerWallet) - (claimed ?? 0n))
    : null;

  return (
    <div className="rounded-xl border border-border bg-panel p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-main-text">Mint</h3>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
          status.status === "live"
            ? "bg-green-500/10 text-green-400"
            : status.status === "upcoming"
            ? "bg-yellow-500/10 text-yellow-400"
            : "bg-muted-text/10 text-muted-text"
        }`}>
          {status.label}
        </span>
      </div>

      {phaseIds.length > 1 && (
        <div className="mb-4">
          <label className="mb-2 block text-xs font-medium text-muted-text uppercase tracking-wider">Phase</label>
          <div className="flex flex-wrap gap-2">
            {phaseIds.map((id) => (
              <PhaseButton
                key={id}
                collection={collection}
                phaseId={id}
                isSelected={id === effectivePhaseId}
                onSelect={() => { setSelectedPhaseId(id); setError(null); setSuccess(false); }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-background p-3">
          <span className="block text-xs text-muted-text mb-1">Price per NFT</span>
          <span className="font-mono text-main-text">{formatEther(phase.price)} ETH</span>
          <span className="block text-xs text-muted-text mt-1">+ {formatEther(platformFlatFee ?? 0n)} fee</span>
        </div>
        <div className="rounded-lg bg-background p-3">
          <span className="block text-xs text-muted-text mb-1">Minted</span>
          <span className="font-mono text-main-text">
            {phaseMinted?.toString() ?? "0"} / {phase.maxSupply > 0n ? phase.maxSupply.toString() : "∞"}
          </span>
          {remainingInPhase !== null && (
            <span className="block text-xs text-muted-text mt-1">{remainingInPhase.toString()} remaining</span>
          )}
        </div>
      </div>

      {isAllowlist && (
        <div className="mb-4 rounded-lg bg-accent-blue/5 border border-accent-blue/20 p-3 flex items-center gap-2 text-sm">
          <AlertTriangle size={16} className="text-accent-blue shrink-0" />
          <span className="text-accent-blue">Allowlist phase — proof required</span>
        </div>
      )}

      <div className="mb-4">
        <label className="mb-2 block text-xs font-medium text-muted-text uppercase tracking-wider">Quantity</label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1 || isPending || isFetchingProof}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background hover:border-accent-blue/50 disabled:opacity-50 transition-colors"
          >
            <Minus size={16} />
          </button>
          <span className="w-12 text-center font-mono text-lg font-medium">{quantity}</span>
          <button
            onClick={() => {
              const max = walletRemaining !== null ? Number(walletRemaining) : 10;
              setQuantity(Math.min(max, quantity + 1));
            }}
            disabled={isPending || isFetchingProof || (walletRemaining !== null && quantity >= Number(walletRemaining))}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background hover:border-accent-blue/50 disabled:opacity-50 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        {walletRemaining !== null && walletRemaining > 0n && (
          <p className="mt-1 text-xs text-muted-text">{walletRemaining.toString()} remaining for your wallet</p>
        )}
      </div>

      <div className="mb-4 rounded-lg bg-background p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-text">Total</span>
          <span className="font-mono text-lg font-semibold text-main-text">{formatEther(totalCost)} ETH</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/5 border border-red-500/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && hash && (
        <div className="mb-4 rounded-lg bg-green-500/5 border border-green-500/20 p-3 text-sm text-green-400 flex items-center gap-2">
          <CheckCircle size={16} />
          <span>Mint successful! Tx: {hash.slice(0, 10)}...</span>
        </div>
      )}

      <button
        onClick={handleMint}
        disabled={status.status !== "live" || isPending || isFetchingProof}
        className="w-full rounded-lg bg-accent-blue py-3.5 font-medium text-white hover:bg-accent-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {isFetchingProof ? (
          <><Loader2 size={18} className="animate-spin" /> Fetching proof...</>
        ) : isPending ? (
          <><Loader2 size={18} className="animate-spin" /> Confirm in wallet...</>
        ) : status.status !== "live" ? (
          status.label
        ) : (
          "Mint"
        )}
      </button>
    </div>
  );
}

function PhaseButton({ collection, phaseId, isSelected, onSelect }: {
  collection: Address; phaseId: number; isSelected: boolean; onSelect: () => void;
}) {
  const { phase } = usePhase(collection, phaseId);
  const status = phase ? isPhaseActive(phase.startTime, phase.endTime, phase.active) : null;

  return (
    <button
      onClick={onSelect}
      className={`rounded-lg border px-3 py-2 text-sm transition-all ${
        isSelected
          ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
          : "border-border bg-background text-muted-text hover:border-accent-blue/30"
      }`}
    >
      <span className="font-medium">{phase?.name ?? `Phase ${phaseId}`}</span>
      {status && (
        <span className={`ml-2 text-xs ${
          status.status === "live" ? "text-green-400" :
          status.status === "upcoming" ? "text-yellow-400" : "text-muted-text"
        }`}>
          {status.status === "live" ? "●" : status.status === "upcoming" ? "○" : "✓"}
        </span>
      )}
    </button>
  );
}
