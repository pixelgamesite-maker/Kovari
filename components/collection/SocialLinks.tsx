"use client";

import { useCollectionMeta } from "@/hooks/useCollectionMeta";
import { useChainId } from "wagmi";
import { Twitter, Globe, MessageCircle, Send, CheckCircle, Anchor } from "lucide-react";

interface SocialLinksProps {
  address: string;
}

export function SocialLinks({ address }: SocialLinksProps) {
  const { meta, isLoading } = useCollectionMeta(address);
  const chainId = useChainId();

  // OpenSea URL auto-generated from contract address + chain
  const openseaUrl = chainId === 8453
    ? `https://opensea.io/assets/base/${address}`
    : `https://opensea.io/assets/ethereum/${address}`;

  if (isLoading) return null;

  const links = [
    meta?.website && { url: meta.website, icon: <Globe size={15} />, label: "Website" },
    meta?.twitter && { url: meta.twitter, icon: <Twitter size={15} />, label: "X" },
    meta?.discord && { url: meta.discord, icon: <MessageCircle size={15} />, label: "Discord" },
    meta?.telegram && { url: meta.telegram, icon: <Send size={15} />, label: "Telegram" },
    { url: openseaUrl, icon: <Anchor size={15} />, label: "OpenSea" },
  ].filter(Boolean) as { url: string; icon: React.ReactNode; label: string }[];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {meta?.verified && (
        <span className="flex items-center gap-1 rounded-full bg-accent-blue/10 px-2.5 py-1 text-xs font-medium text-accent-blue">
          <CheckCircle size={11} />
          Verified
        </span>
      )}
      {links.map((link) => (
        <a
          key={link.label}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          title={link.label}
          className="flex items-center justify-center h-8 w-8 rounded-lg border border-border text-muted-text hover:text-main-text hover:border-accent-blue/30 transition-colors"
        >
          {link.icon}
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
