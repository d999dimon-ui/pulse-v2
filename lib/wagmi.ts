import { http, createConfig, createStorage } from 'wagmi';
import { mainnet, polygon, bsc } from 'wagmi/chains';
import { walletConnect, injected, metaMask } from 'wagmi/connectors';

// Этот конфиг отключает indexedDB и использует обычный localStorage
export const wagmiConfig = createConfig({
  chains: [mainnet, polygon, bsc],
  connectors: [
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
    }),
    injected(),
    metaMask(),
  ],
  storage: createStorage({
    // Если мы в браузере — используем localStorage, если нет — ничего
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    key: 'pulse_v2_storage', // Уникальный ключ для твоего проекта
  }),
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
  },
});
