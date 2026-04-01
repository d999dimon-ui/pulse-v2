import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

// TaskHub v2.0 - Telegram Mini App for task management and earnings
// Updated: Force rebuild for correct UI deployment
export const metadata: Metadata = {
  title: "TaskHub - Earn with Tasks",
  description: "Complete tasks and earn rewards in your area",
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
