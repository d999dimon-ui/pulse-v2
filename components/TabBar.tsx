"use client";

import { Home as HomeIcon, Map, MessageSquare, User, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/utils/translations';

interface TabBarProps {
  activeTab: 'feed' | 'map' | 'chats' | 'profile';
  onTabChange: (tab: 'feed' | 'map' | 'chats' | 'profile') => void;
  onCreateTask: () => void;
  onProfileClick: () => void;
  onFeedClick: () => void;
  onChatClick: () => void;
  tasksCount: number;
  unreadCount: number;
}

export default function TabBar({
  activeTab,
  onTabChange,
  onCreateTask,
  onProfileClick,
  onFeedClick,
  onChatClick,
  tasksCount,
  unreadCount,
}: TabBarProps) {
  const { language } = useLanguage();

  const tabs = [
    { key: 'feed' as const, icon: HomeIcon, label: t(language, 'nav.home') || 'Home', badge: tasksCount },
    { key: 'map' as const, icon: Map, label: t(language, 'nav.map') || 'Map', badge: 0 },
    { key: 'chats' as const, icon: MessageSquare, label: t(language, 'nav.chats') || 'Chats', badge: unreadCount },
    { key: 'profile' as const, icon: User, label: t(language, 'nav.profile') || 'Profile', badge: 0 },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[2000] bg-black/95 backdrop-blur-xl border-t border-white/10 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto relative">
        {tabs.map(({ key, icon: Icon, label, badge }) => (
          <button
            key={key}
            onClick={() => {
              if (key === 'feed') onFeedClick();
              else if (key === 'chats') onChatClick();
              else if (key === 'profile') onProfileClick();
              else onTabChange(key);
            }}
            className={`flex flex-col items-center justify-center flex-1 py-2 relative transition-all duration-200 ${
              activeTab === key ? 'text-cyan-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <div className="relative">
              <Icon size={22} strokeWidth={activeTab === key ? 2.5 : 1.5} />
              {badge > 0 && (
                <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 bg-cyan-500 rounded-full text-[10px] font-bold text-black flex items-center justify-center">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 font-medium">{label}</span>
            {activeTab === key && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>
        ))}

        {/* Center Create Button */}
        <button
          onClick={onCreateTask}
          className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500
                     text-white flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.5)]
                     hover:shadow-[0_0_30px_rgba(34,211,238,0.8)] transition-all active:scale-90 border-4 border-black"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
