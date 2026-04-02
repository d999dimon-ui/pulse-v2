import { http, createConfig, cookieStorage, createStorage } from 'wagmi';
import { mainnet, polygon, bsc } from 'wagmi/chains';
import { walletConnect, injected, metaMask } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [mainnet, polygon, bsc],
  connectors: [
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
    }),
    injected(),
    metaMask(),
  ],
  // CRITICAL: Use cookieStorage for SSR to avoid indexedDB errors
  storage: createStorage({
    storage: typeof window !== 'undefined' ? window.localStorage : cookieStorage,
  }),
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
  },
});
