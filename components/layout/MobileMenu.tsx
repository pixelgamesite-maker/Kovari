"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { X, Menu } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { createPortal } from "react-dom";

// ... icons and menuLinks stay the same ...

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuContent = (
    <motion.div
      initial={{ opacity: 0, x: "100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-[9999] bg-[#0B0B0D]/98 backdrop-blur-xl flex flex-col p-8"
    >
      {/* ... rest of the content ... */}
      <nav className="flex flex-col gap-1 overflow-y-auto">
        {menuLinks.map((link, i) => {
          const active = pathname === link.path;
          return (
            <motion.div
              key={link.path}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={link.path}
                onClick={() => setTimeout(() => setOpen(false), 150)}
                className={`group flex items-center justify-between text-3xl font-semibold py-3 transition-colors border-b border-white/5 ${
                  active ? "text-[#D4AF37]" : "text-[#F5F5F3] hover:text-[#D4AF37]"
                }`}
              >
                <span>{link.name}</span>
                <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity text-[#D4AF37]">→</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>
      {/* ... rest ... */}
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
