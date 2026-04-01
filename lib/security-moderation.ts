// Security, Fraud Detection & Moderation Helpers

import { supabase } from './supabase';

// Flash task interface
export interface FlashTask {
  id: string;
  title: string;
  description: string;
  reward: number;
  is_flash_task: boolean;
  flash_xp_bonus: number;
  urgent_until: string;
  latitude: number;
  longitude: number;
  category: string;
}

// Feedback idea interface
export interface FeedbackIdea {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: 'feature' | 'bug' | 'improvement' | 'other';
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'implemented';
  upvotes: number;
  downvotes: number;
  admin_response?: string;
  reward_hours: number;
  created_at: string;
  updated_at: string;
}

// Fraud alert interface
export interface FraudAlert {
  id: string;
  user_id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: any;
  is_resolved: boolean;
  created_at: string;
}

// Transaction log interface
export interface TransactionLog {
  id: string;
  task_id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'hold' | 'paid' | 'refund' | 'disputed';
  transaction_type: string;
  created_at: string;
}

// Get flash tasks (urgent orders)
export async function getFlashTasks(limit: number = 20): Promise<FlashTask[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('is_flash_task', true)
      .eq('status', 'open')
      .gt('urgent_until', new Date().toISOString())
      .order('urgent_until', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data as FlashTask[];
  } catch (error) {
    console.error('Get flash tasks error:', error);
    return [];
  }
}

// Create flash task
export async function createFlashTask(
  taskData: any,
  urgentHours: number = 2
): Promise<{ success: boolean; taskId?: string; error?: string }> {
  try {
    const urgentUntil = new Date(Date.now() + urgentHours * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...taskData,
        is_flash_task: true,
        flash_xp_bonus: 20, // +20% XP
        urgent_until: urgentUntil,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Log escrow transaction
    await supabase.rpc('log_escrow_transaction', {
      p_task_id: data.id,
      p_user_id: taskData.user_id,
      p_amount: taskData.reward,
      p_status: 'hold',
      p_type: 'escrow_hold',
      p_escrow_data: { flash_task: true, urgent_hours: urgentHours },
    });
    
    return { success: true, taskId: data.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get user transaction history
export async function getUserTransactions(
  userId: string,
  limit: number = 50
): Promise<TransactionLog[]> {
  try {
    const { data, error } = await supabase
      .from('transaction_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data as TransactionLog[];
  } catch (error) {
    console.error('Get transactions error:', error);
    return [];
  }
}

// Get fraud alerts for user
export async function getUserFraudAlerts(userId: string): Promise<FraudAlert[]> {
  try {
    const { data, error } = await supabase
      .from('fraud_alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    return data as FraudAlert[];
  } catch (error) {
    console.error('Get fraud alerts error:', error);
    return [];
  }
}

// Send chat message (with fraud scanning)
export async function sendChatMessage(
  taskId: string,
  senderId: string,
  receiverId: string,
  message: string
): Promise<{ success: boolean; isFlagged?: boolean; warning?: string }> {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        task_id: taskId,
        sender_id: senderId,
        receiver_id: receiverId,
        message,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Check if message was flagged
    if (data.is_flagged) {
      return {
        success: true,
        isFlagged: true,
        warning: '⚠️ Your attempt to negotiate off-platform has been recorded. This voids your insurance. Repeated violations will result in rating block.',
      };
    }
    
    return { success: true, isFlagged: false };
  } catch (error: any) {
    return { success: false, warning: error.message };
  }
}

// Get feedback ideas
export async function getFeedbackIdeas(
  category?: string,
  status?: string,
  limit: number = 50
): Promise<FeedbackIdea[]> {
  try {
    let query = supabase
      .from('feedback_ideas')
      .select('*')
      .order('upvotes', { ascending: false })
      .limit(limit);
    
    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data as FeedbackIdea[];
  } catch (error) {
    console.error('Get feedback error:', error);
    return [];
  }
}

// Submit feedback idea
export async function submitFeedbackIdea(
  userId: string,
  title: string,
  description: string,
  category: 'feature' | 'bug' | 'improvement' | 'other'
): Promise<{ success: boolean; feedbackId?: string }> {
  try {
    const { data, error } = await supabase
      .from('feedback_ideas')
      .insert({
        user_id: userId,
        title,
        description,
        category,
        status: 'pending',
      })
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, feedbackId: data.id };
  } catch (error) {
    return { success: false };
  }
}

// Vote on feedback
export async function voteOnFeedback(
  feedbackId: string,
  userId: string,
  voteType: 'upvote' | 'downvote'
): Promise<{ success: boolean }> {
  try {
    const { error } = await supabase.rpc('vote_feedback', {
      p_feedback_id: feedbackId,
      p_user_id: userId,
      p_vote_type: voteType,
    });
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// Get user's voted feedback
export async function getUserVotedFeedback(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('feedback_votes')
      .select('feedback_id, vote_type')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    return [];
  }
}

// Get disclaimer message
export function getDisclaimerMessage(lang: 'ru' | 'en'): string {
  const messages = {
    ru: '⚠️ Внимание! Платформа Pulse не несет финансовой ответственности за сделки, совершенные ВНЕ приложения. Договариваясь напрямую, вы теряете защиту Escrow и рискуете деньгами.',
    en: '⚠️ Warning! Pulse platform is not financially responsible for transactions made OUTSIDE the app. Negotiating directly voids your Escrow protection and puts your money at risk.',
  };
  return messages[lang];
}

// Check if task is flash (urgent)
export function isFlashTask(task: any): boolean {
  if (!task.is_flash_task) return false;
  if (!task.urgent_until) return false;
  
  const now = new Date();
  const urgentUntil = new Date(task.urgent_until);
  return now < urgentUntil;
}

// Calculate flash XP bonus
export function calculateFlashXpBonus(baseXp: number, task: any): number {
  if (!isFlashTask(task)) return baseXp;
  
  const bonusPercent = task.flash_xp_bonus || 20;
  return baseXp + (baseXp * bonusPercent / 100);
}

// Get task urgency level
export function getTaskUrgencyLevel(task: any): 'low' | 'medium' | 'high' | 'urgent' {
  if (!task.urgent_until) return 'low';
  
  const now = new Date();
  const urgentUntil = new Date(task.urgent_until);
  const hoursLeft = (urgentUntil.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hoursLeft <= 1) return 'urgent';
  if (hoursLeft <= 2) return 'high';
  if (hoursLeft <= 4) return 'medium';
  return 'low';
}

// Format urgency badge
export function getUrgencyBadge(task: any): { color: string; text: string; emoji: string } {
  const level = getTaskUrgencyLevel(task);
  
  const badges = {
    low: { color: 'gray', text: 'Normal', emoji: '📋' },
    medium: { color: 'yellow', text: 'Soon', emoji: '⏰' },
    high: { color: 'orange', text: 'Urgent', emoji: '🔥' },
    urgent: { color: 'red', text: 'FLASH', emoji: '⚡' },
  };
  
  return badges[level];
}
