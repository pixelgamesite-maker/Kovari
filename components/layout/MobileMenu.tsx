"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { X, Compass, Rocket, FileText, HelpCircle } from "lucide-react";
import { AccountMenu } from "./AccountMenu";

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.076.076 0 0 0-.04.107c.36.698.772 1.363 1.225 1.993a.076.076 0 0 0 .084.029 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.673-3.549-13.66a.06.06 0 0 0-.031-.028ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.211 0 2.176 1.094 2.157 2.418 0 1.334-.955 2.42-2.157 2.42Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.946 2.42-2.157 2.42Z" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const NAV_ITEMS = [
  { href: "/", label: "Explore", icon: Compass },
  { href: "/launch", label: "Create Collection", icon: Rocket },
  { href: "/docs", label: "Docs", icon: FileText },
  { href: "/faq", label: "FAQ", icon: HelpCircle },
];

const SOCIALS = [
  { href: "https://discord.gg/placeholder", icon: <DiscordIcon />, label: "Discord" },
  { href: "https://x.com/placeholder", icon: <XIcon />, label: "X" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const overlay = (
    <div className="fixed inset-0 z-[99999] flex flex-col bg-[#0B0B0D]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3"
        >
          <div className="relative h-9 w-9 overflow-hidden rounded-xl">
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
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <AccountMenu />
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1E1E22] bg-transparent text-[#7A7A80] transition-colors hover:text-[#F5F5F3]"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Nav items — scatter-style card rows */}
      <nav className="flex flex-col gap-2 px-4 pt-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`group flex items-center gap-4 rounded-2xl border px-4 py-4 transition-all ${
                active
                  ? "border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#D4AF37]"
                  : "border-[#1E1E22] bg-[#141416] text-[#9A9A9E] hover:border-[#2A2A2E] hover:text-[#F5F5F3]"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                  active
                    ? "border-[#D4AF37]/20 bg-[#D4AF37]/10"
                    : "border-[#1E1E22] bg-[#0B0B0D] group-hover:border-[#2A2A2E]"
                }`}
              >
                <Icon size={18} />
              </div>
              <span className="flex-1 font-display text-base font-semibold tracking-tight">
                {label}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-40"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          );
        })}
      </nav>

      {/* Account on mobile */}
      <div className="mt-3 px-4 sm:hidden">
        <div className="rounded-2xl border border-[#1E1E22] bg-[#141416] p-4">
          <AccountMenu />
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Community section */}
      <div className="px-4 pb-8 pt-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#1E1E22]" />
          <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#5A5A5E]">
            Community
          </span>
          <div className="h-px flex-1 bg-[#1E1E22]" />
        </div>
        <div className="flex gap-3">
          {SOCIALS.map(({ href, icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1E1E22] bg-[#141416] text-[#7A7A80] transition-colors hover:border-[#2A2A2E] hover:text-[#F5F5F3]"
            >
              {icon}
            </a>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1E1E22] bg-transparent text-[#7A7A80] transition-colors hover:text-[#F5F5F3] md:hidden"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>

      {open && typeof document !== "undefined" && createPortal(overlay, document.body)}
    </>
  );
}
