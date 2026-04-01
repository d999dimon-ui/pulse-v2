"use client";

import { useState, useEffect } from 'react';
import { User, Task } from '@/types/task';
import { X, Wallet, LogOut, List, Star, TrendingUp } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'my-tasks'>('overview');

  const myTasks = tasks.filter(task => task.userId === user?.id);
  const completedTasks = myTasks.filter(task => task.status === 'completed');
  const activeTasks = myTasks.filter(task => task.status === 'active');

  if (!isOpen || !user) return null;

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
            >
              <X size={20} className="text-white" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 
                              flex items-center justify-center text-2xl font-bold text-white">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">@{user.username}</h2>
                <p className="text-sm text-gray-400">Tasker since {new Date(user.completedTasks > 0 ? Date.now() - 30*24*60*60*1000 : Date.now()).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Balance Card */}
          <div className="p-6">
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 
                            rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Current Balance</span>
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
                💸 Withdraw Funds
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{user.completedTasks}</div>
                <div className="text-xs text-gray-400 mt-1">Completed</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{activeTasks.length}</div>
                <div className="text-xs text-gray-400 mt-1">Active</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-cyan-400">{(user.completedTasks * 0.95).toFixed(0)}</div>
                <div className="text-xs text-gray-400 mt-1">Rating</div>
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
                Overview
              </button>
              <button
                onClick={() => setActiveTab('my-tasks')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  activeTab === 'my-tasks'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-white/5 text-gray-400 border border-white/10'
                }`}
              >
                My Tasks ({myTasks.length})
              </button>
            </div>

            {/* Tab Content */}
            <div className="max-h-48 overflow-y-auto space-y-2">
              {activeTab === 'overview' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <TrendingUp size={18} className="text-green-400" />
                      <span className="text-sm text-gray-300">Total Earned</span>
                    </div>
                    <span className="text-white font-semibold">+{user.balance} ⭐</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Star size={18} className="text-yellow-400" />
                      <span className="text-sm text-gray-300">Success Rate</span>
                    </div>
                    <span className="text-white font-semibold">95%</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {myTasks.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No tasks yet</p>
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
                            {task.status}
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
      </div>
    </>
  );
}
