# Launchpad — frontend scaffold

Next.js (App Router) + Tailwind scaffold for the six pages we mapped out.
Everything renders against mock data in `lib/mock-data.ts` so you can see
real layouts before any contract/indexer is wired up.

## Structure

```
app/
  page.tsx                     Home / discovery
  collections/[slug]/page.tsx  Collection mint page (the core experience)
  launch/page.tsx              Creator launch wizard
  dashboard/[slug]/page.tsx    Creator management dashboard
  profile/page.tsx             Wallet profile + owned NFTs
  terms/, privacy/             Static legal pages

components/
  layout/        Header, Footer
  collection/    CollectionCard, PhaseRoadmap, MintProgress, TradingLockBadge

lib/
  mock-data.ts   Sample collections/phases — swap for Ponder GraphQL queries
  wagmi.ts       RainbowKit/wagmi config — add your WalletConnect project id
  utils.ts       cn(), formatCount(), shortenAddress()
```

## Design tokens

Dark background, white text, blue as the primary action color, red reserved
for state/urgency (trading-locked badge, sold-out, errors). Defined in
`tailwind.config.ts`:

- background `#0B0C11` · panel `#15161D`
- foreground `#F5F6FA` · muted `#8B8FA3` · border `#262833`
- accent (blue) `#2D6BFF` · alert (red) `#E5484D`

Type system: Space Grotesk (display/headings), Manrope (body), JetBrains Mono
(addresses, counts, phase data) — set up in `app/layout.tsx`.

## What's mocked vs. what's real

- All collection/phase data comes from `lib/mock-data.ts`. Replace with a
  `urql` client pointed at your Ponder GraphQL endpoint.
- The "Connect wallet" button and eligibility checks are placeholders.
  Wrap the app in wagmi's `WagmiProvider` + RainbowKit's `RainbowKitProvider`
  (config already started in `lib/wagmi.ts`) and swap in `<ConnectButton />`.
- Mint/deploy/advance-phase/lock-toggle buttons don't call a contract yet —
  they're wired for layout and interaction state only.
- CSV upload and Merkle proof generation are stubbed — these should hit
  Next.js API routes (`app/api/...`) backed by your allowlist table.

## Getting started

```
npm install
cp .env.example .env.local   # fill in RPC URL, WalletConnect id, etc.
npm run dev
```
