"use client";

import { useEffect, useState } from 'react';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/utils/translations';

export default function ConnectWalletButton() {
  const { language } = useLanguage();
  const [address, setAddress] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConnect = () => {
    // Trigger WalletConnect modal
    const btn = document.querySelector('w3m-button') as HTMLElement;
    if (btn) btn.click();
  };

  const handleDisconnect = () => {
    const btn = document.querySelector('w3m-button') as any;
    if (btn?.disconnect) btn.disconnect();
    setAddress(null);
  };

  const copyAddress = () => {
    if (address && navigator.clipboard) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Listen for wallet connection
  useEffect(() => {
    const checkWallet = () => {
      const btn = document.querySelector('w3m-button') as any;
      if (btn?.address) {
        setAddress(btn.address);
      }
    };
    checkWallet();
    const interval = setInterval(checkWallet, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          address ? 'bg-green-500/20' : 'bg-white/5'
        }`}>
          <Wallet size={20} className={address ? 'text-green-400' : 'text-gray-400'} />
        </div>
        <div className="flex-1">
          {address ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-400 font-mono">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              <button onClick={copyAddress} className="p-1 hover:bg-white/10 rounded">
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-gray-400" />}
              </button>
            </div>
          ) : (
            <span className="text-sm text-gray-400">{t(language, 'profile.wallet')}</span>
          )}
        </div>
        {address ? (
          <button onClick={handleDisconnect} className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
            <LogOut size={18} className="text-red-400" />
          </button>
        ) : (
          <button
            onClick={handleConnect}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-xl
                       hover:opacity-90 transition-all active:scale-95"
          >
            {t(language, 'profile.wallet')}
          </button>
        )}
      </div>
    </div>
  );
}
