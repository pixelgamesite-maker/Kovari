import { http } from 'wagmi';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, base } from 'wagmi/chains';

const rpc = (chainId: number) => `/api/rpc/${chainId}`;

export const wagmiConfig = getDefaultConfig({
  appName: 'Mintrs',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '',
  chains: [mainnet, base],
  transports: {
    [mainnet.id]: http(rpc(mainnet.id)),
    [base.id]:    http(rpc(base.id)),
  },
  ssr: true,
});
