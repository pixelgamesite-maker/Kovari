"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useReadContract } from "wagmi";
import { FACTORY_ABI, FACTORY_ADDRESS } from "@/lib/contracts";
import { CollectionCard } from "@/components/collection/CollectionCard";
import { Button } from "@/components/ui/button";
import { Rocket, TrendingUp, Clock, CheckCircle, Loader2 } from "lucide-react";
import { type Address } from "viem";

// We'll fetch collection addresses from Factory, then each card reads its own state
export default function HomePage() {
  const { data: totalCollections, isLoading: loadingTotal } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "totalCollections",
  });

  // Generate indices [0, 1, 2, ... total-1]
  const indices = totalCollections
    ? Array.from({ length: Number(totalCollections) }, (_, i) => BigInt(i))
    : [];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,107,255,0.08),_transparent_50%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              <span className="text-gradient-blue">Launch</span> and{" "}
              <span className="text-gradient-blue">discover</span> NFT collections
            </h1>
            <p className="text-lg text-muted-text mb-8 leading-relaxed">
              The premier launchpad for Ethereum and Base. Fair phases, transparent locks,
              and creator tools built for the next generation of digital art.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/launch">
                <Button size="lg" className="gap-2">
                  <Rocket className="h-4 w-4" />
                  Launch Collection
                </Button>
              </Link>
              <Link href="#discover">
                <Button variant="outline" size="lg">
                  Explore Drops
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Loading state */}
      {loadingTotal && (
        <div className="py-24 text-center text-muted-text">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          Loading collections...
        </div>
      )}

      {/* Collection Lists */}
      {!loadingTotal && totalCollections !== undefined && (
        <CollectionLists indices={indices} />
      )}

      {/* Empty state */}
      {!loadingTotal && totalCollections === 0n && (
        <section className="py-24 text-center">
          <p className="text-muted-text mb-4">No collections yet.</p>
          <Link href="/launch">
            <Button>Be the first to launch</Button>
          </Link>
        </section>
      )}
    </div>
  );
}

// Separate component so each collection can self-load its status
function CollectionLists({ indices }: { indices: bigint[] }) {
  const [collections, setCollections] = useState<{ address: Address; status: "live" | "upcoming" | "ended" }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, fetch all addresses then determine status
    // In production, Ponder indexer replaces this entirely
    const fetchAll = async () => {
      // This is a placeholder - you'd use multicall or Ponder here
      // For now we just show addresses and let cards load their own data
      setLoading(false);
    };
    fetchAll();
  }, [indices]);

  // Temporary: render address cards that self-load
  // Replace with Ponder query once your indexer is live
  return (
    <>
      <LiveSection indices={indices} />
      <UpcomingSection indices={indices} />
      <EndedSection indices={indices} />
    </>
  );
}

// Each section uses individual CollectionCard components that read their own state
function LiveSection({ indices }: { indices: bigint[] }) {
  return (
    <section className="py-12 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-accent-blue" />
          <h2 className="text-xl font-semibold text-main-text">Live Now</h2>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-blue opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-blue" />
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {indices.map((idx) => (
            <FactoryCollectionCard key={`live-${idx}`} index={idx} filter="live" />
          ))}
        </div>
      </div>
    </section>
  );
}

function UpcomingSection({ indices }: { indices: bigint[] }) {
  return (
    <section className="py-12 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="h-5 w-5 text-yellow-400" />
          <h2 className="text-xl font-semibold text-main-text">Coming Soon</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {indices.map((idx) => (
            <FactoryCollectionCard key={`upcoming-${idx}`} index={idx} filter="upcoming" />
          ))}
        </div>
      </div>
    </section>
  );
}

function EndedSection({ indices }: { indices: bigint[] }) {
  return (
    <section id="discover" className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-6">
          <CheckCircle className="h-5 w-5 text-muted-text" />
          <h2 className="text-xl font-semibold text-main-text">Past Drops</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {indices.map((idx) => (
            <FactoryCollectionCard key={`ended-${idx}`} index={idx} filter="ended" />
          ))}
        </div>
      </div>
    </section>
  );
}

// Reads factory address at index, then loads collection data
function FactoryCollectionCard({ index, filter }: { index: bigint; filter: "live" | "upcoming" | "ended" }) {
  const { data: address } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "allCollections",
    args: [index],
  });

  if (!address) return <CollectionCardSkeleton />;

  // Pass the real address to CollectionCard which reads its own state
  return <CollectionCard address={address} filter={filter} />;
}

function CollectionCardSkeleton() {
  return (
    <div className="bg-[#15161d] border border-[#262833] rounded-xl h-[400px] animate-pulse" />
  );
}
