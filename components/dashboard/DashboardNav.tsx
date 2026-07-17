"use client";

import { useState } from "react";
import { Menu, X, Image as ImageIcon, Layers, Settings, Eye, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export type DashboardSection = "info" | "phases" | "settings" | "metadata" | "admin";

const NAV_ITEMS: { id: DashboardSection; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
  { id: "info", label: "Collection Info", icon: <ImageIcon size={16} /> },
  { id: "phases", label: "Phases", icon: <Layers size={16} /> },
  { id: "settings", label: "Settings", icon: <Settings size={16} /> },
  { id: "metadata", label: "Metadata", icon: <Eye size={16} /> },
  { id: "admin", label: "Admin", icon: <ShieldCheck size={16} />, adminOnly: true },
];

export function DashboardNav({
  active, onChange, isAdmin,
}: { active: DashboardSection; onChange: (s: DashboardSection) => void; isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const items = NAV_ITEMS.filter((i) => !i.adminOnly || isAdmin);

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setOpen(true)}
        className="mb-4 flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-main-text lg:hidden"
      >
        <Menu size={16} /> {items.find((i) => i.id === active)?.label}
      </button>

      {/* Mobile full-screen sections drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-background lg:hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <span className="font-semibold text-main-text">Dashboard Menu</span>
              <button onClick={() => setOpen(false)} className="p-2 text-muted-text"><X size={20} /></button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 p-4">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onChange(item.id); setOpen(false); }}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3.5 text-left text-sm font-medium transition-colors ${
                    active === item.id ? "bg-accent-blue/10 text-accent-blue" : "text-main-text hover:bg-white/5"
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sticky sidebar */}
      <nav className="hidden lg:block lg:sticky lg:top-24 lg:w-56 lg:shrink-0 space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
              active === item.id ? "bg-accent-blue/10 text-accent-blue" : "text-muted-text hover:text-main-text hover:bg-white/5"
            }`}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </nav>
    </>
  );
}
