"use client";

import { usePhase } from "@/hooks/useCollection";
import { isPhaseActive, formatEther, formatDate } from "@/lib/utils";
import { type Address } from "viem";
import { Lock, Unlock, Clock, CheckCircle } from "lucide-react";

interface Props {
  collection: Address;
  phaseId: number;
}

export function PhaseRoadmap({ collection, phaseId }: Props) {
  const { phase, phaseMinted, claimed } = usePhase(collection, phaseId);

  if (!phase) {
    return (
      <div className="rounded-xl border border-border bg-panel p-4 animate-pulse">
        <div className="h-4 w-1/3 rounded bg-background mb-2" />
        <div className="h-3 w-2/3 rounded bg-background" />
      </div>
    );
  }

  const { status, label } = isPhaseActive(phase.startTime, phase.endTime, phase.active);
  const isAllowlist = phase.merkleRoot !== "0x0000000000000000000000000000000000000000000000000000000000000000";
  const isPublic = !isAllowlist;

  const statusConfig = {
    live: {
      border: "border-green-500/30",
      bg: "bg-green-500/5",
      icon: <Unlock size={16} className="text-green-400" />,
      badge: "bg-green-500/10 text-green-400"
    },
    upcoming: {
      border: "border-yellow-500/30",
      bg: "bg-yellow-500/5",
      icon: <Clock size={16} className="text-yellow-400" />,
      badge: "bg-yellow-500/10 text-yellow-400"
    },
    ended: {
      border: "border-border",
      bg: "bg-background",
      icon: <CheckCircle size={16} className="text-muted-text" />,
      badge: "bg-muted-text/10 text-muted-text"
    },
  }[status];

  const remaining = phase.maxSupply > 0n
    ? ((phaseMinted ?? 0n) >= BigInt(phase.maxSupply)
        ? 0n
        : BigInt(phase.maxSupply) - (phaseMinted ?? 0n))
    : null;

  return (
    <div className={`rounded-xl border p-4 transition-all ${statusConfig.border} ${statusConfig.bg} ${
      status === "ended" ? "opacity-60" : ""
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {statusConfig.icon}
          <span className="font-semibold text-main-text">{phase.name}</span>
          {isAllowlist && (
            <span className="rounded bg-accent-blue/10 px-2 py-0.5 text-xs text-accent-blue font-medium">
              Allowlist
            </span>
          )}
          {isPublic && (
            <span className="rounded bg-green-500/10 px-2 py-0.5 text-xs text-green-400 font-medium">
              Public
            </span>
          )}
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.badge}`}>
          {label}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div>
          <span className="block text-xs text-muted-text mb-1 uppercase tracking-wider">Price</span>
          <span className="font-mono text-main-text">{formatEther(phase.price)} ETH</span>
        </div>
        <div>
          <span className="block text-xs text-muted-text mb-1 uppercase tracking-wider">Minted</span>
          <span className="font-mono text-main-text">
            {phaseMinted?.toString() ?? "0"} / {phase.maxSupply > 0n ? phase.maxSupply.toString() : "∞"}
          </span>
          {remaining !== null && remaining > 0n && remaining <= 10n && (
            <span className="block text-xs text-red-400 mt-0.5">{remaining.toString()} left!</span>
          )}
        </div>
        <div>
          <span className="block text-xs text-muted-text mb-1 uppercase tracking-wider">Per Wallet</span>
          <span className="font-mono text-main-text">{phase.maxPerWallet > 0n ? phase.maxPerWallet.toString() : "∞"}</span>
        </div>
        <div>
          <span className="block text-xs text-muted-text mb-1 uppercase tracking-wider">Start</span>
          <span className="font-mono text-main-text">{formatDate(Number(phase.startTime))}</span>
        </div>
      </div>

      {claimed && claimed > 0n && (
        <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-text">
          You minted <span className="text-accent-blue font-mono">{claimed.toString()}</span> in this phase
        </div>
      )}
    </div>
  );
}
