"use client";

import { useEffect, useState } from 'react';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';

// Declare Web3Modal custom elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'w3m-button': {
        balance?: string;
        size?: string;
        label?: string;
        loadingLabel?: string;
      };
      'w3m-network-button': {};
      'w3m-modal': {};
    }
  }
}

export default function ConnectWalletButton() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Показываем кнопку только после монтирования
  if (!isClient) {
    return (
      <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
        <div className="text-sm text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <w3m-button
      balance="hide"
      size="md"
      label="Connect Wallet"
      loadingLabel="Connecting..."
    />
  );
}
