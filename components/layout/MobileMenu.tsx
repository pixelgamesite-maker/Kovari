"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Compass, PenSquare, BookOpen, User } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useIsAdmin } from "@/hooks/useCollection";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { isAdmin } = useIsAdmin();

  const items = [
    { href: "/", label: "Explore", icon: Compass },
    ...(isAdmin ? [{ href: "/launch", label: "Create Collection", icon: PenSquare }] : []),
    { href: "/profile", label: "Profile", icon: User },
    { href: "/docs", label: "Docs", icon: BookOpen },
  ];

  return (
    <>
      <button onClick={() => setOpen(true)} className="p-2 -ml-2 text-main-text">
        <Menu size={22} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 h-full w-72 bg-panel border-r border-border p-4"
            >
              <button onClick={() => setOpen(false)} className="mb-6 p-2 text-muted-text">
                <X size={20} />
              </button>
              <nav className="space-y-1">
                {items.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href} href={href} onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-main-text hover:bg-white/5 transition-colors"
                  >
                    <Icon size={18} className="text-accent-blue" />
                    {label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
