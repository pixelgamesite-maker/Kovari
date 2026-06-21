import { http } from 'wagmi';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, base } from 'wagmi/chains';

// Put the actual key/URLs in .env.local, never hardcode them here.
export const wagmiConfig = getDefaultConfig({
  appName: 'Launchpad',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '',
  chains: [mainnet, base],
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL_ETH),
    [base.id]: http(process.env.NEXT_PUBLIC_RPC_URL_BASE),
  },
  ssr: true,
});

export const chainMeta = {
  [mainnet.id]: { label: 'Ethereum', color: '#627EEA' },
  [base.id]: { label: 'Base', color: '#0052FF' },
} as const;
