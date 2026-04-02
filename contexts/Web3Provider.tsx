"use client";

import { useEffect, useState, ReactNode, useMemo } from "react";
import { WagmiProvider, createConfig, http, createStorage } from 'wagmi';
import { mainnet, bsc } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function Web3Provider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Создаем конфиг ТОЛЬКО после монтирования
  const config = useMemo(() => {
    if (typeof window === 'undefined') return null;
    
    return createConfig({
      chains: [mainnet, bsc],
      storage: createStorage({
        storage: window.localStorage,
      }),
      transports: {
        [mainnet.id]: http(),
        [bsc.id]: http(),
      },
    });
  }, []);

  const queryClient = useMemo(() => new QueryClient(), []);

  if (!mounted || !config) return null;

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
