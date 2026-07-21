"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateCollection, useMyCollections, useCollectionInfo, useUpdateCollectionMetadata } from "@/hooks/useCollection";
import { uploadImage } from "@/lib/platform-api";
import { shortenAddress } from "@/lib/utils";
import { type Address } from "viem";
import { Rocket, Plus, Loader2, ArrowRight, Check, ImagePlus } from "lucide-react";

const STEPS = ["Details", "Supply & Royalty", "Artwork", "Review"];

export default function LaunchPage() {
  const { isConnected } = useAccount();
  const { myCollections, isLoading: loadingMyCollections } = useMyCollections();
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (!loadingMyCollections && myCollections.length === 0) setShowCreateForm(true);
  }, [loadingMyCollections, myCollections.length]);

  if (!isConnected) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-32 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-blue/10 text-accent-blue">
          <Rocket size={28} />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-main-text">Sign in to continue</h1>
        <p className="mb-8 text-muted-text">Connect your wallet to launch or view your collections.</p>
        <ConnectButton label="Sign In" />
      </div>
    );
  }

  if (loadingMyCollections) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-32 text-center text-muted-text">
        <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />
        Loading your collections...
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
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-1.5 rounded-lg bg-accent-blue px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-blue/90 transition-colors"
          >
            <Plus size={16} /> Launch New
          </button>
        </div>
        <div className="space-y-3">
          {myCollections.map((address) => (
            <CollectionListItem key={address} address={address} />
          ))}
        </div>
      </div>
    );
  }

  return <CreateCollectionWizard showBackButton={myCollections.length > 0} onBack={() => setShowCreateForm(false)} />;
}

function CollectionListItem({ address }: { address: Address }) {
  const { name, symbol } = useCollectionInfo(address);
  return (
    <a href={`/dashboard/${address}`} className="flex items-center justify-between rounded-xl border border-border bg-panel p-4 hover:border-accent-blue/40 transition-colors">
      <div>
        <p className="font-medium text-main-text">{name ?? shortenAddress(address)}</p>
        {symbol && <p className="text-xs text-muted-text font-mono">${symbol} · {shortenAddress(address)}</p>}
      </div>
      <ArrowRight size={16} className="text-muted-text" />
    </a>
  );
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="mb-10 flex items-center gap-2">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2 flex-1">
          <motion.div
            animate={{
              scale: i === current ? 1.1 : 1,
              boxShadow: i === current ? "0 0 16px rgba(212,175,55,0.5)" : "0 0 0 rgba(0,0,0,0)",
            }}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
              i < current ? "border-accent-blue bg-accent-blue text-background"
              : i === current ? "border-accent-blue text-accent-blue"
              : "border-border text-muted-text"
            }`}
          >
            {i < current ? <Check size={14} /> : i + 1}
          </motion.div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 flex-1 rounded transition-colors ${i < current ? "bg-accent-blue" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function CreateCollectionWizard({ showBackButton, onBack }: { showBackButton: boolean; onBack: () => void }) {
  const router = useRouter();
  const { createCollection, isPending, isConfirming, isConfirmed, newCollectionAddress } = useCreateCollection();

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [form, setForm] = useState({ name: "", symbol: "", maxSupply: "", royaltyBps: "250" });
  const chainId = useChainId();
  const chainLabel = chainId === 8453 ? "Base" : chainId === 4663 ? "Robinhood Chain" : "Ethereum Mainnet";
  const chainIcon = chainId === 8453 ? "🔵" : chainId === 4663 ? "🤖" : "⟠";

  // Artwork state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Post-deploy metadata
  const [isUploading, setIsUploading] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState<Address | null>(null);
  const [metadataStatus, setMetadataStatus] = useState<"idle" | "setting" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const busy = isUploading || isPending || isConfirming;

  // Once collection deploys, auto-set metadata if images were uploaded
  useEffect(() => {
    if (isConfirmed && newCollectionAddress) {
      setDeployedAddress(newCollectionAddress);
      if (logoFile || bannerFile) {
        setMetadataStatus("setting");
      } else {
        router.push(`/dashboard/${newCollectionAddress}`);
      }
    }
  }, [isConfirmed, newCollectionAddress]);

  // Set metadata after deploy
  const { updateMetadata, isConfirmed: metaConfirmed } = useUpdateCollectionMetadata(deployedAddress ?? "0x0" as Address);

  useEffect(() => {
    if (metadataStatus !== "setting" || !deployedAddress) return;

    const run = async () => {
      try {
        const [logoURL, bannerURL] = await Promise.all([
          logoFile ? uploadImage(logoFile).then(r => r.placeholderURI) : Promise.resolve(""),
          bannerFile ? uploadImage(bannerFile).then(r => r.placeholderURI) : Promise.resolve(""),
        ]);
        await updateMetadata({ description: "", image: logoURL, banner: bannerURL, externalLink: "" });
      } catch {
        // Metadata failed — still redirect, can set from dashboard
        router.push(`/dashboard/${deployedAddress}`);
      }
    };

    run();
  }, [metadataStatus, deployedAddress]);

  useEffect(() => {
    if (metaConfirmed && deployedAddress) {
      setMetadataStatus("done");
      router.push(`/dashboard/${deployedAddress}`);
    }
  }, [metaConfirmed, deployedAddress]);

  const next = () => { setDir(1); setStep((s) => Math.min(s + 1, STEPS.length - 1)); };
  const back = () => { setDir(-1); setStep((s) => Math.max(s - 1, 0)); };

  const handleDeploy = async () => {
    setError(null);
    setIsUploading(true);
    try {
      setIsUploading(false);
      await createCollection({
        name: form.name,
        symbol: form.symbol,
        maxSupply: BigInt(form.maxSupply),
        placeholderURI: "",
        royaltyBps: BigInt(form.royaltyBps),
      });
    } catch (err: any) {
      setIsUploading(false);
      setError(err.message || "Something went wrong");
    }
  };

  // Show metadata setting screen
  if (metadataStatus === "setting") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-32 text-center">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-accent-blue" />
        <h2 className="text-xl font-bold text-main-text mb-2">Setting up your collection</h2>
        <p className="text-muted-text text-sm">Uploading artwork and saving metadata — confirm the second transaction in your wallet.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      {showBackButton && step === 0 && (
        <button onClick={onBack} className="mb-4 text-sm text-muted-text hover:text-main-text">
          ← Back to your collections
        </button>
      )}

      <h1 className="mb-2 text-3xl font-bold text-main-text">Launch Collection</h1>
      <p className="mb-8 text-muted-text">Deploy a new NFT collection via the Mintrs Factory.</p>

      <StepIndicator current={step} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: dir > 0 ? 40 : -40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir > 0 ? -40 : 40 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {/* Step 0 — Details */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-main-text">Collection Name</label>
                <input
                  type="text" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-main-text focus:border-accent-blue focus:outline-none"
                  placeholder="e.g. Genesis Collection"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-main-text">Symbol</label>
                <input
                  type="text" value={form.symbol}
                  onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-main-text focus:border-accent-blue focus:outline-none"
                  placeholder="e.g. GEN"
                />
              </div>
              <button
                onClick={next}
                disabled={!form.name || !form.symbol}
                className="w-full rounded-lg bg-accent-blue py-3.5 font-medium text-background disabled:opacity-40 transition-opacity"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 1 — Supply & Royalty */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-main-text">Max Supply</label>
                <input
                  type="number" min="1" value={form.maxSupply}
                  onChange={(e) => setForm({ ...form, maxSupply: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-main-text focus:border-accent-blue focus:outline-none"
                  placeholder="e.g. 10000"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-main-text">Royalty (%)</label>
                <input
                  type="number" min="0" max="10" step="0.1"
                  value={Number(form.royaltyBps) / 100}
                  onChange={(e) => setForm({ ...form, royaltyBps: String(Math.round(Number(e.target.value) * 100)) })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-main-text focus:border-accent-blue focus:outline-none"
                />
                <p className="mt-1 text-xs text-muted-text">Max 10%. Royalties go to the wallet that deploys this collection.</p>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-panel px-4 py-3 text-sm">
                <span className="text-lg">{chainIcon}</span>
                <div>
                  <p className="text-xs text-muted-text">Deploying on</p>
                  <p className="font-medium text-main-text">{chainLabel}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={back} className="flex-1 rounded-lg border border-border py-3.5 text-muted-text">Back</button>
                <button
                  onClick={next}
                  disabled={!form.maxSupply}
                  className="flex-1 rounded-lg bg-accent-blue py-3.5 font-medium text-background disabled:opacity-40 transition-opacity"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Artwork */}
          {step === 2 && (
            <div className="space-y-6">
              <p className="text-sm text-muted-text">
                Upload your collection logo and banner. These appear on the mint page and marketplaces like OpenSea.
                You can update them anytime from the dashboard.
              </p>

              {/* Logo */}
              <div>
                <label className="mb-2 block text-sm font-medium text-main-text">
                  Logo
                </label>
                <label className="flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-background text-muted-text hover:border-accent-blue/50 transition-colors">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <ImagePlus size={22} />
                      <span className="text-xs">Logo</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); }
                    }}
                  />
                </label>
              </div>

              {/* Banner */}
              <div>
                <label className="mb-2 block text-sm font-medium text-main-text">
                  Banner <span className="text-muted-text font-normal">(optional)</span>
                </label>
                <label className="flex aspect-[3/1] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-background text-muted-text hover:border-accent-blue/50 transition-colors">
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="Banner" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <ImagePlus size={22} />
                      <span className="text-xs">Banner image</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) { setBannerFile(f); setBannerPreview(URL.createObjectURL(f)); }
                    }}
                  />
                </label>
              </div>

              <div className="flex gap-3">
                <button onClick={back} className="flex-1 rounded-lg border border-border py-3.5 text-muted-text">Back</button>
                <button
                  onClick={next}
                  className="flex-1 rounded-lg bg-accent-blue py-3.5 font-medium text-background transition-opacity"
                >
                  {logoFile ? "Continue" : "Skip for now"}
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Artwork preview */}
              {(logoPreview || bannerPreview) && (
                <div className="rounded-xl border border-border bg-panel overflow-hidden">
                  {bannerPreview && (
                    <div className="relative h-24 w-full overflow-hidden">
                      <img src={bannerPreview} alt="Banner" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-panel/80 to-transparent" />
                    </div>
                  )}
                  <div className={`flex items-end gap-3 p-4 ${bannerPreview ? "-mt-8" : ""}`}>
                    {logoPreview && (
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-panel bg-background">
                        <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-main-text">{form.name}</p>
                      <p className="text-xs text-muted-text font-mono">${form.symbol}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-border bg-panel p-5 space-y-3 text-sm">
                <Row label="Name"       value={form.name} />
                <Row label="Symbol"     value={`$${form.symbol}`} />
                <Row label="Max Supply" value={Number(form.maxSupply).toLocaleString()} />
                <Row label="Royalty"    value={`${Number(form.royaltyBps) / 100}%`} />
                <Row label="Chain"      value={chainLabel} />
                <Row label="Logo"       value={logoFile ? logoFile.name : "Not set (can add from dashboard)"} />
                <Row label="Banner"     value={bannerFile ? bannerFile.name : "Not set (can add from dashboard)"} />
              </div>

              {(logoFile || bannerFile) && (
                <p className="text-xs text-muted-text">
                  Deploying requires two wallet confirmations — one to create the collection, one to save the artwork.
                </p>
              )}

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400">{error}</div>
              )}

              <div className="flex gap-3">
                <button onClick={back} className="flex-1 rounded-lg border border-border py-3.5 text-muted-text">Back</button>
                <button
                  onClick={handleDeploy}
                  disabled={busy}
                  className="flex-1 rounded-lg bg-accent-blue py-3.5 font-medium text-background disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {busy ? <Loader2 size={16} className="animate-spin" /> : null}
                  {isUploading ? "Uploading artwork..."
                    : isPending ? "Confirm in wallet..."
                    : isConfirming ? "Deploying..."
                    : "Deploy Collection"}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border pb-2 last:border-0 last:pb-0">
      <span className="text-muted-text">{label}</span>
      <span className="font-medium text-main-text text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}
