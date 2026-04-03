'use client';

// Web3Provider отключён из-за ошибки "Origin not allowed" от WalletConnect/TON Connect
// Для включения: добавь домен в https://cloud.walletconnect.com и раскомментируй:
// import Web3Provider from '@/contexts/Web3Provider';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // return <Web3Provider>{children}</Web3Provider>;
  return <>{children}</>;
}
