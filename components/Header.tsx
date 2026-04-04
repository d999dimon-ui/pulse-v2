"use client";

import { User, ListFilter, Settings, Bell } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/utils/translations';

interface HeaderProps {
  activeTab: 'feed' | 'map' | 'chats' | 'profile';
  unreadCount: number;
  onProfileClick: () => void;
  onFeedClick: () => void;
  tasksCount: number;
}

export default function Header({
  activeTab,
  unreadCount,
  onProfileClick,
  onFeedClick,
  tasksCount,
}: HeaderProps) {
  const { language } = useLanguage();

  if (activeTab === 'profile' || activeTab === 'chats') return null;

  return (
    <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between">
      <button onClick={onProfileClick} className="w-12 h-12 rounded-full bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center hover:border-purple-500/50 transition-all duration-300">
        <User size={20} className="text-white" />
      </button>
      <button onClick={onFeedClick} className="px-4 py-3 rounded-full bg-black/80 backdrop-blur-md border border-white/20 flex items-center gap-2 hover:border-cyan-500/50 transition-all duration-300">
        <ListFilter size={18} className="text-cyan-400" />
        <span className="text-white font-medium text-sm">{tasksCount} Tasks</span>
      </button>
    </div>
  );
}
