"use client";

import { useEffect, useState, ReactNode } from "react";
import { WagmiProvider, createConfig, http, createStorage } from 'wagmi';
import { mainnet, bsc } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function Web3Provider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ReturnType<typeof createConfig> | null>(null);
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    // Создаем конфиг только в браузере
    if (typeof window === 'undefined') return;

    try {
      const cfg = createConfig({
        chains: [mainnet, bsc],
        storage: createStorage({
          storage: window.localStorage,
        }),
        transports: {
          [mainnet.id]: http(),
          [bsc.id]: http(),
        },
      });
      setConfig(cfg);
    } catch (e) {
      console.error('Web3 config error:', e);
    }
  }, []);

  // Пока конфиг не создан - показываем пустоту
  if (!config) return null;

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
