"use client";

import { useState, useEffect, useRef } from 'react';
import { Send, X, Bot, User, AlertTriangle, Gift, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/utils/translations';
import { supabase } from '@/lib/supabase';
import { checkUserBonusesForSupport } from '@/lib/referral-bonus';
import { getWarningMessage, Language } from '@/lib/warnings-i18n';
import NeuroChat from './NeuroChat';

interface ChatRoomProps {
  userId: string;
  tasks: any[];
}

export default function ChatRoom({ userId, tasks }: ChatRoomProps) {
  const { language } = useLanguage();
  const [isNeuroChatOpen, setIsNeuroChatOpen] = useState(false);

  return (
    <div className="bg-black min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 p-4 bg-black/95 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">{t(language, 'chat.title')}</h1>
          <button
            onClick={() => setIsNeuroChatOpen(true)}
            className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:opacity-90 transition-all"
          >
            <Bot size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-8">
        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
          <Bot size={40} className="text-gray-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{t(language, 'chat.noChats')}</h2>
        <p className="text-gray-400 text-sm mb-6">
          {language === 'ru'
            ? 'Нажмите на кнопку AI ассистента для помощи'
            : 'Tap the AI assistant button for help'}
        </p>
        <button
          onClick={() => setIsNeuroChatOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl
                     hover:from-cyan-600 hover:to-blue-600 transition-all active:scale-95"
        >
          {language === 'ru' ? 'Открыть AI чат' : 'Open AI Chat'}
        </button>
      </div>

      {/* NeuroChat Modal */}
      <NeuroChat
        isOpen={isNeuroChatOpen}
        onClose={() => setIsNeuroChatOpen(false)}
        userId={userId}
      />
    </div>
  );
}
