import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-display text-lg font-bold tracking-tight">
          launch<span className="text-accent">pad</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          <Link href="/" className="hover:text-foreground transition-colors">
            Discover
          </Link>
          <Link href="/launch" className="hover:text-foreground transition-colors">
            Launch a collection
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/launch"
            className="hidden rounded-xl border border-accent/40 px-3 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent/10 sm:block"
          >
            Launch
          </Link>
          <ConnectButton showBalance={false} />
        </div>
      </div>
    </header>
  );
}
