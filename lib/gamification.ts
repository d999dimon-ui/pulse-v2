// Gamification & Motivation System Helpers

import { supabase } from './supabase';

// User stats interface
export interface UserStats {
  user_id: string;
  task_category: 'fast' | 'deep';
  tasks_completed_7d: number;
  tasks_completed_total: number;
  weekly_goal: number;
  weekly_progress: number;
  xp_points: number;
  level: number;
  streak_days: number;
  rating: number;
}

// Weekly challenge interface
export interface WeeklyChallenge {
  id: string;
  user_id: string;
  challenge_type: 'standard' | 'lucky' | 'ai_negotiated' | 'admin_assigned';
  goal_tasks: number;
  reward_hours: number;
  progress: number;
  status: 'active' | 'completed' | 'failed' | 'expired';
  start_date: string;
  end_date: string;
}

// Get user stats
export async function getUserStats(userId: string): Promise<UserStats | null> {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data as UserStats;
  } catch (error) {
    console.error('Get user stats error:', error);
    return null;
  }
}

// Get active weekly challenge
export async function getActiveChallenge(userId: string): Promise<WeeklyChallenge | null> {
  try {
    const { data, error } = await supabase
      .from('weekly_challenges')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) throw error;
    return data as WeeklyChallenge;
  } catch (error) {
    console.error('Get challenge error:', error);
    return null;
  }
}

// Get progress percentage
export function getProgressPercentage(stats: UserStats): number {
  if (stats.weekly_goal <= 0) return 0;
  return Math.min(100, Math.round((stats.weekly_progress / stats.weekly_goal) * 100));
}

// Get remaining tasks to goal
export function getRemainingTasks(stats: UserStats): number {
  return Math.max(0, stats.weekly_goal - stats.weekly_progress);
}

// Calculate bonus hours based on level and category
export function calculateBonusHours(stats: UserStats): number {
  const baseHours = stats.task_category === 'fast' ? 6 : 12;
  const levelBonus = (stats.level - 1) * 0.5; // +0.5h per level
  return Math.min(24, baseHours + levelBonus); // Cap at 24 hours
}

// AI Motivator: Check if user qualifies for milestone
export async function checkMilestone(userId: string): Promise<{
  qualified: boolean;
  bonusHours?: number;
  message?: string;
}> {
  const stats = await getUserStats(userId);
  if (!stats) return { qualified: false };
  
  const progress = getProgressPercentage(stats);
  
  if (progress >= 100) {
    const bonusHours = calculateBonusHours(stats);
    return {
      qualified: true,
      bonusHours,
      message: `🎉 Weekly goal completed! You've earned ${bonusHours}h commission-free!`,
    };
  }
  
  return { qualified: false };
}

// AI Negotiation: Propose custom challenge
export async function proposeAiChallenge(
  userId: string,
  increasePercent: number = 20
): Promise<{ success: boolean; challengeId?: string; message?: string }> {
  try {
    const { data, error } = await supabase.rpc('ai_negotiate_challenge', {
      p_user_id: userId,
      p_increase_percent: increasePercent,
    });
    
    if (error) throw error;
    
    return {
      success: true,
      challengeId: data,
      message: `Challenge accepted! Complete ${Math.round(increasePercent)}% more tasks for bonus rewards!`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}

// Admin: Assign manual challenge
export async function adminAssignChallenge(
  userId: string,
  goalTasks: number,
  rewardHours: number,
  adminId: string,
  notes?: string
): Promise<{ success: boolean; challengeId?: string }> {
  try {
    const { data, error } = await supabase.rpc('admin_assign_challenge', {
      p_user_id: userId,
      p_goal_tasks: goalTasks,
      p_reward_hours: rewardHours,
      p_admin_id: adminId,
      p_notes: notes,
    });
    
    if (error) throw error;
    
    return { success: true, challengeId: data };
  } catch (error) {
    console.error('Admin assign error:', error);
    return { success: false };
  }
}

// Activate Lucky Chance (global)
export async function activateLuckyChance(
  discountPercent: number = 30,
  bonusHours: number = 6,
  maxWinners: number = 100,
  daysActive: number = 7
): Promise<{ success: boolean; winners?: number; message?: string }> {
  try {
    const { error } = await supabase.rpc('activate_lucky_chance', {
      p_discount_percent: discountPercent,
      p_bonus_hours: bonusHours,
      p_max_winners: maxWinners,
      p_days_active: daysActive,
    });

    if (error) throw error;

    // Run lucky chance
    const { data: winners, error: runError } = await supabase.rpc('run_lucky_chance');

    if (runError) throw runError;

    return { success: true, winners };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// Get gamification log for user
export async function getUserGamificationLog(userId: string, limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('gamification_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get log error:', error);
    return [];
  }
}

// Format progress message
export function formatProgressMessage(stats: UserStats, lang: 'ru' | 'en'): string {
  const remaining = getRemainingTasks(stats);
  const percentage = getProgressPercentage(stats);
  
  if (lang === 'ru') {
    if (remaining === 0) {
      return '🎉 Цель достигнута! Бонус активирован!';
    }
    return `До бонуса осталось ${remaining} заказов (${percentage}%)`;
  } else {
    if (remaining === 0) {
      return '🎉 Goal completed! Bonus activated!';
    }
    return `${remaining} tasks to bonus (${percentage}%)`;
  }
}

// Telegram notification message
export function generateTelegramNotification(
  stats: UserStats,
  type: 'goal_assigned' | 'goal_completed' | 'lucky_chance' | 'admin_assigned',
  lang: 'ru' | 'en'
): string {
  const messages = {
    ru: {
      goal_assigned: `🎯 Новый вызов! Выполни ${stats.weekly_goal} заказов за 7 дней и получи ${calculateBonusHours(stats)}ч без комиссии!`,
      goal_completed: `🏆 Победа! Ты выполнил недельную цель! Бонус ${calculateBonusHours(stats)}ч активирован!`,
      lucky_chance: `🍀 Lucky Chance! Тебе повезло! Сниженная цель: ${stats.weekly_goal} заказов. Бонус: ${calculateBonusHours(stats)}ч!`,
      admin_assigned: `⭐ Спец-предложение! Администратор выбрал тебя! Выполни ${stats.weekly_goal} заказов и получи ${calculateBonusHours(stats)}ч без комиссии!`,
    },
    en: {
      goal_assigned: `🎯 New challenge! Complete ${stats.weekly_goal} tasks in 7 days and get ${calculateBonusHours(stats)}h commission-free!`,
      goal_completed: `🏆 Victory! You completed the weekly goal! Bonus ${calculateBonusHours(stats)}h activated!`,
      lucky_chance: `🍀 Lucky Chance! You're lucky! Reduced goal: ${stats.weekly_goal} tasks. Bonus: ${calculateBonusHours(stats)}h!`,
      admin_assigned: `⭐ Special offer! Admin chose you! Complete ${stats.weekly_goal} tasks and get ${calculateBonusHours(stats)}h commission-free!`,
    },
  };
  
  return messages[lang][type];
}
