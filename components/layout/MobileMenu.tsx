"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { X, Menu } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useIsAdmin } from "@/hooks/useCollection";
import { AccountMenu } from "./AccountMenu";
// ... DiscordIcon, XIcon, TelegramIcon stay the same ...

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isAdmin } = useIsAdmin();
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  const items = [
    { href: "/", label: "Home" },
    ...(isAdmin ? [{ href: "/launch", label: "Launch Collection" }] : []),
    { href: "/profile", label: "Profile" },
    { href: "/docs", label: "Docs" },
  ];

  const menuContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] flex flex-col bg-[#0B0B0D]" // solid, not a CSS var that might resolve transparent
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2 font-display text-lg font-bold text-main-text">
          <span className="h-5 w-5 rounded-[6px] bg-accent-blue" />
          Mintrs
        </div>
        <div className="flex items-center gap-3">
          <AccountMenu />
          <button onClick={() => setOpen(false)} className="p-2 text-muted-text">
            <X size={22} />
          </button>
        </div>
      </div>

      <nav className="flex flex-1 flex-col items-center justify-center gap-7">
        {items.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`text-2xl font-semibold transition-colors ${
                active ? "text-accent-blue" : "text-main-text hover:text-accent-blue"
              }`}
            >
              <span className="relative">
                {label}
                {active && (
                  <span className="absolute -bottom-1.5 left-0 h-0.5 w-full rounded-full bg-accent-blue" />
                )}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center justify-center gap-3 pb-10">
        <a href="https://discord.gg/placeholder" target="_blank" rel="noopener noreferrer"
           className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-text hover:text-accent-blue hover:border-accent-blue/40 transition-colors">
          <DiscordIcon />
        </a>
        <a href="https://x.com/placeholder" target="_blank" rel="noopener noreferrer"
           className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-text hover:text-accent-blue hover:border-accent-blue/40 transition-colors">
          <XIcon />
        </a>
        <a href="https://t.me/placeholder" target="_blank" rel="noopener noreferrer"
           className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-text hover:text-accent-blue hover:border-accent-blue/40 transition-colors">
          <TelegramIcon />
        </a>
      </div>
    </motion.div>
  );

  return (
    <>
      <button onClick={() => setOpen(true)} className="p-2 -ml-2 text-main-text">
        <Menu size={22} />
      </button>

      {mounted && (
        <AnimatePresence>
          {open && createPortal(menuContent, document.body)}
        </AnimatePresence>
      )}
    </>
  );
}
