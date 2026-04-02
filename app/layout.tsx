import dynamic from 'next/dynamic';
import Script from "next/script";
import React from 'react';
import "./globals.css";

// Добавляем as React.FC<any>, чтобы убрать ошибку IntrinsicAttributes
const Web3Provider = dynamic(
  () => import('@/contexts/Web3Provider').then((mod: any) => mod.Web3Provider || mod.default || mod),
  { 
    ssr: false,
    loading: () => <div style={{ background: 'black', minHeight: '100vh' }} />
  }
) as React.FC<any>;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="antialiased" style={{ margin: 0, padding: 0, overflow: 'hidden' }} suppressHydrationWarning>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
