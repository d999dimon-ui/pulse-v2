"use client";

import { useState, useEffect } from 'react';
import { Home, Map, MessageSquare, User, Bell } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/i18n';

interface TabBarProps {
  activeTab: 'feed' | 'map' | 'chats' | 'profile';
  onTabChange: (tab: 'feed' | 'map' | 'chats' | 'profile') => void;
  unreadCount?: number;
}

export default function TabBar({ activeTab, onTabChange, unreadCount = 0 }: TabBarProps) {
  const { language } = useLanguage();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[5000]">
      {/* Background */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl border-t border-white/10" />
      
      {/* Safe area */}
      <div className="h-2" />
      
      {/* Tab buttons */}
      <div className="relative grid grid-cols-4 gap-1 px-2 py-2">
        {/* Feed */}
        <button
          onClick={() => onTabChange('feed')}
          className={`flex flex-col items-center gap-1 py-2 px-2 rounded-xl transition-all ${
            activeTab === 'feed'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Home size={22} />
          <span className="text-[10px] font-medium">{t(language, 'nav.feed')}</span>
        </button>
        
        {/* Map */}
        <button
          onClick={() => onTabChange('map')}
          className={`flex flex-col items-center gap-1 py-2 px-2 rounded-xl transition-all ${
            activeTab === 'map'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Map size={22} />
          <span className="text-[10px] font-medium">{t(language, 'nav.map')}</span>
        </button>
        
        {/* Chats */}
        <button
          onClick={() => onTabChange('chats')}
          className={`flex flex-col items-center gap-1 py-2 px-2 rounded-xl transition-all relative ${
            activeTab === 'chats'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <MessageSquare size={22} />
          <span className="text-[10px] font-medium">{t(language, 'nav.chats')}</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        
        {/* Profile */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center gap-1 py-2 px-2 rounded-xl transition-all ${
            activeTab === 'profile'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <User size={22} />
          <span className="text-[10px] font-medium">{t(language, 'nav.profile')}</span>
        </button>
      </div>
    </div>
  );
}
