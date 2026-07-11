"use client";

import { useCollectionMeta } from "@/hooks/useCollectionMeta";
import { Twitter, Globe, MessageCircle, Send, CheckCircle } from "lucide-react";

export function SocialLinks({ address }: { address: string }) {
  const { meta, isLoading } = useCollectionMeta(address);

  if (isLoading || !meta) return null;

  const links = [
    { url: meta.twitter, icon: <Twitter size={16} />, label: "X" },
    { url: meta.discord, icon: <MessageCircle size={16} />, label: "Discord" },
    { url: meta.website, icon: <Globe size={16} />, label: "Website" },
    { url: meta.telegram, icon: <Send size={16} />, label: "Telegram" },
  ].filter((l) => l.url);

  if (links.length === 0 && !meta.verified) return null;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {meta.verified && (
        <span className="flex items-center gap-1 rounded-full bg-accent-blue/10 px-2.5 py-1 text-xs font-medium text-accent-blue">
          <CheckCircle size={12} />
          Verified
        </span>
      )}
      {links.map((link) => (
        <a
          key={link.label}
          href={link.url!}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-text hover:text-main-text hover:border-accent-blue/30 transition-colors"
        >
          {link.icon}
          {link.label}
        </a>
      ))}
    </div>
  );
}

export function VerifiedBadge() {
  return (
    <span className="flex items-center gap-1 rounded-full bg-accent-blue/90 px-2 py-0.5 text-[10px] font-semibold text-white">
      <CheckCircle size={10} />
      Verified
    </span>
  );
}
