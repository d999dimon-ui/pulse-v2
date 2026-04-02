import dynamic from 'next/dynamic';
import Script from "next/script";
import "./globals.css";

const Web3Provider = dynamic(
  () => import('@/contexts/Web3Provider').then((mod: any) => mod.Web3Provider || mod.default || mod),
  { ssr: false }
);

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
