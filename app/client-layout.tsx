'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Web3Provider = dynamic(
  () => import('@/contexts/Web3Provider').then((mod: any) => mod.Web3Provider || mod.default),
  { ssr: false }
) as React.ComponentType<{ children: React.ReactNode }>;

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <div style={{ background: 'black', minHeight: '100vh' }} />;

  return <Web3Provider>{children}</Web3Provider>;
}
