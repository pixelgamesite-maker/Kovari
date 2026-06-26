"use client";

import { usePhase } from "@/hooks/useCollection";
import { isPhaseActive, formatEther } from "@/lib/utils";
import { type Address, zeroHash } from "viem";
import { Lock, Unlock, Clock, CheckCircle } from "lucide-react";

interface Props {
  collection: Address;
  phaseId: number;
}

export function PhaseRoadmapItem({ collection, phaseId }: Props) {
  const { phase, phaseMinted } = usePhase(collection, phaseId);

  if (!phase) return <div className="h-24 animate-pulse bg-kovari-panel rounded-lg" />;

  const { status, label } = isPhaseActive(phase.startTime, phase.endTime, phase.active);
  // Use viem's zeroHash instead of a hand-typed 64-character string -
  // a single miscounted zero there would silently mark every public
  // phase as gated (or vice versa).
  const isAllowlist = phase.merkleRoot !== zeroHash;

  const statusIcon = {
    live: <Unlock size={16} className="text-green-400" />,
    upcoming: <Clock size={16} className="text-yellow-400" />,
    ended: <CheckCircle size={16} className="text-kovari-muted" />,
  }[status];

  const statusColor = {
    live: "border-green-500/30 bg-green-500/5",
    upcoming: "border-yellow-500/30 bg-yellow-500/5",
    ended: "border-kovari-border opacity-60",
  }[status];

  return (
    <div className={`rounded-xl border p-4 ${statusColor}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {statusIcon}
          <span className="font-semibold">{phase.name}</span>
          {isAllowlist && (
            <span className="rounded bg-kovari-blue/10 px-2 py-0.5 text-xs text-kovari-blue">
              Allowlist
            </span>
          )}
        </div>
        <span
          className={`text-xs font-medium ${
            status === "live" ? "text-green-400" : "text-kovari-muted"
          }`}
        >
          {label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm text-kovari-muted">
        <div>
          <span className="block text-xs uppercase tracking-wider mb-1">Price</span>
          <span className="text-kovari-text font-mono">{formatEther(phase.price)} ETH</span>
        </div>
        <div>
          <span className="block text-xs uppercase tracking-wider mb-1">Minted</span>
          <span className="text-kovari-text font-mono">
            {phaseMinted?.toString() ?? "0"} / {phase.maxSupply > 0 ? phase.maxSupply.toString() : "∞"}
          </span>
        </div>
      </div>
    </div>
  );
}
