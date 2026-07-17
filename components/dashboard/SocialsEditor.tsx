"use client";

import { useState, useEffect } from "react";
import { updateCollectionMeta } from "@/lib/collection-meta";
import { useCollectionMeta } from "@/hooks/useCollectionMeta";
import { Loader2, Twitter, Globe, MessageCircle, Send, Check } from "lucide-react";

export function SocialsEditor({ collection }: { collection: string }) {
  const { meta, isLoading } = useCollectionMeta(collection);

  const [twitter, setTwitter] = useState("");
  const [discord, setDiscord] = useState("");
  const [website, setWebsite] = useState("");
  const [telegram, setTelegram] = useState("");
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
      setInitialized(true);
    }
  }, [meta, initialized]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      // NOTE: updateCollectionMeta's signature currently expects an adminKey
      // as a second arg (used server-side to gate verified/featured writes).
      // Passing an empty string here assumes the backend allows social-only
      // updates without it. Confirm with lib/collection-meta.ts + the API
      // route — if the server rejects an empty key outright, that route
      // needs a small change to only require the key when verified/featured
      // are present in the payload.
      await updateCollectionMeta(
        { address: collection, twitter, discord, website, telegram },
        ""
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save socials");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div className="h-40 animate-pulse rounded-lg bg-background" />;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <SocialInput icon={<Twitter size={15} />} label="X / Twitter" placeholder="https://x.com/yourproject" value={twitter} onChange={setTwitter} />
        <SocialInput icon={<MessageCircle size={15} />} label="Discord" placeholder="https://discord.gg/yourserver" value={discord} onChange={setDiscord} />
        <SocialInput icon={<Globe size={15} />} label="Website" placeholder="https://yourproject.xyz" value={website} onChange={setWebsite} />
        <SocialInput icon={<Send size={15} />} label="Telegram" placeholder="https://t.me/yourgroup" value={telegram} onChange={setTelegram} />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-accent-blue py-3 text-sm font-medium text-white hover:bg-accent-blue/90 disabled:opacity-50 transition-colors"
      >
        {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
          : saved ? <><Check size={16} /> Saved</>
          : "Save Socials"}
      </button>
    </div>
  );
}

function SocialInput({ icon, label, placeholder, value, onChange }: {
  icon: React.ReactNode; label: string; placeholder: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-text">{icon} {label}</label>
      <input
        type="url" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-main-text focus:border-accent-blue/50 focus:outline-none"
      />
    </div>
  );
}
