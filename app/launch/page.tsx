"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useCreateCollection, useMyCollections, useIsAdmin, useCollectionInfo } from "@/hooks/useCollection";
import { uploadPlaceholderImage } from "@/lib/platform-api";
import { shortenAddress } from "@/lib/utils";
import { type Address } from "viem";
import { Rocket, Plus, ImagePlus, Loader2, ArrowRight, ShieldOff } from "lucide-react";

export default function LaunchPage() {
  const { isConnected } = useAccount();
  const { isAdmin } = useIsAdmin();
  const { myCollections, isLoading: loadingMyCollections } = useMyCollections();
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (!loadingMyCollections && myCollections.length === 0 && isAdmin) {
      setShowCreateForm(true);
    }
  }, [loadingMyCollections, myCollections.length, isAdmin]);

  if (!isConnected) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-32 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-blue/10 text-accent-blue">
          <Rocket size={28} />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-main-text">Sign in to continue</h1>
        <p className="mb-8 text-muted-text">Connect your wallet to view your collections.</p>
        <ConnectButton label="Sign In" />
      </div>
    );
  }

  // Show spinner first while loading — prevents flashing the wrong screen
  if (loadingMyCollections) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-32 text-center text-muted-text">
        <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />
        Loading your collections...
      </div>
    );
  }

  // Non-admin with no collections — only show after loading is confirmed done
  if (!isAdmin && myCollections.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-32 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
          <ShieldOff size={28} />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-main-text">No collections yet</h1>
        <p className="text-muted-text">
          Collections are set up by the Mintrs team. Apply on Discord to get your collection launched.
        </p>
      </div>
    );
  }

  if (!showCreateForm) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-main-text">Your Collections</h1>
            <p className="mt-1 text-muted-text">Collections associated with this wallet.</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-1.5 rounded-lg bg-accent-blue px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-blue/90 transition-colors"
            >
              <Plus size={16} />
              Launch New
            </button>
          )}
        </div>

        <div className="space-y-3">
          {myCollections.map((address) => (
            <CollectionListItem key={address} address={address} />
          ))}
        </div>
      </div>
    );
  }

  return <CreateCollectionForm showBackButton={myCollections.length > 0} onBack={() => setShowCreateForm(false)} />;
}

function CollectionListItem({ address }: { address: Address }) {
  const { name, symbol } = useCollectionInfo(address);

  return (
    <a
      href={`/dashboard/${address}`}
      className="flex items-center justify-between rounded-xl border border-border bg-panel p-4 hover:border-accent-blue/40 transition-colors"
    >
      <div>
        <p className="font-medium text-main-text">{name ?? shortenAddress(address)}</p>
        {symbol && <p className="text-xs text-muted-text font-mono">${symbol} · {shortenAddress(address)}</p>}
      </div>
      <ArrowRight size={16} className="text-muted-text" />
    </a>
  );
}

function CreateCollectionForm({
  showBackButton,
  onBack,
}: {
  showBackButton: boolean;
  onBack: () => void;
}) {
  const router = useRouter();
  const { createCollection, isPending, isConfirming, isConfirmed, newCollectionAddress } =
    useCreateCollection();

  const [form, setForm] = useState({
    name: "",
    symbol: "",
    maxSupply: "",
    royaltyBps: "250",
  });
  const [placeholderFile, setPlaceholderFile] = useState<File | null>(null);
  const [placeholderPreview, setPlaceholderPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConfirmed && newCollectionAddress) {
      router.push(`/dashboard/${newCollectionAddress}`);
    }
  }, [isConfirmed, newCollectionAddress, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeholderFile) {
      setError("Upload a placeholder image first.");
      return;
    }
    setError(null);

    try {
      setIsUploading(true);
      const { placeholderURI } = await uploadPlaceholderImage(placeholderFile);
      setIsUploading(false);

      await createCollection({
        name: form.name,
        symbol: form.symbol,
        maxSupply: BigInt(form.maxSupply),
        placeholderURI,
        royaltyBps: BigInt(form.royaltyBps),
      });
    } catch (err: any) {
      setIsUploading(false);
      setError(err.message || "Something went wrong");
    }
  };

  const busy = isUploading || isPending || isConfirming;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      {showBackButton && (
        <button onClick={onBack} className="mb-4 text-sm text-muted-text hover:text-main-text">
          ← Back to your collections
        </button>
      )}

      <h1 className="mb-2 text-3xl font-bold text-main-text">Launch Collection</h1>
      <p className="mb-8 text-muted-text">Deploy a new NFT collection via the Mintrs Factory.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-main-text">Collection Name</label>
          <input
            type="text" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-main-text focus:border-accent-blue focus:outline-none"
            placeholder="e.g. Genesis Collection"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-main-text">Symbol</label>
          <input
            type="text" required value={form.symbol}
            onChange={(e) => setForm({ ...form, symbol: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-main-text focus:border-accent-blue focus:outline-none"
            placeholder="e.g. GEN"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-main-text">Max Supply</label>
          <input
            type="number" required min="1" value={form.maxSupply}
            onChange={(e) => setForm({ ...form, maxSupply: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-main-text focus:border-accent-blue focus:outline-none"
            placeholder="e.g. 10000"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-main-text">Placeholder Image</label>
          <label className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background text-muted-text hover:border-accent-blue/50 transition-colors overflow-hidden">
            {placeholderPreview ? (
              <img src={placeholderPreview} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <>
                <ImagePlus size={28} className="mb-2" />
                <span className="text-sm">Click to upload an image</span>
              </>
            )}
            <input type="file" accept="image/*" className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) { setPlaceholderFile(file); setPlaceholderPreview(URL.createObjectURL(file)); }
              }}
            />
          </label>
          <p className="mt-1 text-xs text-muted-text">Shown before reveal. Uploaded directly — no IPFS URL needed.</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-main-text">Royalty (%)</label>
          <input
            type="number" required min="0" max="10" step="0.1"
            value={Number(form.royaltyBps) / 100}
            onChange={(e) => setForm({ ...form, royaltyBps: String(Math.round(Number(e.target.value) * 100)) })}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-main-text focus:border-accent-blue focus:outline-none"
          />
          <p className="mt-1 text-xs text-muted-text">Max 10%. Locked forever after creation.</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400">{error}</div>
        )}

        <button type="submit" disabled={busy}
          className="w-full rounded-lg bg-accent-blue py-4 font-medium text-white hover:bg-accent-blue/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {isUploading ? <><Loader2 size={18} className="animate-spin" /> Uploading image...</>
            : isPending ? <><Loader2 size={18} className="animate-spin" /> Confirm in wallet...</>
            : isConfirming ? <><Loader2 size={18} className="animate-spin" /> Deploying...</>
            : "Deploy Collection"}
        </button>
      </form>
    </div>
  );
}
