"use client";

import { useState, useEffect } from 'react';
import { Home as HomeIcon, Map as MapIcon, ListChecks, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/utils/translations';

type TabType = 'home' | 'map' | 'tasks' | 'profile';

interface TabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { key: TabType; icon: typeof HomeIcon; labelKey: string }[] = [
  { key: 'home', icon: HomeIcon, labelKey: 'nav.home' },
  { key: 'map', icon: MapIcon, labelKey: 'nav.map' },
  { key: 'tasks', icon: ListChecks, labelKey: 'nav.tasks' },
  { key: 'profile', icon: User, labelKey: 'nav.profile' },
];

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const { language } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[2000] bg-black/95 backdrop-blur-xl border-t border-white/10 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ key, icon: Icon, labelKey }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-all duration-200 ${
                isActive ? 'text-cyan-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] mt-1 font-medium">{t(language, labelKey)}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-cyan-400 mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
