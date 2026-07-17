"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { X, Menu } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { AccountMenu } from "./AccountMenu";

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.076.076 0 0 0-.04.107c.36.698.772 1.363 1.225 1.993a.076.076 0 0 0 .084.029 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.673-3.549-13.66a.06.06 0 0 0-.031-.028ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.211 0 2.176 1.094 2.157 2.418 0 1.334-.955 2.42-2.157 2.42Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.946 2.42-2.157 2.42Z" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M21.198 2.433a2.242 2.242 0 0 0-2.298-.39L2.4 8.687c-1.54.617-1.528 2.965.019 3.545l3.98 1.489 1.53 5.19c.293.996 1.4 1.42 2.223.826l2.63-1.884 3.79 2.796c.834.612 2.04.192 2.316-.816l3.24-11.837c.276-1.008-.34-2.114-1.29-2.363z" />
  </svg>
);

// Launch is visible to everyone — the /launch page itself handles
// showing "no collections yet" or the creator's collections list.
const NAV_ITEMS = [
  { href: "/", label: "Discover" },
  { href: "/launch", label: "Launch" },
  { href: "/faq", label: "FAQ" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-text hover:text-main-text hover:border-accent-blue/30 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Full-screen backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-background"
            >
              {/* Subtle gold glow top-left */}
              <div className="pointer-events-none absolute -top-32 -left-32 h-72 w-72 rounded-full bg-accent-blue/5 blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full bg-accent-blue/5 blur-3xl" />

              {/* Top bar */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 font-display text-lg font-bold text-main-text"
                >
                  <span className="h-5 w-5 rounded-[6px] bg-accent-blue shadow-[0_0_12px_rgba(212,175,55,0.4)]" />
                  Mintrs
                </Link>
                <div className="flex items-center gap-3">
                  <AccountMenu />
                  <button
                    onClick={() => setOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-text hover:text-main-text transition-colors"
                    aria-label="Close menu"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Nav links — centered vertically */}
              <nav className="flex flex-1 flex-col items-center justify-center gap-2 h-[calc(100vh-140px)]">
                {NAV_ITEMS.map(({ href, label }, i) => {
                  const active = pathname === href;
                  return (
                    <motion.div
                      key={href}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + i * 0.06, duration: 0.25 }}
                    >
                      <Link
                        href={href}
                        onClick={() => setOpen(false)}
                        className={`group relative block px-6 py-3 text-3xl font-bold tracking-tight transition-colors ${
                          active ? "text-accent-blue" : "text-main-text hover:text-accent-blue"
                        }`}
                      >
                        {label}
                        {/* Gold underline on active */}
                        <span className={`absolute bottom-2 left-6 h-0.5 rounded-full bg-accent-blue transition-all duration-300 ${
                          active ? "w-[calc(100%-48px)]" : "w-0 group-hover:w-[calc(100%-48px)]"
                        }`} />
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Bottom: divider + socials */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.2 }}
                className="px-5 pb-10"
              >
                <div className="flex items-center gap-3 justify-center mb-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-text uppercase tracking-widest">Community</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="flex items-center justify-center gap-3 mt-4">
                  {[
                    { href: "https://discord.gg/placeholder", icon: <DiscordIcon />, label: "Discord" },
                    { href: "https://x.com/placeholder", icon: <XIcon />, label: "X" },
                    { href: "https://t.me/placeholder", icon: <TelegramIcon />, label: "Telegram" },
                  ].map(({ href, icon, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-text hover:text-accent-blue hover:border-accent-blue/40 transition-colors"
                    >
                      {icon}
                    </a>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
