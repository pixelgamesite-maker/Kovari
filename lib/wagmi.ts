import { http } from 'wagmi';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, base } from 'wagmi/chains';

// Supporting both chains means your factory + collection template contracts
// need to be deployed separately on each one - this config just points the
// frontend at the right RPC per chain, it doesn't make the contracts exist.
//
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
