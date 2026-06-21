export type PhaseStatus = 'completed' | 'active' | 'upcoming';
export type CollectionStatus = 'live' | 'upcoming' | 'ended' | 'sold-out';

export type Phase = {
  id: string;
  index: number;
  name: string;
  price: string; // wei, as a string
  minted: number;
  maxMints: number;
  maxPerWallet: number;
  startTime: number; // epoch ms
  endTime: number | null;
  status: PhaseStatus;
  walletGated: boolean;
};

export type Creator = {
  name: string;
  address: string;
  avatar: string;
  verified: boolean;
};

export type Collection = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  banner: string;
  creator: Creator;
  tags: string[];
  status: CollectionStatus;
  totalSupply: number;
  minted: number;
  tradingLock: boolean;
  chainId: 1 | 8453; // 1 = Ethereum mainnet, 8453 = Base mainnet
  contractAddress: string;
  royalties: number; // basis points, e.g. 500 = 5%
  phases: Phase[];
};

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

export const mockCollections: Collection[] = [
  {
    id: 'static-primates',
    slug: 'static-primates',
    name: 'Static Primates',
    description:
      'A generative collection where every face starts as a one-line description and ends as on-chain pixel art.',
    image: 'https://picsum.photos/seed/static-primates/400/400',
    banner: 'https://picsum.photos/seed/static-primates-banner/1600/400',
    creator: {
      name: 'stain.eth',
      address: '0x4f2a9c1b3d5e7f1a2b4c6d8e0f1a3b5c7d9e0f1b',
      avatar: 'https://picsum.photos/seed/stain/100/100',
      verified: true,
    },
    tags: ['generative', 'pixel-art'],
    status: 'live',
    totalSupply: 10000,
    minted: 5821,
    tradingLock: true,
    chainId: 8453,
    contractAddress: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    royalties: 500,
    phases: [
      {
        id: 'sp-1', index: 1, name: 'Founders', price: '0',
        minted: 2000, maxMints: 2000, maxPerWallet: 1,
        startTime: now - 30 * day, endTime: now - 20 * day,
        status: 'completed', walletGated: true,
      },
      {
        id: 'sp-2', index: 2, name: 'Allowlist', price: '20000000000000000',
        minted: 3821, maxMints: 4000, maxPerWallet: 3,
        startTime: now - 10 * day, endTime: now + 5 * day,
        status: 'active', walletGated: true,
      },
      {
        id: 'sp-3', index: 3, name: 'Public', price: '35000000000000000',
        minted: 0, maxMints: 4000, maxPerWallet: 5,
        startTime: now + 5 * day, endTime: null,
        status: 'upcoming', walletGated: false,
      },
    ],
  },
  {
    id: 'goji',
    slug: 'goji',
    name: 'Goji',
    description: '5,555 hand-crafted kaiju, ready to wreak havoc on-chain.',
    image: 'https://picsum.photos/seed/goji/400/400',
    banner: 'https://picsum.photos/seed/goji-banner/1600/400',
    creator: {
      name: 'koji',
      address: '0x88aa41fe2b4c6d8e0f1a3b5c7d9e1f2a4b6c8d0e',
      avatar: 'https://picsum.photos/seed/koji/100/100',
      verified: true,
    },
    tags: ['kaiju', '3d'],
    status: 'live',
    totalSupply: 5555,
    minted: 1349,
    tradingLock: false,
    chainId: 1,
    contractAddress: '0x9f8e7d6c5b4a3928374655647382910abcdef12',
    royalties: 750,
    phases: [
      {
        id: 'goji-1', index: 1, name: 'Chosen', price: '15000000000000000',
        minted: 1500, maxMints: 1500, maxPerWallet: 3,
        startTime: now - 15 * day, endTime: now - 5 * day,
        status: 'completed', walletGated: true,
      },
      {
        id: 'goji-2', index: 2, name: 'Unleashed', price: '15000000000000000',
        minted: 1349, maxMints: 2500, maxPerWallet: 5,
        startTime: now - 5 * day, endTime: null,
        status: 'active', walletGated: false,
      },
    ],
  },
];

export function getCollectionBySlug(slug: string) {
  return mockCollections.find((c) => c.slug === slug);
}

export const getCollection = getCollectionBySlug;
