"use client";

import Link from "next/link";
import { useDiscoverCollections } from "@/hooks/useCollection";
import { CollectionCard } from "@/components/collection/CollectionCard";
import { Button } from "@/components/ui/button";
import { type Address } from "viem";
import { Rocket, TrendingUp, Clock, CheckCircle } from "lucide-react";

export default function HomePage() {
  const { addresses, isLoading } = useDiscoverCollections();

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
              Mintrs is where creators drop NFT collections. Fair phases,
              transparent trading locks, and tools built for the next generation of digital art.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="#discover">
                <Button size="lg" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Explore Drops
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Collections — no loading spinner, cards self-load */}
      <CollectionSections addresses={addresses} />
    </div>
  );
}

function CollectionSections({ addresses }: { addresses: Address[] }) {
  if (addresses.length === 0) {
    return (
      <section className="py-24 text-center" id="discover">
        <p className="text-muted-text">No collections yet. Check back soon.</p>
      </section>
    );
  }

  return (
    <>
      <Section
        id="discover"
        title="Live Now"
        icon={<TrendingUp className="h-5 w-5 text-accent-blue" />}
        pulse
        addresses={addresses}
        filter="live"
      />
      <Section
        title="Coming Soon"
        icon={<Clock className="h-5 w-5 text-yellow-400" />}
        addresses={addresses}
        filter="upcoming"
      />
      <Section
        title="Past Drops"
        icon={<CheckCircle className="h-5 w-5 text-muted-text" />}
        addresses={addresses}
        filter="ended"
      />
    </>
  );
}

function Section({
  id,
  title,
  icon,
  pulse,
  addresses,
  filter,
}: {
  id?: string;
  title: string;
  icon: React.ReactNode;
  pulse?: boolean;
  addresses: Address[];
  filter: "live" | "upcoming" | "ended";
}) {
  return (
    <section id={id} className="py-12 border-b border-border last:border-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-6">
          {icon}
          <h2 className="text-xl font-semibold text-main-text">{title}</h2>
          {pulse && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-blue opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-blue" />
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {addresses.map((address) => (
            <CollectionCard key={`${filter}-${address}`} address={address} filter={filter} />
          ))}
        </div>
      </div>
    </section>
  );
}
