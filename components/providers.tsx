"use client";

import { useState, useEffect } from "react";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/lib/wagmi";
import { RealtimeSync } from "@/components/RealtimeSync";

export function Providers({
  children,
  cookie,
}: {
  children: React.ReactNode;
  cookie?: string | null;
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Keep data fresh — stale after 10s so block-triggered invalidation
        // always triggers a real refetch rather than returning cached data.
        staleTime: 10_000,
      },
    },
  }));

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#2D6BFF",
            accentColorForeground: "#F5F6FA",
            borderRadius: "medium",
            fontStack: "system",
          })}
        >
          {/* Watches every new block and invalidates all contract reads.
              This is what keeps mint counts, supply, and phase state
              in sync for all users without manual refreshes. */}
          <RealtimeSync />
          {mounted && children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
