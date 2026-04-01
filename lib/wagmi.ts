import { http, createConfig } from 'wagmi';
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
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
  },
});
