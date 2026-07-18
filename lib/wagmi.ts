import { connectorsForWallets, getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  rainbowWallet,
  metaMaskWallet,
  coinbaseWallet,
  trustWallet,
  okxWallet,
  binanceWallet,
  bitgetWallet,
  walletConnectWallet,
  safeWallet,
  phantomWallet,
  uniswapWallet,
  zerionWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';
import { mainnet, base } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Popular',
      wallets: [
        metaMaskWallet,
        rainbowWallet,
        coinbaseWallet,
        trustWallet,
        okxWallet,
        zerionWallet,
      ],
    },
    {
      groupName: 'More',
      wallets: [
        binanceWallet,
        bitgetWallet,
        phantomWallet,
        uniswapWallet,
        safeWallet,
        walletConnectWallet,
      ],
    },
  ],
  { appName: 'Mintrs', projectId }
);

const rpc = (chainId: number) => `/api/rpc/${chainId}`;

export const wagmiConfig = createConfig({
  connectors,
  chains: [mainnet, base],
  transports: {
    [mainnet.id]: http(rpc(mainnet.id)),
    [base.id]:    http(rpc(base.id)),
  },
  ssr: true,
});
