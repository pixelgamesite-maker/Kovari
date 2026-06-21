import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';

// TODO: swap in your own RPC + WalletConnect project id once you have them.
// Base is the default chain choice discussed for cheap, fast mints.
export const wagmiConfig = getDefaultConfig({
  appName: 'Launchpad',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '',
  chains: [base, baseSepolia],
  ssr: true,
});
