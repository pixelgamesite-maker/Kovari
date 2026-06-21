import { notFound } from "next/navigation";
import { getCollectionBySlug } from "@/lib/mock-data";
import { PhaseRoadmap } from "@/components/collection/PhaseRoadmap";
import { MintProgress } from "@/components/collection/MintProgress";
import { TradingLockBadge } from "@/components/collection/TradingLockBadge";
import { Button } from "@/components/ui/button";
import { formatCount, formatEther, shortenAddress } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Globe, Twitter, MessageCircle, ExternalLink, Copy, Check } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const currentPhase = collection.phases.find((p) => {
    const now = Date.now();
    return p.startTime <= now && (p.endTime === null || p.endTime > now);
  });

  const isLive = collection.status === "live";

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative h-48 sm:h-64 lg:h-80 overflow-hidden">
        <Image
          src={collection.banner}
          alt={collection.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-16 relative pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column */}
          <div className="lg:w-2/3">
            {/* Header */}
            <div className="flex items-end gap-4 mb-6">
              <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-2xl border-4 border-background overflow-hidden shadow-2xl bg-panel">
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-main-text">
                    {collection.name}
                  </h1>
                  {collection.creator.verified && (
                    <div className="h-5 w-5 rounded-full bg-accent-blue flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-text">
                  by{" "}
                  <span className="text-main-text font-medium">
                    {collection.creator.name}
                  </span>
                </p>
              </div>
            </div>

            {/* Tags & Chain */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <Badge variant="chain">
                {collection.chainId === 1 ? "Ethereum" : "Base"}
              </Badge>
              {collection.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full bg-panel border border-border text-muted-text"
                >
                  {tag}
                </span>
              ))}
              <Badge
                variant={
                  collection.status === "live"
                    ? "live"
                    : collection.status === "upcoming"
                    ? "upcoming"
                    : collection.status === "sold-out"
                    ? "soldout"
                    : "ended"
                }
              >
                {collection.status}
              </Badge>
            </div>

            {/* Description */}
            <p className="text-muted-text leading-relaxed mb-8">
              {collection.description}
            </p>

            {/* Contract Info */}
            <div className="rounded-xl border border-border bg-panel/50 p-4 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-text mb-1">Contract</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm text-main-text font-mono">
                      {shortenAddress(collection.contractAddress)}
                    </code>
                    <button className="text-muted-text hover:text-accent-blue transition-colors">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-text mb-1">Royalties</p>
                  <p className="text-sm text-main-text font-medium">
                    {collection.royalties / 100}%
                  </p>
                </div>
              </div>
            </div>

            {/* Phase Roadmap */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-main-text mb-4">Mint Phases</h2>
              <PhaseRoadmap phases={collection.phases} />
            </div>
          </div>

          {/* Right Column - Mint Card */}
          <div className="lg:w-1/3">
            <div className="sticky top-24 space-y-4">
              {/* Mint Card */}
              <div className="rounded-2xl border border-border bg-panel p-6">
                <MintProgress
                  minted={collection.minted}
                  totalSupply={collection.totalSupply}
                  size="lg"
                />

                {isLive && currentPhase ? (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-border">
                      <span className="text-sm text-muted-text">Current Price</span>
                      <span className="text-lg font-bold text-main-text">
                        {currentPhase.price === "0"
                          ? "Free"
                          : `${formatEther(currentPhase.price)} ETH`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-border">
                      <span className="text-sm text-muted-text">Max Per Wallet</span>
                      <span className="text-sm font-medium text-main-text">
                        {currentPhase.maxPerWallet}
                      </span>
                    </div>
                    <Button className="w-full h-12 text-base" disabled={collection.status === "sold-out"}>
                      {collection.status === "sold-out" ? "Sold Out" : "Mint Now"}
                    </Button>
                  </div>
                ) : collection.status === "upcoming" ? (
                  <div className="mt-6 text-center py-4">
                    <p className="text-muted-text text-sm">Minting starts soon</p>
                  </div>
                ) : (
                  <div className="mt-6 text-center py-4">
                    <p className="text-muted-text text-sm">Minting has ended</p>
                  </div>
                )}
              </div>

              {/* Trading Lock */}
              <TradingLockBadge lock={collection.tradingLock} />

              {/* Creator Card */}
              <div className="rounded-2xl border border-border bg-panel p-5">
                <p className="text-xs text-muted-text uppercase tracking-wider mb-3">
                  Creator
                </p>
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden">
                    <Image
                      src={collection.creator.avatar}
                      alt={collection.creator.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-main-text">
                      {collection.creator.name}
                    </p>
                    <p className="text-xs text-muted-text font-mono">
                      {shortenAddress(collection.creator.address)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
