"use client";

import Link from 'next/link';
import { MobileMenu } from './MobileMenu';
import { AccountMenu } from './AccountMenu';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Left: mobile menu + logo */}
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <MobileMenu />
          </div>
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
            <span className="h-5 w-5 rounded-[6px] bg-accent-blue shadow-[0_0_12px_rgba(212,175,55,0.35)]" />
            Mintrs
          </Link>
        </div>

        {/* Center: desktop nav */}
        <nav className="hidden items-center gap-6 text-sm text-muted-text md:flex">
          <Link href="/" className="hover:text-main-text transition-colors">Discover</Link>
          <Link href="/launch" className="hover:text-main-text transition-colors">Launch</Link>
          <Link href="/faq" className="hover:text-main-text transition-colors">FAQ</Link>
        </nav>

        {/* Right: account */}
        <AccountMenu />
      </div>
    </header>
  );
}
