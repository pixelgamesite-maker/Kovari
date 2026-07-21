import { connectorsForWallets } from '@rainbow-me/rainbowkit';
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
import { defineChain } from 'viem';

export const robinhoodChain = defineChain({
  id: 4663,
  name: 'Robinhood Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.mainnet.chain.robinhood.com'] },
  },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://robinhoodchain.blockscout.com' },
  },
});

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
  chains: [mainnet, base, robinhoodChain],
  transports: {
    [mainnet.id]:        http(rpc(mainnet.id)),
    [base.id]:           http(rpc(base.id)),
    [robinhoodChain.id]: http(rpc(robinhoodChain.id)),
  },
  ssr: true,
});
