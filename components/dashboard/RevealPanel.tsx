"use client";

import { useState, useCallback } from "react";
import { type Address } from "viem";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { COLLECTION_ABI } from "@/lib/contracts";
import { uploadRevealMetadata } from "@/lib/platform-api";
import { Upload, FileText, ImagePlus, Loader2, CheckCircle, AlertTriangle } from "lucide-react";

export function RevealPanel({ collection }: { collection: Address }) {
  const [images, setImages] = useState<File[]>([]);
  const [csv, setCsv] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [baseURI, setBaseURI] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const { writeContract, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const busy = isUploading || isPending || isConfirming;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setImages(files);
    setBaseURI(null);
    setError(null);
  };

  const handleCsvSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setCsv(file);
    setBaseURI(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (images.length === 0 || !csv) {
      setError("Select both images and a CSV file before uploading.");
      return;
    }
    setError(null);
    setIsUploading(true);

    try {
      const { baseURI: uri } = await uploadRevealMetadata(images, csv);
      setBaseURI(uri);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleReveal = async () => {
    if (!baseURI) return;
    setError(null);

    try {
      await writeContract({
        address: collection,
        abi: COLLECTION_ABI,
        functionName: "reveal",
        args: [baseURI],
      });
    } catch (err: any) {
      setError(err.message || "Reveal failed");
    }
  };

  if (isConfirmed) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <CheckCircle size={40} className="text-green-400 mb-3" />
        <p className="font-semibold text-main-text">Collection Revealed</p>
        <p className="text-sm text-muted-text mt-1">
          Metadata is live. Marketplaces may take a few minutes to index.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Warning */}
      <div className="flex items-start gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-xs text-yellow-400">
        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
        <span>
          Reveal is permanent and cannot be undone. Make sure all images and
          metadata are correct before revealing.
        </span>
      </div>

      {/* Step 1 — Upload files */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-text uppercase tracking-wider">
          Step 1 — Upload files
        </p>

        {/* Images */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-main-text">
            <ImagePlus size={14} /> Token Images
          </label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background px-4 py-3 text-sm text-muted-text hover:border-accent-blue/50 transition-colors">
            <Upload size={16} />
            {images.length > 0
              ? `${images.length} image${images.length === 1 ? "" : "s"} selected`
              : "Select all token images"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelect}
            />
          </label>
          <p className="mt-1 text-xs text-muted-text">
            Filenames must match the <code>filename</code> column in your CSV.
          </p>
        </div>

        {/* CSV */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-main-text">
            <FileText size={14} /> Metadata CSV
          </label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background px-4 py-3 text-sm text-muted-text hover:border-accent-blue/50 transition-colors">
            <Upload size={16} />
            {csv ? csv.name : "Select metadata CSV"}
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCsvSelect}
            />
          </label>
          <p className="mt-1 text-xs text-muted-text">
            Required columns: <code>tokenId, filename, name, description</code>.
            Trait columns use the format <code>trait:TraitName</code>.
          </p>
        </div>

        <button
          onClick={handleUpload}
          disabled={busy || images.length === 0 || !csv}
          className="w-full rounded-lg border border-accent-blue/30 py-2.5 text-sm font-medium text-accent-blue hover:bg-accent-blue/10 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <><Loader2 size={16} className="animate-spin" /> Uploading to IPFS...</>
          ) : (
            <><Upload size={16} /> Upload & Pin to IPFS</>
          )}
        </button>
      </div>

      {/* Step 2 — Reveal */}
      {baseURI && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-text uppercase tracking-wider">
            Step 2 — Reveal on-chain
          </p>

          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs text-muted-text mb-1">Base URI</p>
            <p className="font-mono text-xs text-main-text break-all">{baseURI}</p>
          </div>

          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              disabled={busy}
              className="w-full rounded-lg bg-accent-blue py-3 font-medium text-white hover:bg-accent-blue/90 disabled:opacity-50 transition-colors"
            >
              Reveal Collection
            </button>
          ) : (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm">
              <p className="text-red-400 mb-3">
                This will permanently reveal the collection. Cannot be undone. Continue?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleReveal}
                  disabled={busy}
                  className="rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isPending || isConfirming ? (
                    <><Loader2 size={12} className="animate-spin" /> {isPending ? "Confirm in wallet..." : "Revealing..."}</>
                  ) : (
                    "Yes, Reveal Now"
                  )}
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  disabled={busy}
                  className="rounded-lg border border-border px-4 py-2 text-xs text-muted-text"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
