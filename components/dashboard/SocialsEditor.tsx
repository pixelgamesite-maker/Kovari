"use client";

import { useState, useEffect } from "react";
import { type CollectionMeta, updateCollectionMeta } from "@/lib/collection-meta";
import { useCollectionMeta } from "@/hooks/useCollectionMeta";
import { Loader2, Twitter, Globe, MessageCircle, Send } from "lucide-react";

interface Props {
  collection: string;
  adminKey: string;
}

export function SocialsEditor({ collection, adminKey }: Props) {
  const { meta, isLoading } = useCollectionMeta(collection);

  const [twitter, setTwitter] = useState("");
  const [discord, setDiscord] = useState("");
  const [website, setWebsite] = useState("");
  const [telegram, setTelegram] = useState("");
  const [verified, setVerified] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (meta && !initialized) {
      setTwitter(meta.twitter ?? "");
      setDiscord(meta.discord ?? "");
      setWebsite(meta.website ?? "");
      setTelegram(meta.telegram ?? "");
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
      await updateCollectionMeta(
        { address: collection, twitter, discord, website, telegram, verified, featured },
        adminKey
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div className="h-48 animate-pulse rounded-lg bg-background" />;

  return (
    <div className="space-y-4">
      {/* Verified / Featured toggles — admin only */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm text-main-text cursor-pointer">
          <input
            type="checkbox"
            checked={verified}
            onChange={(e) => setVerified(e.target.checked)}
            className="accent-accent-blue"
          />
          <span className="flex items-center gap-1.5">
            Verified
            <span className="rounded-full bg-accent-blue/10 px-2 py-0.5 text-xs text-accent-blue font-medium">✓</span>
          </span>
        </label>
        <label className="flex items-center gap-2 text-sm text-main-text cursor-pointer">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="accent-accent-blue"
          />
          Featured
        </label>
      </div>

      {/* Social links */}
      <div className="space-y-3">
        <SocialInput
          icon={<Twitter size={15} />}
          label="X / Twitter"
          placeholder="https://x.com/yourproject"
          value={twitter}
          onChange={setTwitter}
        />
        <SocialInput
          icon={<MessageCircle size={15} />}
          label="Discord"
          placeholder="https://discord.gg/yourserver"
          value={discord}
          onChange={setDiscord}
        />
        <SocialInput
          icon={<Globe size={15} />}
          label="Website"
          placeholder="https://yourproject.xyz"
          value={website}
          onChange={setWebsite}
        />
        <SocialInput
          icon={<Send size={15} />}
          label="Telegram"
          placeholder="https://t.me/yourgroup"
          value={telegram}
          onChange={setTelegram}
        />
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      {saved && (
        <p className="text-sm text-green-400">Saved successfully.</p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-lg bg-accent-blue py-3 font-medium text-white hover:bg-accent-blue/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Save"}
      </button>
    </div>
  );
}

function SocialInput({
  icon, label, placeholder, value, onChange,
}: {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-text">
        {icon} {label}
      </label>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-main-text focus:border-accent-blue/50 focus:outline-none"
      />
    </div>
  );
}
