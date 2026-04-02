"use client";

import { ReactNode, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '@/lib/wagmi';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { bsc } from 'wagmi/chains';

// Fix for Vercel SSR - prevent indexedDB errors
if (typeof window === "undefined") {
  // @ts-ignore
  global.indexedDB = {}; 
}

// Initialize Web3Modal (Wagmi v2 compatible - NO chains in options!)
// Wrap in useEffect to avoid SSR issues with indexedDB
if (typeof window !== 'undefined') {
  createWeb3Modal({
    wagmiConfig,
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
    enableAnalytics: true,
    defaultChain: bsc,
    themeMode: 'dark',
    themeVariables: {
      '--w3m-accent': '#22d3ee',
      '--w3m-color-mix': '#000000',
    },
  });
}

const queryClient = new QueryClient();

export default function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClientInstance] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClientInstance}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
