"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useAccount } from "wagmi";
import { useMint, usePhase, useTotalPhases, useCollectionInfo, useIsAdmin } from "@/hooks/useCollection";
import { getMerkleProof, MerkleProofError } from "@/lib/platform-api";
import { formatEther, isPhaseActive, toGateway } from "@/lib/utils";
import { type Address, zeroHash } from "viem";
import { Minus, Plus, AlertTriangle, Loader2, CheckCircle, ShieldX } from "lucide-react";
import { MintSuccessModal } from "@/components/collection/MintSuccessModal";

type Eligibility = 'idle' | 'checking' | 'eligible' | 'ineligible' | 'error';

interface Props {
  collection: Address;
  platformFlatFee: bigint | undefined;
}

export function MintProgress({ collection, platformFlatFee }: Props) {
  const { address } = useAccount();
  const { isAdmin } = useIsAdmin();
  const { data: totalPhases } = useTotalPhases(collection);
  const { name, placeholderURI } = useCollectionInfo(collection);
  const [quantity, setQuantity] = useState(1);
  const [selectedPhaseId, setSelectedPhaseId] = useState<number | null>(null);
  const [isFetchingProof, setIsFetchingProof] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mintedQuantity, setMintedQuantity] = useState(1);
  const [eligibility, setEligibility] = useState<Eligibility>('idle');
  const [cachedProof, setCachedProof] = useState<`0x${string}`[]>([]);

  const { mint, isPending, hash, isConfirming, isConfirmed } = useMint(collection);

  useMemo(() => {
    if (isConfirmed) {
      setMintedQuantity(quantity);
      setShowSuccess(true);
    }
  }, [isConfirmed]);

  const phaseIds = useMemo(
    () => (totalPhases ? Array.from({ length: Number(totalPhases) }, (_, i) => i) : []),
    [totalPhases]
  );

  const effectivePhaseId = selectedPhaseId ?? (phaseIds.length > 0 ? phaseIds[0] : null);
  const { phase, phaseMinted, claimed } = usePhase(collection, effectivePhaseId ?? -1);

  // Check eligibility whenever wallet or phase changes
  useEffect(() => {
    if (!address || effectivePhaseId === null || !phase) return;

    const isAllowlist = phase.merkleRoot !== zeroHash;

    // Admin wallet is always eligible
    if (!isAllowlist || isAdmin) {
      setEligibility('eligible');
      setCachedProof([]);
      return;
    }

    setEligibility('checking');
    getMerkleProof({ collection, phaseId: effectivePhaseId, address })
      .then((res) => {
        setCachedProof(res.proof);
        setEligibility('eligible');
      })
      .catch((err) => {
        if (err instanceof MerkleProofError && (err.status === 404 || err.status === 400)) {
          setEligibility('ineligible');
        } else {
          setEligibility('error');
        }
        setCachedProof([]);
      });
  }, [address, effectivePhaseId, phase, collection, isAdmin]);

  const handleMint = useCallback(async () => {
    if (!address || effectivePhaseId === null || !phase || platformFlatFee === undefined) return;

    setError(null);
    setIsFetchingProof(true);

    try {
      const status = isPhaseActive(phase.startTime, phase.endTime, phase.active);
      if (status.status !== "live") throw new Error(`Phase is ${status.status}: ${status.label}`);

      if (phase.maxPerWallet > 0n) {
        const alreadyClaimed = claimed ?? 0n;
        if (alreadyClaimed + BigInt(quantity) > BigInt(phase.maxPerWallet)) {
          throw new Error(`Wallet limit reached. You've minted ${alreadyClaimed} in this phase.`);
        }
      }

      if (phase.maxSupply > 0n && phaseMinted && phaseMinted + BigInt(quantity) > BigInt(phase.maxSupply)) {
        throw new Error("Not enough supply remaining in this phase");
      }

      const isAllowlist = phase.merkleRoot !== zeroHash;
      let proof: `0x${string}`[] = [];

      if (isAllowlist && !isAdmin) {
        // Use cached proof from eligibility check
        if (cachedProof.length > 0) {
          proof = cachedProof;
        } else {
          const proofRes = await getMerkleProof({ collection, phaseId: effectivePhaseId, address });
          proof = proofRes.proof;
        }
      }

      const unitPrice = phase.price + platformFlatFee;
      const totalPayment = BigInt(quantity) * unitPrice;

      setIsFetchingProof(false);
      await mint(effectivePhaseId, quantity, proof, totalPayment);
    } catch (err: any) {
      setIsFetchingProof(false);
      setError(err.message || "Mint failed");
    }
  }, [address, effectivePhaseId, phase, platformFlatFee, quantity, claimed, phaseMinted, collection, mint, isAdmin, cachedProof]);

  if (!address) {
    return (
      <div className="rounded-xl border border-border bg-panel p-6 text-center">
        <p className="text-muted-text">Connect your wallet to mint</p>
      </div>
    );
  }

  if (totalPhases === 0n) {
    return (
      <div className="rounded-xl border border-border bg-panel p-6 text-center">
        <p className="text-muted-text">Minting hasn't started yet — check back soon.</p>
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
  const isAllowlist = phase.merkleRoot !== zeroHash;
  const unitPrice = phase.price + (platformFlatFee ?? 0n);
  const totalCost = BigInt(quantity) * unitPrice;

  const remainingInPhase = phase.maxSupply > 0n
    ? (phaseMinted ?? 0n) >= BigInt(phase.maxSupply) ? 0n : BigInt(phase.maxSupply) - (phaseMinted ?? 0n)
    : null;

  const walletRemaining = phase.maxPerWallet > 0n
    ? (claimed ?? 0n) >= BigInt(phase.maxPerWallet) ? 0n : BigInt(phase.maxPerWallet) - (claimed ?? 0n)
    : null;

  const canMint = status.status === 'live' &&
    eligibility === 'eligible' &&
    !isPending && !isConfirming && !isFetchingProof;

  return (
    <>
      <MintSuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        collectionName={name ?? ""}
        imageUrl={toGateway(placeholderURI as string | undefined)}
        quantity={mintedQuantity}
        txHash={hash}
      />

      <div className="rounded-xl border border-border bg-panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-main-text">Mint</h3>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            status.status === "live" ? "bg-green-500/10 text-green-400"
              : status.status === "upcoming" ? "bg-yellow-500/10 text-yellow-400"
              : "bg-muted-text/10 text-muted-text"
          }`}>
            {status.label}
          </span>
        </div>

        {/* Phase selector */}
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
                  onSelect={() => {
                    setSelectedPhaseId(id);
                    setError(null);
                    setEligibility('idle');
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Eligibility status */}
        {isAllowlist && (
          <div className={`mb-4 rounded-lg p-3 flex items-center gap-2 text-sm ${
            eligibility === 'checking' ? 'bg-muted-text/5 border border-border' :
            eligibility === 'eligible' ? 'bg-green-500/5 border border-green-500/20' :
            eligibility === 'ineligible' ? 'bg-red-500/5 border border-red-500/20' :
            eligibility === 'error' ? 'bg-yellow-500/5 border border-yellow-500/20' :
            'bg-accent-blue/5 border border-accent-blue/20'
          }`}>
            {eligibility === 'checking' && <><Loader2 size={16} className="animate-spin text-muted-text" /><span className="text-muted-text">Checking eligibility...</span></>}
            {eligibility === 'eligible' && <><CheckCircle size={16} className="text-green-400" /><span className="text-green-400">Eligible to mint</span></>}
            {eligibility === 'ineligible' && <><ShieldX size={16} className="text-red-400" /><span className="text-red-400">Your wallet is not on the allowlist for this phase</span></>}
            {eligibility === 'error' && <><AlertTriangle size={16} className="text-yellow-400" /><span className="text-yellow-400">Couldn't check eligibility — try refreshing</span></>}
            {eligibility === 'idle' && <><AlertTriangle size={16} className="text-accent-blue" /><span className="text-accent-blue">Allowlist phase</span></>}
          </div>
        )}

        <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-background p-3">
            <span className="block text-xs text-muted-text mb-1">Price per NFT</span>
            <span className="font-mono text-main-text">{formatEther(phase.price)} ETH</span>
            {platformFlatFee && platformFlatFee > 0n && (
              <span className="block text-xs text-muted-text mt-1">+ {formatEther(platformFlatFee)} fee</span>
            )}
          </div>
          <div className="rounded-lg bg-background p-3">
            <span className="block text-xs text-muted-text mb-1">Minted</span>
            <span className="font-mono text-main-text">
              {phaseMinted?.toString() ?? "0"} / {phase.maxSupply > 0n ? phase.maxSupply.toString() : "∞"}
            </span>
            {remainingInPhase !== null && remainingInPhase <= 10n && remainingInPhase > 0n && (
              <span className="block text-xs text-red-400 mt-0.5">{remainingInPhase.toString()} left!</span>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-xs font-medium text-muted-text uppercase tracking-wider">Quantity</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1 || !canMint}
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
              disabled={!canMint || (walletRemaining !== null && quantity >= Number(walletRemaining))}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background hover:border-accent-blue/50 disabled:opacity-50 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          {walletRemaining !== null && walletRemaining > 0n && (
            <p className="mt-1 text-xs text-muted-text">{walletRemaining.toString()} remaining for your wallet</p>
          )}
        </div>

        <div className="mb-4 rounded-lg bg-background p-4 flex items-center justify-between">
          <span className="text-sm text-muted-text">Total</span>
          <span className="font-mono text-lg font-semibold text-main-text">{formatEther(totalCost)} ETH</span>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/5 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>
        )}

        <button
          onClick={handleMint}
          disabled={!canMint}
          className="w-full rounded-lg bg-accent-blue py-3.5 font-medium text-white hover:bg-accent-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isFetchingProof ? <><Loader2 size={18} className="animate-spin" /> Fetching proof...</>
            : isPending ? <><Loader2 size={18} className="animate-spin" /> Confirm in wallet...</>
            : isConfirming ? <><Loader2 size={18} className="animate-spin" /> Waiting for confirmation...</>
            : eligibility === 'ineligible' ? 'Not on allowlist'
            : eligibility === 'checking' ? 'Checking eligibility...'
            : status.status !== 'live' ? status.label
            : 'Mint'}
        </button>
      </div>
    </>
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
        isSelected ? "border-accent-blue bg-accent-blue/10 text-accent-blue" : "border-border bg-background text-muted-text hover:border-accent-blue/30"
      }`}
    >
      <span className="font-medium">{phase?.name ?? `Phase ${phaseId}`}</span>
      {status && (
        <span className={`ml-2 text-xs ${
          status.status === "live" ? "text-green-400" : status.status === "upcoming" ? "text-yellow-400" : "text-muted-text"
        }`}>
          {status.status === "live" ? "●" : status.status === "upcoming" ? "○" : "✓"}
        </span>
      )}
    </button>
  );
}
