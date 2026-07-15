"use client";

import { useMemo, useState } from "react";
import { type Address, isAddress, zeroHash } from "viem";
import { useAddPhase, useSetPhase, useTotalPhases } from "@/hooks/useCollection";
import { useChainId } from "wagmi";
import { buildMerkleRoot } from "@/lib/platform-api";
import { parseEther, formatEther, unixToDatetimeLocal } from "@/lib/utils";
import { Loader2, Users, Infinity as InfinityIcon, AlertTriangle } from "lucide-react";

type ExistingPhase = {
  name: string;
  startTime: bigint;
  endTime: bigint;
  price: bigint;
  maxPerWallet: number;
  maxSupply: number;
  merkleRoot: `0x${string}`;
  active: boolean;
};

interface Props {
  collection: Address;
  onDone?: () => void;
  mode?: "create" | "edit";
  phaseId?: number; // required when mode === "edit"
  existingPhase?: ExistingPhase;
}

export function PhaseBuilder({ collection, onDone, mode = "create", phaseId, existingPhase }: Props) {
  const { addPhase, isPending: isAddPending, isConfirming: isAddConfirming } = useAddPhase(collection);
  const { setPhase, isPending: isSetPending, isConfirming: isSetConfirming } = useSetPhase(collection);

  const { data: totalPhases } = useTotalPhases(collection);
  const chainId = useChainId();
  const chain = chainId === 8453 ? "base" : "mainnet";
  const isEdit = mode === "edit";
  const wasAllowlist = existingPhase ? existingPhase.merkleRoot !== zeroHash : false;

  const [name, setName] = useState(existingPhase?.name ?? "");
  const [startTime, setStartTime] = useState(
    existingPhase ? unixToDatetimeLocal(existingPhase.startTime) : ""
  );
  const [endTime, setEndTime] = useState(existingPhase ? unixToDatetimeLocal(existingPhase.endTime) : "");
  const [priceEth, setPriceEth] = useState(existingPhase ? formatEther(existingPhase.price) : "0");
  const [maxPerWallet, setMaxPerWallet] = useState(String(existingPhase?.maxPerWallet ?? 0));
  const [maxSupply, setMaxSupply] = useState(String(existingPhase?.maxSupply ?? 0));
  const [isPublic, setIsPublic] = useState(existingPhase ? !wasAllowlist : true);
  const [active, setActive] = useState(existingPhase?.active ?? true);
  const [addressText, setAddressText] = useState("");
  const [isBuildingRoot, setIsBuildingRoot] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Whether the allowlist is actually changing this submission - if editing
  // an allowlist phase and the textarea is left empty, keep the existing
  // (unreadable, but still valid) merkle root rather than wiping it out.
  const touchedAddressList = addressText.trim().length > 0;

  const addresses = useMemo(() => {
    return addressText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && isAddress(line));
  }, [addressText]);

  const perWalletNum = Number(maxPerWallet) || 0;
  const maxSupplyNum = Number(maxSupply) || 0;

  const totalWallets = isPublic ? null : touchedAddressList ? addresses.length : null;
  const perWallet = perWalletNum === 0 ? null : perWalletNum;
  const possibleMints = isPublic
    ? null
    : totalWallets !== null && perWallet !== null
      ? maxSupplyNum > 0
        ? Math.min(totalWallets * perWallet, maxSupplyNum)
        : totalWallets * perWallet
      : null;

  const busy = isAddPending || isAddConfirming || isSetPending || isSetConfirming || isBuildingRoot;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      let merkleRoot: `0x${string}` = zeroHash;

      if (!isPublic) {
        if (touchedAddressList) {
          if (addresses.length === 0) {
            setError("None of the pasted lines were valid addresses.");
            return;
          }
          setIsBuildingRoot(true);
          const effectivePhaseId = isEdit && phaseId !== undefined ? phaseId : Number(totalPhases ?? 0);
          const { root } = await buildMerkleRoot(addresses, collection, effectivePhaseId, chain as "mainnet" | "base");
          merkleRoot = root;
          setIsBuildingRoot(false);
        } else if (isEdit && wasAllowlist && existingPhase) {
          // Allowlist phase, no new addresses pasted - keep the existing
          // root rather than accidentally wiping the allowlist.
          merkleRoot = existingPhase.merkleRoot;
        } else {
          setError("Add at least one wallet address, or switch this phase to Public.");
          return;
        }
      }

      const startUnix = startTime ? BigInt(Math.floor(new Date(startTime).getTime() / 1000)) : 0n;
      const endUnix = endTime ? BigInt(Math.floor(new Date(endTime).getTime() / 1000)) : 0n;

      const payload = {
        name,
        startTime: startUnix,
        endTime: endUnix,
        price: parseEther(priceEth || "0"),
        maxPerWallet: perWalletNum,
        maxSupply: maxSupplyNum,
        merkleRoot,
        active,
      };

      if (isEdit && phaseId !== undefined) {
        await setPhase(phaseId, payload);
      } else {
        await addPhase(payload);
      }

      onDone?.();
    } catch (err: any) {
      setIsBuildingRoot(false);
      setError(err.message || "Failed to save phase");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-main-text">Phase name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Community Frens"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-main-text focus:border-accent-blue/50 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-main-text">Start time</label>
          <input
            type="datetime-local"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-main-text focus:border-accent-blue/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-main-text">
            End time <span className="text-muted-text">(optional)</span>
          </label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-main-text focus:border-accent-blue/50 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-main-text">Price (ETH)</label>
          <input
            type="number"
            min="0"
            step="0.0001"
            value={priceEth}
            onChange={(e) => setPriceEth(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-main-text focus:border-accent-blue/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-main-text">Per wallet</label>
          <input
            type="number"
            min="0"
            value={maxPerWallet}
            onChange={(e) => setMaxPerWallet(e.target.value)}
            placeholder="0 = ∞"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-main-text focus:border-accent-blue/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-main-text">Phase cap</label>
          <input
            type="number"
            min="0"
            value={maxSupply}
            onChange={(e) => setMaxSupply(e.target.value)}
            placeholder="0 = ∞"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-main-text focus:border-accent-blue/50 focus:outline-none"
          />
        </div>
      </div>

      {isEdit && (
        <label className="flex items-center gap-2 text-sm text-main-text">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="accent-accent-blue"
          />
          Phase active
        </label>
      )}

      <div className="flex gap-2 rounded-lg border border-border p-1">
        <button
          type="button"
          onClick={() => setIsPublic(true)}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            isPublic ? "bg-accent-blue text-white" : "text-muted-text hover:text-main-text"
          }`}
        >
          Public
        </button>
        <button
          type="button"
          onClick={() => setIsPublic(false)}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            !isPublic ? "bg-accent-blue text-white" : "text-muted-text hover:text-main-text"
          }`}
        >
          Allowlist
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatBox label="Total Wallets" value={totalWallets} />
        <StatBox label="Per Wallet" value={perWallet} />
        <StatBox label="Possible Mints" value={possibleMints} />
      </div>

      {!isPublic && (
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-main-text">
            <Users size={14} />
            Manage addresses
          </div>

          {isEdit && wasAllowlist && (
            <div className="mb-2 flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3 text-xs text-yellow-400">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>
                This phase already has an allowlist, but we can't read back which wallets are on it -
                only the resulting hash lives on-chain. Leave this blank to keep the current list as-is,
                or paste the <strong>complete</strong> list you want (including existing wallets, if
                you're adding to it rather than replacing it).
              </span>
            </div>
          )}

          <p className="mb-2 text-xs text-muted-text">Enter addresses separated by new lines.</p>
          <textarea
            value={addressText}
            onChange={(e) => setAddressText(e.target.value)}
            rows={6}
            placeholder="0x83be849f0f51D23F17e49838f2811E3178226d6a&#10;0x1504734c6e17ee446a65d987c239952e46fb28e5"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-main-text focus:border-accent-blue/50 focus:outline-none"
          />
          <p className="mt-1 text-xs text-muted-text">
            {touchedAddressList
              ? `${addresses.length} valid address${addresses.length === 1 ? "" : "es"} detected`
              : isEdit && wasAllowlist
                ? "Blank - existing allowlist will be kept"
                : "0 addresses"}
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-400">{error}</div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-accent-blue py-3 font-medium text-white hover:bg-accent-blue/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        {isBuildingRoot ? (
          <><Loader2 size={16} className="animate-spin" /> Building allowlist...</>
        ) : isAddPending || isSetPending ? (
          <><Loader2 size={16} className="animate-spin" /> Confirm in wallet...</>
        ) : isAddConfirming || isSetConfirming ? (
          <><Loader2 size={16} className="animate-spin" /> {isEdit ? "Saving..." : "Adding phase..."}</>
        ) : isEdit ? (
          "Save Changes"
        ) : (
          "Add Phase"
        )}
      </button>
    </form>
  );
}

function StatBox({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3 text-center">
      <span className="block text-[10px] uppercase tracking-wider text-muted-text mb-1">{label}</span>
      <span className="flex items-center justify-center gap-1 text-lg font-bold text-main-text">
        {value === null ? <InfinityIcon size={20} /> : value.toLocaleString()}
      </span>
    </div>
  );
}
