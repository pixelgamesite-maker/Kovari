import { mockCollections } from "@/lib/mock-data";
import { CollectionCard } from "@/components/collection/CollectionCard";
import { Button } from "@/components/ui/button";
import { Rocket, TrendingUp, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const live = mockCollections.filter((c) => c.status === "live");
  const upcoming = mockCollections.filter((c) => c.status === "upcoming");
  const ended = mockCollections.filter((c) => c.status === "ended" || c.status === "sold-out");

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

      {/* Live Now */}
      {live.length > 0 && (
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
              {live.map((c) => (
                <CollectionCard key={c.id} collection={c} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section className="py-12 border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="h-5 w-5 text-yellow-400" />
              <h2 className="text-xl font-semibold text-main-text">Coming Soon</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcoming.map((c) => (
                <CollectionCard key={c.id} collection={c} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Past Drops */}
      {ended.length > 0 && (
        <section id="discover" className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle className="h-5 w-5 text-muted-text" />
              <h2 className="text-xl font-semibold text-main-text">Past Drops</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {ended.map((c) => (
                <CollectionCard key={c.id} collection={c} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
