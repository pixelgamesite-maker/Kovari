"use client";

import { useState, useRef, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useDisconnect } from 'wagmi';
import Link from 'next/link';
import { shortenAddress } from '@/lib/utils';
import { LogOut } from 'lucide-react';

export function AccountMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { disconnect } = useDisconnect();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <ConnectButton.Custom>
      {({ account, chain, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!connected) {
          return (
            <button
              onClick={openConnectModal}
              className="rounded-xl bg-accent-blue px-4 py-2 text-sm font-medium text-white hover:bg-accent-blue/90 transition-colors"
            >
              Sign In
            </button>
          );
        }

        const avatar = account.ensAvatar ?? `https://effigy.im/a/${account.address}.svg`;

        return (
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen((o) => !o)}
              className="rounded-full border border-border p-0.5 hover:border-accent-blue/50 transition-colors"
            >
              <img src={avatar} className="h-9 w-9 rounded-full" alt="Account" />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-panel shadow-xl overflow-hidden">
                <div className="flex items-center gap-3 border-b border-border p-4">
                  <img src={avatar} className="h-10 w-10 rounded-full" alt="" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-main-text truncate">
                      {account.ensName ?? shortenAddress(account.address)}
                    </div>
                    <div className="text-xs text-muted-text">{account.displayBalance}</div>
                  </div>
                </div>

                <button
                  onClick={openChainModal}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm text-main-text hover:bg-white/5 transition-colors"
                >
                  {chain.hasIcon && chain.iconUrl && (
                    <img src={chain.iconUrl} className="h-4 w-4" alt={chain.name ?? ''} />
                  )}
                  {chain.name}
                </button>

                <Link href="/profile" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm text-main-text hover:bg-white/5 transition-colors">
                  Profile
                </Link>
                <Link href="/launch" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm text-main-text hover:bg-white/5 transition-colors">
                  My Collections
                </Link>

                <div className="border-t border-border">
                  <button
                    onClick={() => { disconnect(); setOpen(false); }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={15} /> Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
