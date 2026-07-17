"use client";

import { useState, useEffect } from "react";
import { updateCollectionMeta } from "@/lib/collection-meta";
import { useCollectionMeta } from "@/hooks/useCollectionMeta";
import { Loader2, ShieldCheck, Flame } from "lucide-react";

export function AdminTrustEditor({ collection }: { collection: string }) {
  const { meta, isLoading } = useCollectionMeta(collection);

  const [verified, setVerified] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (meta && !initialized) {
      setVerified(meta.verified);
      setFeatured(meta.featured);
      setInitialized(true);
    }
  }, [meta, initialized]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateCollectionMeta({ address: collection, verified, featured }, adminKey);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-background" />;

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm text-main-text cursor-pointer">
          <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} className="accent-accent-blue" />
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-accent-blue" /> Verified
          </span>
        </label>
        <label className="flex items-center gap-2 text-sm text-main-text cursor-pointer">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="accent-accent-blue" />
          <span className="flex items-center gap-1.5">
            <Flame size={14} className="text-orange-400" /> Featured
          </span>
        </label>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-text">Admin Key</label>
        <input
          type="password" value={adminKey} onChange={(e) => setAdminKey(e.target.value)}
          placeholder="Required to change trust flags"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-main-text focus:border-accent-blue/50 focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {saved && <p className="text-sm text-green-400">Saved.</p>}

      <button
        onClick={handleSave}
        disabled={saving || !adminKey}
        className="w-full rounded-lg bg-accent-blue py-3 text-sm font-medium text-white hover:bg-accent-blue/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Save Trust Flags"}
      </button>
    </div>
  );
}
