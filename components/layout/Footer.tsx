import Link from 'next/link';

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.076.076 0 0 0-.04.107c.36.698.772 1.363 1.225 1.993a.076.076 0 0 0 .084.029 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.673-3.549-13.66a.06.06 0 0 0-.031-.028ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.211 0 2.176 1.094 2.157 2.418 0 1.334-.955 2.42-2.157 2.42Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.946 2.42-2.157 2.42Z" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-text sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs">© {new Date().getFullYear()} Mintrs</p>

        <div className="flex items-center gap-5 text-xs">
          <Link href="/faq" className="hover:text-main-text transition-colors">FAQ</Link>
          <Link href="/terms" className="hover:text-main-text transition-colors">Terms of use</Link>
          <Link href="/privacy" className="hover:text-main-text transition-colors">Privacy policy</Link>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://discord.gg/placeholder"
            target="_blank" rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-text hover:text-accent-blue hover:border-accent-blue/40 transition-colors"
          >
            <DiscordIcon />
          </a>
          <a
            href="https://x.com/placeholder"
            target="_blank" rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-text hover:text-accent-blue hover:border-accent-blue/40 transition-colors"
          >
            <XIcon />
          </a>
        </div>
      </div>
    </footer>
  );
}
