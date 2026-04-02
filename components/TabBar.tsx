"use client";

import { useState } from 'react';
import { Home, Map, Clipboard, User, Bell } from 'lucide-react';

interface TabBarProps {
  activeTab: 'feed' | 'map' | 'orders' | 'profile';
  onTabChange: (tab: 'feed' | 'map' | 'orders' | 'profile') => void;
  unreadCount?: number;
}

export default function TabBar({ activeTab, onTabChange, unreadCount = 0 }: TabBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[5000]">
      {/* Background blur */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl border-t border-white/10" />
      
      {/* Tab buttons */}
      <div className="relative grid grid-cols-4 gap-1 px-4 py-2">
        {/* Feed */}
        <button
          onClick={() => onTabChange('feed')}
          className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all ${
            activeTab === 'feed'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Home size={24} />
          <span className="text-xs font-medium">Лента</span>
        </button>
        
        {/* Map */}
        <button
          onClick={() => onTabChange('map')}
          className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all ${
            activeTab === 'map'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Map size={24} />
          <span className="text-xs font-medium">Карта</span>
        </button>
        
        {/* Orders */}
        <button
          onClick={() => onTabChange('orders')}
          className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all relative ${
            activeTab === 'orders'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Clipboard size={24} />
          <span className="text-xs font-medium">Заказы</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        
        {/* Profile */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all ${
            activeTab === 'profile'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <User size={24} />
          <span className="text-xs font-medium">Профиль</span>
        </button>
      </div>
      
      {/* Safe area for modern phones */}
      <div className="h-4" />
    </div>
  );
}
