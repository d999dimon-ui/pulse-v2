import { http, createConfig, createStorage } from 'wagmi';
import { mainnet, polygon, bsc } from 'wagmi/chains';
import { walletConnect, injected, metaMask } from 'wagmi/connectors';

// Web3 config - disabled by default, enable when WalletConnect project ID is configured
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

export const wagmiConfig = createConfig({
  chains: [mainnet, polygon, bsc],
  connectors: projectId ? [
    walletConnect({ projectId }),
    injected(),
    metaMask(),
  ] : [injected(), metaMask()],
  storage: createStorage({
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  }),
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
  },
});
