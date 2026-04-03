"use client";

import { useEffect, useState, ReactNode, useCallback } from "react";
import { WagmiProvider, createConfig, http, createStorage } from 'wagmi';
import { mainnet, bsc } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';

// REOWN PROJECT ID
const projectId = 'fddee1a2f13afd4b0673448de730c271';

let web3ModalInstance: ReturnType<typeof createWeb3Modal> | null = null;

export default function Web3Provider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [config] = useState(() => {
    // Создаём конфиг только в браузере
    if (typeof window === 'undefined') return null;
    try {
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
    } catch (e) {
      console.error('Web3 config error:', e);
      return null;
    }
  });
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    if (typeof window === 'undefined' || !config || web3ModalInstance) return;

    let mounted = true;
    
    // Даем React завершить гидрацию
    const timer = setTimeout(() => {
      if (!mounted) return;
      try {
        web3ModalInstance = createWeb3Modal({
          wagmiConfig: config,
          projectId,
          enableAnalytics: false,
          defaultChain: bsc,
          themeMode: 'dark',
          themeVariables: {
            '--w3m-accent': '#22d3ee',
            '--w3m-color-mix': '#000000',
          },
          metadata: {
            name: 'TaskHub',
            description: 'Complete tasks and earn rewards',
            url: 'https://pulse-v2.vercel.app',
            icons: ['https://avatars.githubusercontent.com/u/37784886'],
          },
          allowUnsupportedChain: true,
        });
        if (mounted) setIsReady(true);
      } catch (e) {
        console.error('Web3Modal init error:', e);
        // Даже если Web3Modal не инициализировался, показываем детей
        if (mounted) setIsReady(true);
      }
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [config]);

  // Пока не готово - рендерим детей без провайдеров (избегаем SSR mismatch)
  if (!config || !isReady) {
    return <>{children}</>;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
