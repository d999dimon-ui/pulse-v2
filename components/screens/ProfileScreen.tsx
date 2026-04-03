"use client";

import { useState, useCallback } from 'react';
import { X, Wallet, Star, TrendingUp, Globe, Info, MessageSquare, Copy, Check, Users, Gift, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t, Language } from '@/utils/translations';
import { User } from '@/types/task';
import ConnectWalletButton from '@/components/ConnectWalletButton';
import SupportChat from '@/components/SupportChat';
import AboutModal from '@/components/AboutModal';

interface ProfileScreenProps {
  user: User | null;
  tasks: any[];
  onWithdraw: () => void;
  onClose: () => void;
  onUpdateUser: (user: User) => void;
}

export default function ProfileScreen({ user, tasks, onWithdraw, onClose, onUpdateUser }: ProfileScreenProps) {
  const { language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'my-tasks'>('overview');
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showSupportChat, setShowSupportChat] = useState(false);
  const [copied, setCopied] = useState(false);

  const myTasks = tasks.filter(task => task.user_id === user?.id);
  const completedTasks = myTasks.filter(task => task.status === 'completed');
  const activeTasks = myTasks.filter(task => task.status === 'active' || task.status === 'in_progress');
  const joinedDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const languages: { code: Language; flag: string; label: string }[] = [
    { code: 'en', flag: '🇺🇸', label: 'English' },
    { code: 'ru', flag: '🇷🇺', label: 'Русский' },
    { code: 'uz', flag: '🇺', label: 'O\'zbek' },
  ];

  const referralLink = user ? `https://t.me/PulseTaskHubBot?start=ref_${user.id}` : '';

  const copyReferralLink = useCallback(() => {
    if (typeof navigator !== 'undefined' && referralLink) {
      navigator.clipboard.writeText(referralLink).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, [referralLink]);

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-gradient-to-b from-gray-900 to-black rounded-3xl border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-white/10 rounded-t-3xl">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors">
            <X size={20} className="text-white" />
          </button>
          <div className="flex items-center gap-4 mt-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">@{user.username}</h2>
              <p className="text-sm text-gray-400">{t(language, 'profile.taskerSince')} {joinedDate.toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="p-6">
          <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl p-5 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">{t(language, 'profile.balance')}</span>
              <Wallet size={18} className="text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">{user.balance.toFixed(2)}</span>
              <span className="text-cyan-400 font-semibold">{t(language, 'profile.stars')}</span>
            </div>
            <button
              onClick={onWithdraw}
              className="mt-4 w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl
                         hover:from-cyan-600 hover:to-blue-600 shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all active:scale-[0.98]"
            >
              {t(language, 'profile.withdraw')}
            </button>
          </div>

          {/* Wallet Connect */}
          <div className="mb-4">
            <ConnectWalletButton />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-white">{user.completedTasks}</div>
              <div className="text-[10px] text-gray-400 mt-1">{t(language, 'profile.completed')}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-white">{activeTasks.length}</div>
              <div className="text-[10px] text-gray-400 mt-1">{t(language, 'profile.active')}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-cyan-400">{user.completedTasks > 0 ? '95' : '0'}</div>
              <div className="text-[10px] text-gray-400 mt-1">{t(language, 'profile.rating')}</div>
            </div>
          </div>

          {/* Referral Section */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <Gift size={20} className="text-purple-400" />
              <h3 className="text-white font-semibold text-sm">{t(language, 'profile.referral')}</h3>
            </div>
            <p className="text-xs text-gray-400 mb-3">{t(language, 'profile.referralHint')}</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 truncate">
                {referralLink}
              </div>
              <button
                onClick={copyReferralLink}
                className="p-2 bg-purple-500/20 border border-purple-500/50 rounded-lg hover:bg-purple-500/30 transition-colors"
              >
                {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-purple-400" />}
              </button>
            </div>
          </div>

          {/* Language Selector */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe size={16} className="text-gray-400" />
              <span className="text-sm text-gray-400">{t(language, 'profile.language')}</span>
            </div>
            <div className="flex gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                    language === lang.code
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                      : 'bg-white/5 text-gray-400 border border-white/10'
                  }`}
                >
                  {lang.flag} {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-white/5 text-gray-400 border border-white/10'
              }`}
            >
              {t(language, 'profile.overview')}
            </button>
            <button
              onClick={() => setActiveTab('my-tasks')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'my-tasks'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-white/5 text-gray-400 border border-white/10'
              }`}
            >
              {t(language, 'profile.myTasks')} ({myTasks.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="max-h-40 overflow-y-auto space-y-2 mb-4">
            {activeTab === 'overview' ? (
              <>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <TrendingUp size={16} className="text-green-400" />
                    <span className="text-sm text-gray-300">{t(language, 'profile.totalEarned')}</span>
                  </div>
                  <span className="text-white font-semibold">+{user.balance} ⭐</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Star size={16} className="text-yellow-400" />
                    <span className="text-sm text-gray-300">{t(language, 'profile.successRate')}</span>
                  </div>
                  <span className="text-white font-semibold">95%</span>
                </div>
              </>
            ) : (
              myTasks.length === 0 ? (
                <p className="text-center text-gray-500 py-4 text-sm">{t(language, 'profile.noTasksYet')}</p>
              ) : (
                myTasks.slice(0, 5).map(task => (
                  <div key={task.id} className="p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white truncate flex-1">{task.title}</span>
                      <span className={`text-[10px] px-2 py-1 rounded-full ${
                        task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        task.status === 'claimed' || task.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {t(language, `tasks.status.${task.status}`)}
                      </span>
                    </div>
                  </div>
                ))
              )
            )}
          </div>

          {/* Support & About */}
          <div className="space-y-2">
            <button
              onClick={() => setShowSupportChat(true)}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-xl
                         flex items-center justify-center gap-2 hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
            >
              <MessageSquare size={18} className="text-purple-400" />
              <span className="text-white font-medium text-sm">{t(language, 'profile.support')}</span>
            </button>
            <button
              onClick={() => setShowAboutModal(true)}
              className="w-full py-3 px-4 bg-white/5 border border-white/10 rounded-xl
                         flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
            >
              <Info size={18} className="text-gray-400" />
              <span className="text-white font-medium text-sm">{t(language, 'profile.about')}</span>
            </button>
          </div>
        </div>
      </div>

      <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />
      <SupportChat isOpen={showSupportChat} onClose={() => setShowSupportChat(false)} userId={user?.id || ''} />
    </div>
  );
}
