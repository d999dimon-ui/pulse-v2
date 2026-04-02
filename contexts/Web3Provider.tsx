"use client";

import { useEffect, useState, ReactNode } from "react";
import { WagmiProvider, createConfig, http, createStorage } from 'wagmi';
import { mainnet, bsc } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 1. Создаем конфиг ПРЯМО ТУТ с защитой storage
const config = createConfig({
  chains: [mainnet, bsc],
  storage: createStorage({
    // КРИТИЧНО: Используем localStorage, он никогда не выдаст "not defined"
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  }),
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function Web3Provider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. ЕСЛИ НЕ В БРАУЗЕРЕ - РИСУЕМ ПУСТОТУ. Никаких Wagmi до этого момента!
  if (!mounted) return <div style={{ background: 'black', minHeight: '100vh' }} />;

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
