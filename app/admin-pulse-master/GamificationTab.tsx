"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trophy, Target, Gift, Users, Activity, Plus, X, Send } from 'lucide-react';

export default function GamificationTab() {
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [customGoal, setCustomGoal] = useState({
    goalTasks: 50,
    rewardHours: 6,
    notes: '',
  });
  const [luckyChance, setLuckyChance] = useState({
    isActive: false,
    discountPercent: 30,
    bonusHours: 6,
    maxWinners: 100,
  });
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadActiveUsers();
    loadLuckyChance();
  }, []);

  const loadActiveUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .order('tasks_completed_7d', { ascending: false })
      .limit(50);
    
    if (error) console.error('Error loading users:', error);
    else setActiveUsers(data || []);
    
    setIsLoading(false);
  };

  const loadLuckyChance = async () => {
    const { data } = await supabase
      .from('lucky_chance_config')
      .select('*')
      .single();
    
    if (data) {
      setLuckyChance({
        isActive: data.is_active,
        discountPercent: data.discount_percent || 30,
        bonusHours: data.bonus_hours || 6,
        maxWinners: data.max_winners || 100,
      });
    }
  };

  const handleAdminAssign = async () => {
    if (!selectedUser) {
      alert('Select a user first');
      return;
    }

    try {
      const { error } = await supabase.rpc('admin_assign_challenge', {
        p_user_id: selectedUser,
        p_goal_tasks: customGoal.goalTasks,
        p_reward_hours: customGoal.rewardHours,
        p_admin_id: 'admin',
        p_notes: customGoal.notes,
      });

      if (error) throw error;

      alert(`Challenge assigned to user ${selectedUser.slice(0, 8)}...`);
      setNotification(`✅ Admin assigned challenge: ${customGoal.goalTasks} tasks → ${customGoal.rewardHours}h bonus`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert('Failed: ' + err.message);
    }
  };

  const handleToggleLuckyChance = async () => {
    try {
      if (luckyChance.isActive) {
        // Deactivate
        await supabase
          .from('lucky_chance_config')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('is_active', true);
        
        setLuckyChance({ ...luckyChance, isActive: false });
        alert('Lucky Chance deactivated');
      } else {
        // Activate
        const { error } = await supabase
          .from('lucky_chance_config')
          .insert({
            is_active: true,
            discount_percent: luckyChance.discountPercent,
            bonus_hours: luckyChance.bonusHours,
            max_winners: luckyChance.maxWinners,
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          });

        if (error) throw error;

        // Run lucky chance
        const { data: winners } = await supabase.rpc('run_lucky_chance');
        
        setLuckyChance({ ...luckyChance, isActive: true });
        alert(`Lucky Chance activated! ${winners || 0} winners selected!`);
        setNotification(`🍀 Lucky Chance activated: ${winners || 0} users received reduced goals!`);
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (err: any) {
      alert('Failed: ' + err.message);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'from-green-500 to-emerald-500';
    if (progress >= 75) return 'from-blue-500 to-cyan-500';
    if (progress >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gamification Control Center</h2>
        {notification && (
          <div className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-xl text-green-400 text-sm animate-pulse">
            {notification}
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Trophy size={24} className="text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {activeUsers.filter(u => u.weekly_progress >= u.weekly_goal).length}
          </div>
          <div className="text-sm text-gray-400">Goals Completed (Week)</div>
        </div>

        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Target size={24} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {activeUsers.reduce((sum, u) => sum + u.tasks_completed_7d, 0)}
          </div>
          <div className="text-sm text-gray-400">Tasks Completed (7d)</div>
        </div>

        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Users size={24} className="text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {activeUsers.length}
          </div>
          <div className="text-sm text-gray-400">Active Users</div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Activity size={24} className="text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {activeUsers.reduce((sum, u) => sum + u.xp_points, 0).toFixed(0)}
          </div>
          <div className="text-sm text-gray-400">Total XP Earned</div>
        </div>
      </div>

      {/* Lucky Chance Control */}
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Gift size={32} className="text-yellow-400" />
            <div>
              <h3 className="text-xl font-bold text-white">Lucky Chance (Global Event)</h3>
              <p className="text-sm text-gray-400">
                Randomly select users for reduced goals ({luckyChance.discountPercent}% easier)
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleLuckyChance}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              luckyChance.isActive
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
            }`}
          >
            {luckyChance.isActive ? 'Deactivate' : 'Activate Lucky Chance'}
          </button>
        </div>

        {luckyChance.isActive && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-black/50 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">Discount</div>
              <div className="text-2xl font-bold text-yellow-400">{luckyChance.discountPercent}%</div>
            </div>
            <div className="bg-black/50 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">Bonus Hours</div>
              <div className="text-2xl font-bold text-green-400">{luckyChance.bonusHours}h</div>
            </div>
            <div className="bg-black/50 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">Max Winners</div>
              <div className="text-2xl font-bold text-purple-400">{luckyChance.maxWinners}</div>
            </div>
          </div>
        )}
      </div>

      {/* Manual Assignment */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Target size={24} className="text-purple-400" />
          Manual Challenge Assignment
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Select User
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                         text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="">Select a user...</option>
              {activeUsers.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {user.user_id.slice(0, 12)}... - {user.tasks_completed_7d} tasks (Lvl {user.level})
                </option>
              ))}
            </select>
          </div>

          {/* Goal Settings */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Goal (Tasks)
              </label>
              <input
                type="number"
                value={customGoal.goalTasks}
                onChange={(e) => setCustomGoal({ ...customGoal, goalTasks: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl
                           text-white focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Reward (Hours)
              </label>
              <input
                type="number"
                value={customGoal.rewardHours}
                onChange={(e) => setCustomGoal({ ...customGoal, rewardHours: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl
                           text-white focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                value={customGoal.notes}
                onChange={(e) => setCustomGoal({ ...customGoal, notes: e.target.value })}
                placeholder="Special instructions..."
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl
                           text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleAdminAssign}
          disabled={!selectedUser}
          className="mt-4 w-full md:w-auto px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500
                     text-white font-bold rounded-xl
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          Assign Challenge
        </button>
      </div>

      {/* Active Users Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-xl font-bold">Top Active Users (This Week)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Category</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Level</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Tasks (7d)</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Progress</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {activeUsers.map((user) => {
                const progress = Math.round((user.weekly_progress / user.weekly_goal) * 100) || 0;
                return (
                  <tr key={user.user_id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">
                        {user.user_id.slice(0, 12)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        user.task_category === 'fast'
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {user.task_category === 'fast' ? '⚡ Fast' : '🎯 Deep'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-yellow-400 font-bold">Lvl {user.level}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white">{user.tasks_completed_7d}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${getProgressColor(progress)}`}
                            style={{ width: `${Math.min(100, progress)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-10">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-purple-400">{user.xp_points.toFixed(0)} XP</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
