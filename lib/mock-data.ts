export type PhaseStatus = 'completed' | 'active' | 'upcoming';

export type Phase = {
  index: number;
  name: string;
  cap: number;
  minted: number;
  priceEth: number;
  status: PhaseStatus;
  walletGated: boolean;
};

export type Collection = {
  slug: string;
  name: string;
  creator: string;
  description: string;
  totalSupply: number;
  totalMinted: number;
  tradingLocked: boolean;
  bannerColor: string;
  phases: Phase[];
};

export const mockCollections: Collection[] = [
  {
    slug: 'static-primates',
    name: 'Static Primates',
    creator: '0x4f2a…9c1b',
    description:
      'A generative collection where every face starts as a one-line description and ends as on-chain pixel art.',
    totalSupply: 10000,
    totalMinted: 5821,
    tradingLocked: true,
    bannerColor: '#2D6BFF',
    phases: [
      { index: 1, name: 'Founders', cap: 2000, minted: 2000, priceEth: 0, status: 'completed', walletGated: true },
      { index: 2, name: 'Allowlist', cap: 4000, minted: 3821, priceEth: 0.02, status: 'active', walletGated: true },
      { index: 3, name: 'Public', cap: 4000, minted: 0, priceEth: 0.035, status: 'upcoming', walletGated: false },
    ],
  },
  {
    slug: 'goji',
    name: 'Goji',
    creator: '0x88aa…41fe',
    description: '5,555 hand-crafted kaiju, ready to wreak havoc on-chain.',
    totalSupply: 5555,
    totalMinted: 1349,
    tradingLocked: false,
    bannerColor: '#E5484D',
    phases: [
      { index: 1, name: 'Chosen', cap: 1500, minted: 1500, priceEth: 0.015, status: 'completed', walletGated: true },
      { index: 2, name: 'Unleashed', cap: 2500, minted: 1349, priceEth: 0.015, status: 'active', walletGated: false },
    ],
  },
];

export function getCollection(slug: string) {
  return mockCollections.find((c) => c.slug === slug);
}
