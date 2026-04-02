import dynamic from 'next/dynamic';
import Script from "next/script";
import "./globals.css";

// Это ГАРАНТИРУЕТ, что Web3 не сломает гидратацию
const Web3Provider = dynamic(
  () => import('@/contexts/Web3Provider').then((mod) => mod.Web3Provider || mod.default),
  { ssr: false }
);

export const metadata = {
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
      <body className="antialiased" style={{ margin: 0, padding: 0, overflow: 'hidden' }} suppressHydrationWarning>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
