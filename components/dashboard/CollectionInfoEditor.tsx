"use client";

import { useEffect, useState } from "react";
import { type Address } from "viem";
import { useContractMetadata, useUpdateCollectionMetadata } from "@/hooks/useCollection";
import { uploadImage } from "@/lib/platform-api";
import { ImagePlus, Loader2 } from "lucide-react";

export function CollectionInfoEditor({ collection }: { collection: Address }) {
  const { metadata, isLoading } = useContractMetadata(collection);
  const { updateMetadata, isPending, isConfirming, isConfirmed } = useUpdateCollectionMetadata(collection);

  const [description, setDescription] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill from whatever's currently on-chain, once it loads.
  useEffect(() => {
    if (metadata) {
      setDescription(metadata.description ?? "");
      setExternalLink(metadata.externalLink ?? "");
      if (metadata.image) setLogoPreview(metadata.image);
      if (metadata.banner) setBannerPreview(metadata.banner);
    }
  }, [metadata]);

  const busy = isUploading || isPending || isConfirming;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsUploading(true);

      // Only upload images that were actually changed - otherwise reuse
      // the existing on-chain URL, so saving text-only edits doesn't
      // re-upload unchanged images.
      const imageURL = logoFile ? (await uploadImage(logoFile)).placeholderURI : metadata?.image ?? "";
      const bannerURL = bannerFile ? (await uploadImage(bannerFile)).placeholderURI : metadata?.banner ?? "";

      setIsUploading(false);

      // One transaction, regardless of how many of the four fields changed.
      await updateMetadata({
        description,
        image: imageURL,
        banner: bannerURL,
        externalLink,
      });
    } catch (err: any) {
      setIsUploading(false);
      setError(err.message || "Failed to update collection info");
    }
  };

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-lg bg-background" />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-main-text">Logo</label>
        <label className="flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-background text-muted-text hover:border-accent-blue/50 transition-colors">
          {logoPreview ? (
            <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus size={20} />
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setLogoFile(file);
                setLogoPreview(URL.createObjectURL(file));
              }
            }}
          />
        </label>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-main-text">Banner</label>
        <label className="flex aspect-[3/1] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-background text-muted-text hover:border-accent-blue/50 transition-colors">
          {bannerPreview ? (
            <img src={bannerPreview} alt="Banner" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus size={20} />
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setBannerFile(file);
                setBannerPreview(URL.createObjectURL(file));
              }
            }}
          />
        </label>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-main-text">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-main-text focus:border-accent-blue/50 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-main-text">External link</label>
        <input
          type="url"
          value={externalLink}
          onChange={(e) => setExternalLink(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-main-text focus:border-accent-blue/50 focus:outline-none"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-400">{error}</div>
      )}

      {isConfirmed && (
        <p className="text-sm text-green-400">Collection info updated.</p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-accent-blue py-3 font-medium text-white hover:bg-accent-blue/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        {isUploading ? (
          <><Loader2 size={16} className="animate-spin" /> Uploading images...</>
        ) : isPending ? (
          <><Loader2 size={16} className="animate-spin" /> Confirm in wallet...</>
        ) : isConfirming ? (
          <><Loader2 size={16} className="animate-spin" /> Saving...</>
        ) : (
          "Save Collection Info"
        )}
      </button>
    </form>
  );
}
