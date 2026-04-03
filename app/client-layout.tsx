'use client';

import Web3Provider from '@/contexts/Web3Provider';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <Web3Provider>{children}</Web3Provider>;
}
