import type { Metadata } from "next";
import Script from "next/script";
import nextDynamic from "next/dynamic";
import "./globals.css";

// Dynamic import with SSR disabled to avoid indexedDB errors
const Web3Provider = nextDynamic(
  async () => {
    const mod = await import("@/contexts/Web3Provider");
    return mod.default || mod.Web3Provider;
  },
  { 
    ssr: false, 
    loading: () => <div className="fixed inset-0 bg-black" /> 
  }
);

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
  return (
    <html lang="en">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="antialiased" style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
