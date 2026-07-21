"use client";

import { useState, useCallback, useRef } from "react";
import { type Address } from "viem";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { COLLECTION_ABI } from "@/lib/contracts";
import { uploadRevealMetadata } from "@/lib/platform-api";
import { Upload, FileText, ImagePlus, Loader2, CheckCircle, AlertTriangle, X } from "lucide-react";

export function RevealPanel({ collection }: { collection: Address }) {
  const [images, setImages] = useState<File[]>([]);
  const [csv, setCsv] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [baseURI, setBaseURI] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  // Drag state
  const [imageDragging, setImageDragging] = useState(false);
  const [csvDragging, setCsvDragging] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const { writeContract, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const busy = isUploading || isPending || isConfirming;

  // Image drag handlers
  const onImageDragOver = (e: React.DragEvent) => { e.preventDefault(); setImageDragging(true); };
  const onImageDragLeave = () => setImageDragging(false);
  const onImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setImageDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length > 0) { setImages(files); setBaseURI(null); setError(null); }
  }, []);

  // CSV drag handlers
  const onCsvDragOver = (e: React.DragEvent) => { e.preventDefault(); setCsvDragging(true); };
  const onCsvDragLeave = () => setCsvDragging(false);
  const onCsvDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setCsvDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".csv") || file.type === "text/csv")) {
      setCsv(file); setBaseURI(null); setError(null);
    }
  }, []);

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
      <div className="flex flex-col items-center py-12 text-center">
        <CheckCircle size={48} className="text-green-400 mb-4" />
        <p className="font-semibold text-main-text text-lg">Collection Revealed</p>
        <p className="text-sm text-muted-text mt-1">
          Metadata is live. Marketplaces may take a few minutes to index.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Warning */}
      <div className="flex items-start gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-yellow-400">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        <span>Reveal is permanent and cannot be undone. Make sure all images and metadata are correct before revealing.</span>
      </div>

      {/* Step 1 */}
      <div className="space-y-4">
        <p className="text-xs font-medium text-muted-text uppercase tracking-wider">Step 1 — Upload files</p>

        {/* Images drop zone */}
        <div>
          <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-main-text">
            <ImagePlus size={14} /> Token Images
          </label>
          <div
            onDragOver={onImageDragOver}
            onDragLeave={onImageDragLeave}
            onDrop={onImageDrop}
            onClick={() => imageInputRef.current?.click()}
            className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors ${
              imageDragging
                ? "border-accent-blue bg-accent-blue/5"
                : images.length > 0
                ? "border-green-500/40 bg-green-500/5"
                : "border-border bg-background hover:border-accent-blue/40"
            }`}
          >
            {images.length > 0 ? (
              <>
                <CheckCircle size={32} className="text-green-400" />
                <div className="text-center">
                  <p className="font-medium text-main-text">{images.length} image{images.length === 1 ? "" : "s"} selected</p>
                  <p className="text-xs text-muted-text mt-1">Click or drop to replace</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setImages([]); }}
                  className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-text hover:text-main-text transition-colors"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <>
                <Upload size={32} className="text-muted-text" />
                <div className="text-center">
                  <p className="font-medium text-main-text">Drop images here or click to browse</p>
                  <p className="text-xs text-muted-text mt-1">Select all token images at once</p>
                </div>
              </>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length > 0) { setImages(files); setBaseURI(null); setError(null); }
              }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-text">
            Filenames must match the <code>filename</code> column in your CSV.
          </p>
        </div>

        {/* CSV drop zone */}
        <div>
          <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-main-text">
            <FileText size={14} /> Metadata CSV
          </label>
          <div
            onDragOver={onCsvDragOver}
            onDragLeave={onCsvDragLeave}
            onDrop={onCsvDrop}
            onClick={() => csvInputRef.current?.click()}
            className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors ${
              csvDragging
                ? "border-accent-blue bg-accent-blue/5"
                : csv
                ? "border-green-500/40 bg-green-500/5"
                : "border-border bg-background hover:border-accent-blue/40"
            }`}
          >
            {csv ? (
              <>
                <CheckCircle size={32} className="text-green-400" />
                <div className="text-center">
                  <p className="font-medium text-main-text">{csv.name}</p>
                  <p className="text-xs text-muted-text mt-1">Click or drop to replace</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setCsv(null); }}
                  className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-text hover:text-main-text transition-colors"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <>
                <FileText size={32} className="text-muted-text" />
                <div className="text-center">
                  <p className="font-medium text-main-text">Drop CSV here or click to browse</p>
                  <p className="text-xs text-muted-text mt-1">metadata.csv</p>
                </div>
              </>
            )}
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                if (file) { setCsv(file); setBaseURI(null); setError(null); }
              }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-text">
            Required columns: <code>tokenId, filename, name, description</code>. Trait columns: <code>trait:TraitName</code>.
          </p>
        </div>

        <button
          onClick={handleUpload}
          disabled={busy || images.length === 0 || !csv}
          className="w-full rounded-xl border border-accent-blue/30 py-3 text-sm font-medium text-accent-blue hover:bg-accent-blue/10 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {isUploading
            ? <><Loader2 size={16} className="animate-spin" /> Uploading to IPFS...</>
            : <><Upload size={16} /> Upload & Pin to IPFS</>
          }
        </button>
      </div>

      {/* Step 2 — Reveal */}
      {baseURI && (
        <div className="space-y-4">
          <p className="text-xs font-medium text-muted-text uppercase tracking-wider">Step 2 — Reveal on-chain</p>

          <div className="rounded-xl border border-border bg-background p-4">
            <p className="text-xs text-muted-text mb-1.5">Base URI</p>
            <p className="font-mono text-xs text-main-text break-all">{baseURI}</p>
          </div>

          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              disabled={busy}
              className="w-full rounded-xl bg-accent-blue py-3 font-medium text-white hover:bg-accent-blue/90 disabled:opacity-50 transition-colors"
            >
              Reveal Collection
            </button>
          ) : (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm">
              <p className="text-red-400 mb-3">This will permanently reveal the collection. Cannot be undone. Continue?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleReveal}
                  disabled={busy}
                  className="rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isPending || isConfirming
                    ? <><Loader2 size={12} className="animate-spin" /> {isPending ? "Confirm in wallet..." : "Revealing..."}</>
                    : "Yes, Reveal Now"}
                </button>
                <button onClick={() => setConfirming(false)} disabled={busy} className="rounded-lg border border-border px-4 py-2 text-xs text-muted-text">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400">{error}</div>
      )}
    </div>
  );
}
