"use client";

import { useEffect, useState, ReactNode } from "react";
import { WagmiProvider, createConfig, http, createStorage } from 'wagmi';
import { mainnet, bsc } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'a458da84b85d46b8a16d1a3e94c10e51';

export default function Web3Provider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ReturnType<typeof createConfig> | null>(null);
  const [queryClient] = useState(() => new QueryClient());
  const [web3ModalInitialized, setWeb3ModalInitialized] = useState(false);

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

  // Инициализируем Web3Modal только после создания конфига
  useEffect(() => {
    if (!config || typeof window === 'undefined' || web3ModalInitialized) return;

    try {
      createWeb3Modal({
        wagmiConfig: config,
        projectId,
        enableAnalytics: false,
        defaultChain: bsc,
        themeMode: 'dark',
        themeVariables: {
          '--w3m-accent': '#22d3ee',
          '--w3m-color-mix': '#000000',
        },
        // ВРЕМЕННОЕ РЕШЕНИЕ: отключаем функции, которые могут вызывать ошибки
        features: {
          analytics: false,
          email: false,
          socials: false,
        },
        metadata: {
          name: 'TaskHub',
          description: 'Complete tasks and earn rewards',
          url: 'https://pulse-v2-drab.vercel.app',
          icons: ['https://avatars.githubusercontent.com/u/37784886'],
        },
        // Разрешаем неподдерживаемые цепочки
        allowUnsupportedChain: true,
      });
      setWeb3ModalInitialized(true);
    } catch (e) {
      console.error('Web3Modal init error:', e);
    }
  }, [config, web3ModalInitialized]);

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
