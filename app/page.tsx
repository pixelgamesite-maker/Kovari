"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useDiscoverCollections } from "@/hooks/useCollection";
import { CollectionCard } from "@/components/collection/CollectionCard";
import { Button } from "@/components/ui/button";
import { type Address } from "viem";
import { TrendingUp, Clock, CheckCircle, Search, SlidersHorizontal, ChevronDown } from "lucide-react";

type Category = "live" | "upcoming" | "ended";
type FilterType = "all" | "live" | "upcoming" | "ended" | "featured";
type ChainFilter = "all" | "1" | "8453";

const CHAIN_OPTIONS: { value: ChainFilter; label: string; icon: string }[] = [
  { value: "all", label: "All Chains", icon: "⛓" },
  { value: "1", label: "Ethereum", icon: "⟠" },
  { value: "8453", label: "Base", icon: "🔵" },
];

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "upcoming", label: "Upcoming" },
  { value: "ended", label: "Ended" },
  { value: "featured", label: "Featured" },
];

export default function HomePage() {
  const { addresses } = useDiscoverCollections();
  const [search, setSearch] = useState("");
  const [chainFilter, setChainFilter] = useState<ChainFilter>("all");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [showChainDropdown, setShowChainDropdown] = useState(false);

  const selectedChain = CHAIN_OPTIONS.find((c) => c.value === chainFilter)!;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.06),_transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              <span className="text-gradient-gold">Launch</span> and{" "}
              <span className="text-gradient-gold">discover</span> NFT collections
            </h1>
            <p className="text-lg text-muted-text mb-8 leading-relaxed">
              Mintrs is a curated launchpad for NFT collections. Fair phases,
              transparent trading locks, and tools built for the next generation of digital art.
            </p>
            <Link href="#discover">
              <Button size="lg" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Explore Drops
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <div id="discover" className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">

            {/* Chain dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowChainDropdown((s) => !s)}
                className="flex items-center gap-2 rounded-xl border border-border bg-panel px-3 py-2 text-sm text-main-text hover:border-accent-blue/40 transition-colors whitespace-nowrap"
              >
                <span>{selectedChain.icon}</span>
                <span className="hidden sm:inline">{selectedChain.label}</span>
                <ChevronDown size={14} className="text-muted-text" />
              </button>
              {showChainDropdown && (
                <div className="absolute top-full mt-1 left-0 z-50 min-w-[140px] rounded-xl border border-border bg-panel shadow-xl overflow-hidden">
                  {CHAIN_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setChainFilter(opt.value); setShowChainDropdown(false); }}
                      className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-accent-blue/10 ${
                        chainFilter === opt.value ? "text-accent-blue" : "text-main-text"
                      }`}
                    >
                      <span>{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none" />
              <input
                type="text"
                placeholder="Search collections..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-panel pl-9 pr-4 py-2 text-sm text-main-text placeholder:text-muted-text focus:border-accent-blue/50 focus:outline-none transition-colors"
              />
            </div>

            {/* Filter pills */}
            <div className="hidden sm:flex items-center gap-1.5">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setActiveFilter(opt.value)}
                  className={`rounded-xl px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                    activeFilter === opt.value
                      ? "bg-accent-blue text-background"
                      : "border border-border text-muted-text hover:text-main-text hover:border-accent-blue/40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Mobile filter icon */}
            <button className="sm:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-text hover:text-main-text transition-colors">
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>
      </div>

      <CollectionSections
        addresses={addresses}
        search={search}
        activeFilter={activeFilter}
        chainFilter={chainFilter === "all" ? undefined : Number(chainFilter)}
      />
    </div>
  );
}

function CollectionSections({
  addresses, search, activeFilter, chainFilter,
}: {
  addresses: Address[];
  search: string;
  activeFilter: FilterType;
  chainFilter?: number;
}) {
  const [categorized, setCategorized] = useState<Partial<Record<Address, Category>>>({});

  const handleCategorize = useCallback((address: Address, category: Category) => {
    setCategorized((prev) => (prev[address] === category ? prev : { ...prev, [address]: category }));
  }, []);

  if (addresses.length === 0) {
    return (
      <section className="py-24 text-center">
        <p className="text-muted-text">No collections yet. Check back soon.</p>
      </section>
    );
  }

  const live = addresses.filter((a) => categorized[a] === "live");
  const upcoming = addresses.filter((a) => categorized[a] === "upcoming");
  const ended = addresses.filter((a) => categorized[a] === "ended");
  const noneYet = live.length === 0 && upcoming.length === 0 && ended.length === 0;

  if (activeFilter !== "all") {
    const filtered = activeFilter === "featured"
      ? addresses
      : addresses.filter((a) => categorized[a] === activeFilter);

    return (
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="sr-only" aria-hidden="true">
            {addresses.map((address) => (
              <CollectionCard key={`probe-${address}`} address={address} onCategorize={handleCategorize} />
            ))}
          </div>
          {filtered.length === 0 ? (
            <p className="text-center text-muted-text py-24">No collections found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((address) => (
                <CollectionCard
                  key={address}
                  address={address}
                  filter={activeFilter === "featured" ? undefined : activeFilter as Category}
                  searchQuery={search}
                  chainFilter={chainFilter}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="sr-only" aria-hidden="true">
        {addresses.map((address) => (
          <CollectionCard key={`probe-${address}`} address={address} onCategorize={handleCategorize} />
        ))}
      </div>

      {noneYet && (
        <section className="py-24 text-center text-muted-text">Loading drops...</section>
      )}

      {live.length > 0 && (
        <Section
          id="discover"
          title="Live Now"
          indicator="green"
          addresses={live}
          filter="live"
          search={search}
          chainFilter={chainFilter}
        />
      )}
      {upcoming.length > 0 && (
        <Section
          title="Upcoming"
          indicator="yellow"
          addresses={upcoming}
          filter="upcoming"
          search={search}
          chainFilter={chainFilter}
        />
      )}
      {ended.length > 0 && (
        <Section
          title="Ended"
          indicator="red"
          addresses={ended}
          filter="ended"
          search={search}
          chainFilter={chainFilter}
        />
      )}
    </>
  );
}

function Section({
  id, title, indicator, pulse, addresses, filter, search, chainFilter,
}: {
  id?: string;
  title: string;
  indicator: "green" | "yellow" | "red";
  pulse?: boolean;
  addresses: Address[];
  filter: Category;
  search: string;
  chainFilter?: number;
}) {
  const dotColor = {
    green: "bg-green-400",
    yellow: "bg-yellow-400",
    red: "bg-red-400",
  }[indicator];

  return (
    <section id={id} className="py-12 border-b border-border last:border-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5 mb-6">
          <span className={`relative flex h-2 w-2`}>
            {indicator === "green" && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
          </span>
          <h2 className="text-xl font-semibold text-main-text">{title}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {addresses.map((address) => (
            <CollectionCard
              key={`${filter}-${address}`}
              address={address}
              filter={filter}
              searchQuery={search}
              chainFilter={chainFilter}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
