"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { mockCollections } from "@/lib/mock-data";
import { CollectionCard } from "@/components/collection/CollectionCard";
import { shortenAddress } from "@/lib/utils";
import { Wallet, Image, Activity } from "lucide-react";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();

  // Mock minted NFTs
  const mintedCollections = mockCollections.slice(0, 2);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center mx-auto">
            <Wallet className="h-8 w-8 text-accent-blue" />
          </div>
          <h1 className="text-xl font-semibold text-main-text">Connect Your Wallet</h1>
          <p className="text-sm text-muted-text max-w-sm">
            Connect your wallet to view your NFTs, track mints, and manage your collections.
          </p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="h-16 w-16 rounded-2xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center">
            <span className="text-xl font-bold text-accent-blue">
              {address?.slice(2, 4).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-main-text">
              {shortenAddress(address!)}
            </h1>
            <p className="text-sm text-muted-text">Joined recently</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10 max-w-md">
          <div className="rounded-xl border border-border bg-panel p-4 text-center">
            <p className="text-2xl font-bold text-main-text">3</p>
            <p className="text-xs text-muted-text mt-1">Minted</p>
          </div>
          <div className="rounded-xl border border-border bg-panel p-4 text-center">
            <p className="text-2xl font-bold text-main-text">1</p>
            <p className="text-xs text-muted-text mt-1">Created</p>
          </div>
          <div className="rounded-xl border border-border bg-panel p-4 text-center">
            <p className="text-2xl font-bold text-main-text">0.12</p>
            <p className="text-xs text-muted-text mt-1">ETH Spent</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-6">
            <button className="pb-3 text-sm font-medium text-accent-blue border-b-2 border-accent-blue">
              <Image className="h-4 w-4 inline mr-1.5" />
              Collected
            </button>
            <button className="pb-3 text-sm font-medium text-muted-text hover:text-main-text transition-colors">
              <Activity className="h-4 w-4 inline mr-1.5" />
              Activity
            </button>
          </div>
        </div>

        {/* NFT Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {mintedCollections.map((c) => (
            <CollectionCard key={c.id} collection={c} />
          ))}
        </div>
      </div>
    </div>
  );
}
