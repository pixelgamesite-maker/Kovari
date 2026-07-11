import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs">© {new Date().getFullYear()} Kovari</p>
        <div className="flex gap-5">
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms of use
          </Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
