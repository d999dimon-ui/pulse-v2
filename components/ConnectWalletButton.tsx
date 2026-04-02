"use client";

import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';
import { formatAddress } from '@/lib/web3';

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
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 rounded-xl px-4 py-2">
          <div className="flex items-center gap-2">
            <Wallet size={16} className="text-cyan-400" />
            <div>
              <div className="text-xs text-gray-400">Connected</div>
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                {formatAddress(address)}
                <button
                  onClick={handleCopyAddress}
                  className="hover:text-cyan-400 transition-colors"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
          {balance && (
            <div className="text-xs text-gray-500 mt-1">
              {balance.formatted.slice(0, 6)} {balance.symbol}
            </div>
          )}
        </div>
        <button
          onClick={() => disconnect()}
          className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-red-500/20 hover:border-red-500/50 transition-all"
          aria-label="Disconnect"
        >
          <LogOut size={18} className="text-gray-400 hover:text-red-400" />
        </button>
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
