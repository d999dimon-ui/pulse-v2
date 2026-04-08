"use client";

import { useState } from 'react';
import { User, Award, Copy, LogOut, Settings, BarChart3 } from 'lucide-react';
import { UserProfile as UserProfileType } from '@/types/task';

interface UserProfileProps {
  user: UserProfileType;
  onClose: () => void;
}

export default function UserProfile({ user, onClose }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'referral'>('overview');
  const [referralCopied, setReferralCopied] = useState(false);

  const handleCopyReferral = () => {
    const referralLink = `https://taskhub.app?ref=${user.id}`;
    navigator.clipboard.writeText(referralLink);
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2000);
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? '⭐' : '☆'} />
    ));
  };

  return (
    <div className="flex-1 pb-24 overflow-y-auto bg-dark-bg">
      {/* Header Background */}
      <div className="h-32 bg-gradient-to-b from-neon-cyan/20 to-transparent" />

      {/* Profile Card */}
      <div className="px-4 -mt-20 relative z-10">
        <div className="glass rounded-2xl p-6 mb-6 border border-dark-border">
          <div className="flex items-start gap-4">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.display_name}
                className="w-16 h-16 rounded-full border-2 border-neon-cyan object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-white">{user.display_name}</h2>
                {user.is_verified && <span className="text-neon-cyan text-lg">✓</span>}
              </div>
              <p className="text-gray-400 text-sm">@{user.username}</p>
              <div className="flex items-center gap-1 mt-2">
                {getRatingStars(user.rating)}
                <span className="text-gray-400 text-sm ml-2">{user.rating}/5</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-dark-border">
            <div>
              <p className="text-gray-400 text-xs">Completed</p>
              <p className="text-neon-cyan font-bold text-lg">
                {user.completed_tasks_as_executor + user.completed_tasks_as_customer}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Rating</p>
              <p className="text-neon-gold font-bold text-lg">{user.rating.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Balance</p>
              <p className="text-neon-cyan font-bold text-lg">{user.balance.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-dark-border sticky top-0 bg-dark-bg/80 backdrop-blur -mx-4 px-4 py-2">
          {(['overview', 'reviews', 'referral'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold text-sm transition ${
                activeTab === tab
                  ? 'text-neon-cyan border-b-2 border-neon-cyan'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'overview' ? 'Overview' : tab === 'reviews' ? 'Reviews' : 'Referral'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Balance Card */}
            <div className="glass rounded-2xl p-5 border border-dark-border">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-400 text-sm">Total Balance</p>
                <button className="px-4 py-2 bg-gradient-to-r from-neon-cyan to-neon-purple text-white text-sm rounded-lg hover:shadow-neon-cyan transition">
                  Connect Wallet
                </button>
              </div>
              <div className="text-3xl font-bold text-neon-cyan">{user.balance.toFixed(2)} TON</div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-xl p-4 border border-dark-border">
                <BarChart3 className="w-5 h-5 text-neon-purple mb-2" />
                <p className="text-gray-400 text-xs">As Executor</p>
                <p className="text-white font-bold text-lg">{user.completed_tasks_as_executor}</p>
              </div>
              <div className="glass rounded-xl p-4 border border-dark-border">
                <Award className="w-5 h-5 text-neon-gold mb-2" />
                <p className="text-gray-400 text-xs">As Customer</p>
                <p className="text-white font-bold text-lg">{user.completed_tasks_as_customer}</p>
              </div>
            </div>

            {/* VIP Status */}
            {user.vip_status && user.vip_status !== 'none' && (
              <div className="glass rounded-2xl p-4 border border-neon-purple bg-neon-purple/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">👑</span>
                  <p className="text-neon-purple font-bold">VIP Status: {user.vip_status.toUpperCase()}</p>
                </div>
                <p className="text-gray-400 text-xs">Enjoy premium features and benefits</p>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-3">
            <div className="glass rounded-2xl p-4 border border-dark-border text-center py-8">
              <p className="text-gray-400 text-sm">No reviews yet</p>
            </div>
          </div>
        )}

        {/* Referral Tab */}
        {activeTab === 'referral' && (
          <div className="space-y-4">
            <div className="glass rounded-2xl p-4 border border-dark-border">
              <p className="text-gray-400 text-sm mb-3">Referral Link</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={`https://taskhub.app?ref=${user.id}`}
                  readOnly
                  className="flex-1 glass rounded-xl px-3 py-2 text-white text-sm bg-dark-bg border border-dark-border"
                />
                <button
                  onClick={handleCopyReferral}
                  className="p-2 bg-neon-cyan/20 text-neon-cyan rounded-xl hover:bg-neon-cyan/30 transition"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {referralCopied && <p className="text-neon-cyan text-xs mt-2">✓ Copied!</p>}
            </div>

            <div className="glass rounded-2xl p-4 border border-dark-border">
              <p className="text-gray-400 text-sm mb-2">Referral Stats</p>
              <div className="text-white font-bold text-lg">0 referrals</div>
              <p className="text-gray-400 text-xs mt-1">Invite friends for 5% bonus</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-3 pb-4">
          <button className="flex-1 glass rounded-xl px-4 py-3 text-white font-semibold flex items-center justify-center gap-2 hover:border-neon-cyan transition border border-dark-border">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button className="flex-1 glass rounded-xl px-4 py-3 text-white font-semibold flex items-center justify-center gap-2 hover:border-red-500 transition border border-dark-border text-red-400 hover:text-red-400">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
