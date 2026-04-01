"use client";

import { useState } from 'react';
import { User, Task } from '@/types/task';
import { X, Wallet, Star, TrendingUp, Globe, Info, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t, Language } from '@/utils/translations';
import AboutModal from './AboutModal';
import ConnectWalletButton from './ConnectWalletButton';
import SupportChat from './SupportChat';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  tasks: Task[];
  onWithdraw: () => void;
}

export default function UserProfile({
  isOpen,
  onClose,
  user,
  tasks,
  onWithdraw
}: UserProfileProps) {
  const { language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'my-tasks'>('overview');
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showSupportChat, setShowSupportChat] = useState(false);

  const myTasks = tasks.filter(task => task.userId === user?.id);
  const completedTasks = myTasks.filter(task => task.status === 'completed');
  const activeTasks = myTasks.filter(task => task.status === 'active');

  // Safety check for SSR
  if (!isOpen || !user || typeof window === 'undefined') return null;

  // Safe date calculation
  const joinedDate = user.completedTasks > 0 
    ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    : new Date();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ru' : 'en');
  };

  return (
    <>
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[3500]"
        onClick={onClose}
      />

      {/* Profile Panel */}
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-[3501]">
        <div className="bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl
                        border border-purple-500/30 rounded-3xl overflow-hidden
                        shadow-[0_0_40px_rgba(168,85,247,0.2)]">
          
          {/* Header */}
          <div className="relative p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-white/10">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label={t(language, 'close')}
            >
              <X size={20} className="text-white" />
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label={t(language, 'language')}
            >
              <Globe size={18} className="text-white" />
            </button>

            <div className="flex items-center gap-4 mt-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500
                              flex items-center justify-center text-2xl font-bold text-white">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">@{user.username}</h2>
                <p className="text-sm text-gray-400">{t(language, 'taskerSince')} {joinedDate.toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Balance Card */}
          <div className="p-6">
            {/* Web3 Connect */}
            <div className="mb-6">
              <ConnectWalletButton />
            </div>
            
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30
                            rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">{t(language, 'currentBalance')}</span>
                <Wallet size={18} className="text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">{user.balance.toFixed(2)}</span>
                <span className="text-cyan-400 font-semibold">Stars</span>
              </div>
              <button
                onClick={onWithdraw}
                className="mt-4 w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500
                           text-white font-semibold rounded-xl
                           hover:from-cyan-600 hover:to-blue-600
                           shadow-[0_0_15px_rgba(34,211,238,0.3)]
                           transition-all duration-300 active:scale-98"
              >
                {t(language, 'withdrawFunds')}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{user.completedTasks}</div>
                <div className="text-xs text-gray-400 mt-1">{t(language, 'completed')}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{activeTasks.length}</div>
                <div className="text-xs text-gray-400 mt-1">{t(language, 'active')}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-cyan-400">{(user.completedTasks * 0.95).toFixed(0)}</div>
                <div className="text-xs text-gray-400 mt-1">{t(language, 'rating')}</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-white/5 text-gray-400 border border-white/10'
                }`}
              >
                {t(language, 'overview')}
              </button>
              <button
                onClick={() => setActiveTab('my-tasks')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  activeTab === 'my-tasks'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-white/5 text-gray-400 border border-white/10'
                }`}
              >
                {t(language, 'myTasks')} ({myTasks.length})
              </button>
            </div>

            {/* Tab Content */}
            <div className="max-h-48 overflow-y-auto space-y-2">
              {activeTab === 'overview' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <TrendingUp size={18} className="text-green-400" />
                      <span className="text-sm text-gray-300">{t(language, 'totalEarned')}</span>
                    </div>
                    <span className="text-white font-semibold">+{user.balance} ⭐</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Star size={18} className="text-yellow-400" />
                      <span className="text-sm text-gray-300">{t(language, 'successRate')}</span>
                    </div>
                    <span className="text-white font-semibold">95%</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {myTasks.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">{t(language, 'noTasksYet')}</p>
                  ) : (
                    myTasks.slice(0, 5).map(task => (
                      <div key={task.id} className="p-3 bg-white/5 rounded-xl">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white truncate flex-1">{task.title}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            task.status === 'claimed' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {t(language, `status.${task.status}`)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* About & Support Buttons */}
        <div className="p-6 space-y-3 border-t border-white/10">
          <button
            onClick={() => setShowAboutModal(true)}
            className="w-full py-3 px-4 bg-white/5 border border-white/10 rounded-xl
                       flex items-center justify-center gap-2
                       hover:bg-white/10 hover:border-purple-500/50
                       transition-all duration-300"
          >
            <Info size={18} className="text-purple-400" />
            <span className="text-white font-medium">About Pulse</span>
          </button>
          
          <button
            onClick={() => setShowSupportChat(true)}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 
                       border border-purple-500/50 rounded-xl
                       flex items-center justify-center gap-2
                       hover:from-purple-500/30 hover:to-pink-500/30
                       transition-all duration-300"
          >
            <MessageSquare size={18} className="text-purple-400" />
            <span className="text-white font-medium">Support Chat</span>
          </button>
        </div>
      </div>
      
      <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />
      <SupportChat isOpen={showSupportChat} onClose={() => setShowSupportChat(false)} userId={user?.id || ''} />
    </>
  );
}
