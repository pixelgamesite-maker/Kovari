import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-muted-text sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs">© {new Date().getFullYear()} Mintrs</p>
        <div className="flex gap-5 text-xs">
          <Link href="/faq" className="hover:text-main-text transition-colors">FAQ</Link>
          <Link href="/terms" className="hover:text-main-text transition-colors">Terms of use</Link>
          <Link href="/privacy" className="hover:text-main-text transition-colors">Privacy policy</Link>
        </div>
      </div>
    </footer>
  );
}
