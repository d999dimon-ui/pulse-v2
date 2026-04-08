"use client";

import { Home, Compass, Map, MessageCircle, User } from 'lucide-react';

interface TabBarProps {
  activeTab: 'home' | 'feed' | 'map' | 'chats' | 'profile';
  onTabChange: (tab: 'home' | 'feed' | 'map' | 'chats' | 'profile') => void;
  unreadCount?: number;
  language?: string;
}

const tabLabels: Record<string, { ru: string; en: string }> = {
  home: { ru: 'Главная', en: 'Home' },
  feed: { ru: 'Лента', en: 'Feed' },
  map: { ru: 'Карта', en: 'Map' },
  chats: { ru: 'Чаты', en: 'Chats' },
  profile: { ru: 'Профиль', en: 'Profile' },
};

export default function TabBar({ activeTab, onTabChange, unreadCount = 0, language = 'ru' }: TabBarProps) {
  const tabs = [
    { key: 'home' as const, icon: Home },
    { key: 'feed' as const, icon: Compass },
    { key: 'map' as const, icon: Map },
    { key: 'chats' as const, icon: MessageCircle },
    { key: 'profile' as const, icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a1a] border-t border-white/5 z-40">
      <div className="max-w-md mx-auto px-4 py-3 flex justify-around items-center gap-2">
        {tabs.map(({ key, icon: Icon }) => {
          const label = tabLabels[key]?.[language === 'ru' ? 'ru' : 'en'] || key;
          return (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                activeTab === key
                  ? 'text-yellow-400 bg-white/10'
                  : 'text-gray-400 hover:text-white'
              }`}
              aria-label={label}
            >
              <div className="relative">
                <Icon size={24} strokeWidth={activeTab === key ? 2.5 : 1.5} />
                {key === 'chats' && unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
