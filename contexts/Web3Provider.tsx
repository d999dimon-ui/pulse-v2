"use client";

import { useState, ReactNode } from "react";
import { WagmiProvider, createConfig, http, createStorage } from 'wagmi';
import { mainnet, bsc } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// REOWN PROJECT ID
const projectId = 'fddee1a2f13afd4b0673448de730c271';

// Создаём конфиг один раз
const config = createConfig({
  chains: [mainnet, bsc],
  storage: createStorage({
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  }),
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
