"use client";

import { useAccount, useBalance } from "wagmi";
import { useMyCollections } from "@/hooks/useCollection";
import { CollectionCard } from "@/components/collection/CollectionCard";
import { shortenAddress } from "@/lib/utils";
import { User } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { myCollections, isLoading } = useMyCollections();

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-24 text-center">
        <User size={48} className="mx-auto mb-4 text-muted-text" />
        <h1 className="text-2xl font-bold text-main-text mb-2">Connect your wallet</h1>
        <p className="text-muted-text">View your profile and owned NFTs.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="rounded-xl border border-border bg-panel p-8 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-blue/10 text-accent-blue">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-main-text">{shortenAddress(address!)}</h1>
            <p className="text-muted-text font-mono">
              {balance?.formatted} {balance?.symbol}
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-main-text mb-4">My Collections</h2>

      {isLoading && (
        <div className="rounded-xl border border-border bg-panel text-muted-text text-center py-12">
          Loading your collections...
        </div>
      )}

      {!isLoading && myCollections.length === 0 && (
        <div className="rounded-xl border border-border bg-panel text-muted-text text-center py-12">
          No collections yet.{" "}
          <Link href="/launch" className="text-accent-blue hover:underline">
            Launch one?
          </Link>
        </div>
      )}

      {!isLoading && myCollections.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {myCollections.map((collectionAddress) => (
            <CollectionCard key={collectionAddress} address={collectionAddress} />
          ))}
        </div>
      )}
    </div>
  );
}
