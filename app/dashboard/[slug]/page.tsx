import { notFound } from "next/navigation";
import { getCollectionBySlug } from "@/lib/mock-data";
import { MintProgress } from "@/components/collection/MintProgress";
import { Button } from "@/components/ui/button";
import { formatCount, formatEther, shortenAddress } from "@/lib/utils";
import { TrendingUp, Users, DollarSign, Download, Pause, Play, Settings } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function DashboardPage({ params }: Props) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const totalRevenue = collection.phases.reduce((acc, phase) => {
    const price = phase.price === "0" ? 0n : BigInt(phase.price);
    return acc + price * BigInt(phase.minted);
  }, 0n);

  const stats = [
    { label: "Total Minted", value: formatCount(collection.minted), icon: TrendingUp, color: "text-accent-blue" },
    { label: "Unique Minters", value: formatCount(Math.floor(collection.minted * 0.7)), icon: Users, color: "text-green-400" },
    { label: "Revenue", value: `${formatEther(totalRevenue)} ETH`, icon: DollarSign, color: "text-yellow-400" },
    { label: "Royalties", value: `${collection.royalties / 100}%`, icon: DollarSign, color: "text-purple-400" },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-main-text">{collection.name}</h1>
            <p className="text-sm text-muted-text">Creator Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-1.5" />
              Settings
            </Button>
            <Button variant="outline" size="sm">
              <Pause className="h-4 w-4 mr-1.5" />
              Pause Mint
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-xl border border-border bg-panel p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-xs text-muted-text">{stat.label}</span>
                </div>
                <p className="text-xl font-bold text-main-text">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mint Progress */}
            <div className="rounded-xl border border-border bg-panel p-6">
              <h2 className="text-sm font-semibold text-main-text mb-4">Mint Progress</h2>
              <MintProgress
                minted={collection.minted}
                totalSupply={collection.totalSupply}
                size="lg"
              />
            </div>

            {/* Phase Breakdown */}
            <div className="rounded-xl border border-border bg-panel p-6">
              <h2 className="text-sm font-semibold text-main-text mb-4">Phase Breakdown</h2>
              <div className="space-y-3">
                {collection.phases.map((phase) => {
                  const revenue = phase.price === "0"
                    ? "0"
                    : (BigInt(phase.price) * BigInt(phase.minted)).toString();
                  return (
                    <div
                      key={phase.id}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-main-text">{phase.name}</p>
                        <p className="text-xs text-muted-text">
                          {phase.minted} / {phase.maxMints} minted
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-main-text">
                          {phase.price === "0" ? "Free" : `${formatEther(phase.price)} ETH`}
                        </p>
                        <p className="text-xs text-muted-text">
                          {phase.price === "0" ? "-" : `${formatEther(revenue)} ETH revenue`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-panel p-5">
              <h3 className="text-sm font-semibold text-main-text mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Holders
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Allowlist
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-panel p-5">
              <h3 className="text-sm font-semibold text-main-text mb-3">Contract</h3>
              <code className="text-xs text-muted-text font-mono block mb-2">
                {shortenAddress(collection.contractAddress)}
              </code>
              <p className="text-xs text-muted-text">
                Deployed on {collection.chainId === 1 ? "Ethereum" : "Base"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
