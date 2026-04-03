import type { Metadata } from "next";
import Script from "next/script";
import ClientLayout from "./client-layout";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskHub - Earn with Tasks",
  description: "Complete tasks and earn rewards",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="antialiased" style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
