"use client";

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import PulseLogo from '@/components/PulseLogo';
import TabBar from '@/components/TabBar';
import TaskFeed from '@/components/TaskFeed';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/i18n';

export default function Header() {
  const { language } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="sticky top-0 z-[4000] bg-black/80 backdrop-blur-xl border-b border-white/10">
      {/* Safe area */}
      <div className="h-2" />
      
      {/* Header content */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <PulseLogo size={40} withText={false} className="text-orange-500" />
          <h1 className="text-lg font-bold text-white">
            {t(language, 'nav.feed')}
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-white/10 rounded-full transition-all"
          >
            <Bell size={20} className="text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>

      {/* Notifications dropdown */}
      {showNotifications && (
        <div className="absolute top-full right-4 mt-2 w-72 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-bold text-white">Уведомления</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <div className="p-4 text-center text-gray-400 text-sm">
              Нет новых уведомлений
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
