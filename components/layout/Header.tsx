"use client";

import Link from "next/link";
import Image from "next/image";
import { MobileMenu } from "./MobileMenu";
import { AccountMenu } from "./AccountMenu";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#1E1E22] bg-[#0B0B0D]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: mobile menu + logo */}
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <MobileMenu />
          </div>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative h-7 w-7 overflow-hidden rounded-lg">
              <Image
                src="/Mintrs-logo.jpg"
                alt="Mintrs"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-[#F5F5F3]">
              Mintrs
            </span>
          </Link>
        </div>

        {/* Center: desktop nav */}
        <nav className="hidden items-center gap-1 text-sm md:flex">
          {[
            { href: "/", label: "Discover" },
            { href: "/launch", label: "Launch" },
            { href: "/faq", label: "FAQ" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg px-4 py-2 text-[#9A9A9E] transition-colors hover:bg-[#141416] hover:text-[#F5F5F3]"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right: account */}
        <AccountMenu />
      </div>
    </header>
  );
}
