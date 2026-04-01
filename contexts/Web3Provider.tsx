"use client";

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '@/lib/wagmi';
import { createWeb3Modal } from '@web3modal/wagmi/react';

// Initialize Web3Modal
if (typeof window !== 'undefined') {
  createWeb3Modal({
    wagmiConfig,
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
    enableAnalytics: true,
    defaultChain: 'polygon',
    themeMode: 'dark',
    themeVariables: {
      '--w3m-accent': '#22d3ee',
      '--w3m-color-mix': '#000000',
    },
  });
}

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClientInstance] = useState(() => new QueryClient());
  
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClientInstance}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
