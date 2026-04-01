"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/utils/translations';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LanguageSelectorModal({ isOpen, onClose }: LanguageSelectorModalProps) {
  const { setLanguage } = useLanguage();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSelectLanguage = (lang: 'en' | 'ru') => {
    setIsAnimating(true);
    setTimeout(() => {
      setLanguage(lang);
      onClose();
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[4000]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-sm z-[4001]">
        <div className={`bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl 
                        border border-cyan-500/30 rounded-3xl p-6 
                        shadow-[0_0_40px_rgba(34,211,238,0.2)]
                        transition-all duration-200 ${isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
          
          {/* Icon */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 
                            flex items-center justify-center text-4xl shadow-lg shadow-cyan-500/30">
              🌍
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Select Language</h2>
            <p className="text-gray-400 text-sm">Choose your preferred language to get started</p>
          </div>

          {/* Language Options */}
          <div className="space-y-3">
            <button
              onClick={() => handleSelectLanguage('en')}
              className="w-full py-4 px-6 bg-white/5 border border-white/10 rounded-2xl
                         flex items-center gap-4
                         hover:bg-white/10 hover:border-cyan-500/50
                         transition-all duration-300 group"
            >
              <span className="text-3xl">🇺🇸</span>
              <div className="text-left flex-1">
                <div className="font-semibold text-white">English</div>
                <div className="text-xs text-gray-500">Default language</div>
              </div>
              <span className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </button>

            <button
              onClick={() => handleSelectLanguage('ru')}
              className="w-full py-4 px-6 bg-white/5 border border-white/10 rounded-2xl
                         flex items-center gap-4
                         hover:bg-white/10 hover:border-cyan-500/50
                         transition-all duration-300 group"
            >
              <span className="text-3xl">🇷🇺</span>
              <div className="text-left flex-1">
                <div className="font-semibold text-white">Русский</div>
                <div className="text-xs text-gray-500">Русский язык</div>
              </div>
              <span className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 mt-6">
            You can change this later in settings
          </p>
        </div>
      </div>
    </>
  );
}
