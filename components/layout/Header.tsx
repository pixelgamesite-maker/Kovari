"use client";

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useIsAdmin, useMyCollections } from '@/hooks/useCollection';
import { useAccount } from 'wagmi';

export function Header() {
  const { isConnected } = useAccount();
  const { isAdmin } = useIsAdmin();
  const { myCollections } = useMyCollections();

  const showLaunch = isAdmin || myCollections.length > 0;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
          <span className="h-5 w-5 rounded-[6px] bg-accent-blue" />
          Mintrs
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-text md:flex">
          <Link href="/" className="hover:text-main-text transition-colors">Discover</Link>
          {showLaunch && (
            <Link href="/launch" className="hover:text-main-text transition-colors">Launch</Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {showLaunch && (
            <Link
              href="/launch"
              className="hidden rounded-xl border border-accent-blue/40 px-3 py-1.5 text-sm font-medium text-accent-blue transition-colors hover:bg-accent-blue/10 sm:block"
            >
              Launch
            </Link>
          )}
          <ConnectButton showBalance={false} label="Sign In" />
        </div>
      </div>
    </header>
  );
}
