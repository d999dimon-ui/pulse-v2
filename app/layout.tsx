import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Web3Provider } from "@/contexts/Web3Provider";

export const metadata: Metadata = {
  title: "TaskHub - Earn with Tasks",
  description: "Complete tasks and earn rewards in your area",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
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
