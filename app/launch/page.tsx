"use client";

import { useState } from "react";
import { useWriteContract, useAccount } from "wagmi";
import { FACTORY_ABI, FACTORY_ADDRESS } from "@/lib/contracts";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

export default function LaunchPage() {
  const { address } = useAccount();
  const router = useRouter();
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
          // royaltyBps is uint96 on-chain - wagmi/viem expect bigint for
          // every integer ABI type regardless of bit width, same as maxSupply.
          royaltyBps: BigInt(form.royaltyBps),
        },
      ],
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-2 text-3xl font-bold">Launch Collection</h1>
      <p className="mb-8 text-kovari-muted">Deploy a new NFT collection via the Kovari Factory.</p>

      {!address && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 text-sm text-yellow-400">
          <AlertCircle size={18} />
          Connect your wallet to create a collection.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium">Collection Name</label>
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
          <label className="mb-2 block text-sm font-medium">Symbol</label>
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
          <label className="mb-2 block text-sm font-medium">Max Supply</label>
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
          <label className="mb-2 block text-sm font-medium">Placeholder Image URI</label>
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
          <label className="mb-2 block text-sm font-medium">Royalty (%)</label>
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
          disabled={isPending || !address}
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
