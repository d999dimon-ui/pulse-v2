import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Script from "next/script";
import "./globals.css";

const Web3Provider = dynamic(
  () => import('@/contexts/Web3Provider').then((mod: any) => mod.Web3Provider || mod.default),
  { ssr: false }
) as React.ComponentType<{ children: React.ReactNode }>;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <html lang="en">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        {/* Это КЛЮЧЕВОЙ МОМЕНТ: если мы не на клиенте, НЕ показываем провайдер вообще */}
        {isClient ? (
          <Web3Provider>
            {children}
          </Web3Provider>
        ) : (
          <div style={{ background: 'black', minHeight: '100vh' }} />
        )}
      </body>
    </html>
  );
}
