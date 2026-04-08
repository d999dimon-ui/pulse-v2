"use client";

import { Home, Compass, Map, MessageCircle, User } from 'lucide-react';

interface TabBarProps {
  activeTab: 'home' | 'feed' | 'map' | 'chats' | 'profile';
  onTabChange: (tab: 'home' | 'feed' | 'map' | 'chats' | 'profile') => void;
  unreadCount?: number;
}

const tabs = [
  { key: 'home' as const, icon: Home, label: 'Home' },
  { key: 'feed' as const, icon: Compass, label: 'Feed' },
  { key: 'map' as const, icon: Map, label: 'Map' },
  { key: 'chats' as const, icon: MessageCircle, label: 'Chats' },
  { key: 'profile' as const, icon: User, label: 'Profile' },
];

export default function TabBar({ activeTab, onTabChange, unreadCount = 0 }: TabBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark-bg border-t border-dark-border z-40">
      <div className="max-w-md mx-auto px-4 py-3 flex justify-around items-center gap-2">
        {tabs.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
              activeTab === key
                ? 'text-neon-cyan bg-dark-border'
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
        ))}
      </div>
    </div>
  );
}
