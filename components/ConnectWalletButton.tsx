// @ts-nocheck
"use client";

import { useEffect, useState } from 'react';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';

export default function ConnectWalletButton() {
  const [isClient, setIsClient] = useState(false);
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [isConnected, setIsConnected] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // NOTE: wagmi hooks will work only after Web3Provider is mounted
  // For now, just show the button
  const handleConnect = () => {
    // Web3Modal will handle the connection
    const modal = document.querySelector('w3m-button') as any;
    if (modal) modal.click();
  };

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
