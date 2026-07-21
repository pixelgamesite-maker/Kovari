"use client";

import Image from "next/image";
import { useCollectionMeta } from "@/hooks/useCollectionMeta";
import { useChainId } from "wagmi";
import { Twitter, Globe, MessageCircle, Send, CheckCircle } from "lucide-react";

export function SocialLinks({ address }: { address: string }) {
  const { meta, isLoading } = useCollectionMeta(address);
  const chainId = useChainId();

  const isBase = chainId === 8453;
  const openseaUrl = isBase
    ? `https://opensea.io/assets/base/${address}`
    : `https://opensea.io/assets/ethereum/${address}`;

  const etherscanUrl = isBase
    ? `https://basescan.org/address/${address}`
    : `https://etherscan.io/address/${address}`;

  if (isLoading) return null;

  const socialLinks = [
    meta?.website  && { url: meta.website,  icon: <Globe size={15} />,        label: "Website" },
    meta?.twitter  && { url: meta.twitter,  icon: <Twitter size={15} />,       label: "X" },
    meta?.discord  && { url: meta.discord,  icon: <MessageCircle size={15} />, label: "Discord" },
    meta?.telegram && { url: meta.telegram, icon: <Send size={15} />,          label: "Telegram" },
  ].filter(Boolean) as { url: string; icon: React.ReactNode; label: string }[];

  return (
    <div className="flex flex-col gap-3">
      {/* Verified badge + social icons */}
      {(meta?.verified || socialLinks.length > 0) && (
        <div className="flex items-center gap-2 flex-wrap">
          {meta?.verified && (
            <span className="flex items-center gap-1 rounded-full bg-accent-blue/10 px-2.5 py-1 text-xs font-medium text-accent-blue">
              <CheckCircle size={11} /> Verified
            </span>
          )}
          {socialLinks.map((link) => (
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
      )}

      {/* OpenSea + Etherscan — centred, side by side */}
      <div className="flex items-center justify-center gap-3">
        <a
          href={openseaUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="View on OpenSea"
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-xs text-muted-text hover:text-main-text hover:border-accent-blue/30 transition-colors"
        >
          <Image src="/Opensea.png" alt="OpenSea" width={18} height={18} className="rounded-sm" />
          OpenSea
        </a>
        <a
          href={etherscanUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={isBase ? "View on Basescan" : "View on Etherscan"}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-xs text-muted-text hover:text-main-text hover:border-accent-blue/30 transition-colors"
        >
          <Image src="/etherscan.svg" alt="Etherscan" width={18} height={18} className="rounded-full" />
          {isBase ? "Basescan" : "Etherscan"}
        </a>
      </div>
    </div>
  );
}

export function VerifiedBadge() {
  return (
    <span className="flex items-center gap-1 rounded-full bg-accent-blue/90 px-2 py-0.5 text-[10px] font-semibold text-white">
      <CheckCircle size={10} /> Verified
    </span>
  );
}
