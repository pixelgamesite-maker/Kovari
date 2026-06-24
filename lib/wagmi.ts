import { http } from 'wagmi';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, base, sepolia } from 'wagmi/chains';

// Sepolia added because the real Factory + Collection contracts are
// currently deployed there (testnet only - no mainnet, no Base yet).
// Put the actual key/URLs in .env.local, never hardcode them here.
export const wagmiConfig = getDefaultConfig({
  appName: 'Launchpad',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '',
  chains: [mainnet, base, sepolia],
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL_ETH),
    [base.id]: http(process.env.NEXT_PUBLIC_RPC_URL_BASE),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL_SEPOLIA),
  },
  ssr: true,
});
