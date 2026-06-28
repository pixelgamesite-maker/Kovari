"use client";

import { useState } from "react";
import { useWriteContract, useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FACTORY_ABI, FACTORY_ADDRESS } from "@/lib/contracts";
import { Rocket } from "lucide-react";

export default function LaunchPage() {
  const { address, isConnected } = useAccount();
  const { writeContract, isPending, isSuccess, data: hash } = useWriteContract();

  const [form, setForm] = useState({
    name: "",
    symbol: "",
    maxSupply: "",
    placeholderURI: "",
    royaltyBps: "250", // 2.5%
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    await writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "createCollection",
      args: [
        {
          name: form.name,
          symbol: form.symbol,
          maxSupply: BigInt(form.maxSupply),
          placeholderURI: form.placeholderURI,
          onChainMode: false,
          royaltyBps: BigInt(form.royaltyBps),
        },
      ],
    });
  };

  // Gated: nothing about the form renders until a wallet is connected -
  // same pattern as OpenSea's drop manager and Blever's launch flow.
  if (!isConnected) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-32 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-kovari-blue/10 text-kovari-blue">
          <Rocket size={28} />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-kovari-text">Connect your wallet</h1>
        <p className="mb-8 text-kovari-muted">
          You'll need a connected wallet to deploy a collection through the Kovari Factory.
        </p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-2 text-3xl font-bold text-kovari-text">Launch Collection</h1>
      <p className="mb-8 text-kovari-muted">Deploy a new NFT collection via the Kovari Factory.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-kovari-text">Collection Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-kovari-border bg-kovari-bg px-4 py-3 text-kovari-text focus:border-kovari-blue focus:outline-none"
            placeholder="e.g. Kovari Genesis"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-kovari-text">Symbol</label>
          <input
            type="text"
            required
            value={form.symbol}
            onChange={(e) => setForm({ ...form, symbol: e.target.value })}
            className="w-full rounded-lg border border-kovari-border bg-kovari-bg px-4 py-3 text-kovari-text focus:border-kovari-blue focus:outline-none"
            placeholder="e.g. KOV"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-kovari-text">Max Supply</label>
          <input
            type="number"
            required
            min="1"
            value={form.maxSupply}
            onChange={(e) => setForm({ ...form, maxSupply: e.target.value })}
            className="w-full rounded-lg border border-kovari-border bg-kovari-bg px-4 py-3 text-kovari-text focus:border-kovari-blue focus:outline-none"
            placeholder="e.g. 10000"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-kovari-text">Placeholder Image URI</label>
          <input
            type="url"
            required
            value={form.placeholderURI}
            onChange={(e) => setForm({ ...form, placeholderURI: e.target.value })}
            className="w-full rounded-lg border border-kovari-border bg-kovari-bg px-4 py-3 text-kovari-text focus:border-kovari-blue focus:outline-none"
            placeholder="ipfs://... or https://..."
          />
          <p className="mt-1 text-xs text-kovari-muted">Shown before reveal. Use an IPFS or HTTPS URL.</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-kovari-text">Royalty (%)</label>
          <input
            type="number"
            required
            min="0"
            max="10"
            step="0.1"
            value={Number(form.royaltyBps) / 100}
            onChange={(e) =>
              setForm({ ...form, royaltyBps: String(Math.round(Number(e.target.value) * 100)) })
            }
            className="w-full rounded-lg border border-kovari-border bg-kovari-bg px-4 py-3 text-kovari-text focus:border-kovari-blue focus:outline-none"
          />
          <p className="mt-1 text-xs text-kovari-muted">Max 10%. Locked forever after creation.</p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-kovari-blue py-4 font-medium text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Deploying..." : "Deploy Collection"}
        </button>

        {isSuccess && hash && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4 text-sm text-green-400">
            Transaction submitted! Hash: {hash}
          </div>
        )}
      </form>
    </div>
  );
}
