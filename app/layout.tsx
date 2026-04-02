'use client';

import { useState, useEffect } from 'react';
import Script from "next/script";
import { Web3Provider } from '@/contexts/Web3Provider';
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskHub - Earn with Tasks",
  description: "Complete tasks and earn rewards in your area",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html lang="en">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="antialiased" style={{ margin: 0, padding: 0, overflow: 'hidden' }} suppressHydrationWarning>
        {mounted ? (
          <Web3Provider>{children}</Web3Provider>
        ) : (
          <div className="bg-black min-h-screen" />
        )}
      </body>
    </html>
  );
}
