// Referral & Bonus System Helpers

import { supabase } from './supabase';

// Generate referral link
export function generateReferralLink(userId: string): string {
  if (typeof window === 'undefined') return '';
  const baseUrl = window.location.origin;
  return `${baseUrl}?ref=${userId}`;
}

// Get referral code from URL
export function getRefCodeFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('ref');
}

// Track referral signup
export async function trackReferral(referrerId: string, referredId: string) {
  try {
    const { error } = await supabase.rpc('track_referral', {
      p_referrer_id: referrerId,
      p_referred_id: referredId,
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Referral tracking error:', error);
    return false;
  }
}

// Check if user has active bonus
export async function checkActiveBonus(userId: string): Promise<{
  hasBonus: boolean;
  remainingMinutes: number;
}> {
  try {
    const { data, error } = await supabase.rpc('get_bonus_remaining_minutes', {
      p_user_id: userId,
    });
    
    if (error) throw error;
    
    return {
      hasBonus: data > 0,
      remainingMinutes: Number(data) || 0,
    };
  } catch (error) {
    console.error('Bonus check error:', error);
    return { hasBonus: false, remainingMinutes: 0 };
  }
}

// Activate bonus
export async function activateBonus(
  userId: string,
  durationHours: number,
  type: 'referral' | 'promo' | 'compensation',
  source?: string,
  reason?: string
) {
  try {
    const { data, error } = await supabase.rpc('activate_bonus', {
      p_user_id: userId,
      p_duration_hours: durationHours,
      p_bonus_type: type,
      p_source: source,
      p_reason: reason,
      p_issued_by: 'user',
    });
    
    if (error) throw error;
    return { success: true, bonusId: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Use promo code
export async function usePromoCode(userId: string, code: string) {
  try {
    const { data, error } = await supabase.rpc('use_promo_code', {
      p_code: code.toUpperCase(),
      p_user_id: userId,
    });
    
    if (error) throw error;
    
    const result = data?.[0];
    return {
      success: result?.success,
      message: result?.message,
      bonusId: result?.bonus_id,
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// Get user's referrals
export async function getUserReferrals(userId: string) {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId)
      .order('referred_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Referrals fetch error:', error);
    return [];
  }
}

// Get user's active bonuses
export async function getUserBonuses(userId: string) {
  try {
    const { data, error } = await supabase
      .from('active_bonuses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Bonuses fetch error:', error);
    return [];
  }
}

// Calculate commission with bonus
export function calculateCommission(
  reward: number,
  hasActiveBonus: boolean,
  remainingMinutes?: number
): {
  commission: number;
  executorAmount: number;
  isCommissionFree: boolean;
} {
  const commissionRate = 0.1; // 10%
  
  if (hasActiveBonus && remainingMinutes && remainingMinutes > 0) {
    return {
      commission: 0,
      executorAmount: reward,
      isCommissionFree: true,
    };
  }
  
  const commission = reward * commissionRate;
  return {
    commission,
    executorAmount: reward - commission,
    isCommissionFree: false,
  };
}

// Format remaining time
export function formatBonusTime(minutes: number): string {
  if (minutes <= 0) return 'No active bonus';
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}m`;
  }
}

// AI Support: Check user bonuses (read-only)
export async function checkUserBonusesForSupport(userId: string) {
  try {
    const [bonuses, referrals] = await Promise.all([
      getUserBonuses(userId),
      getUserReferrals(userId),
    ]);
    
    const activeBonus = bonuses.find(b => b.is_active && new Date(b.expires_at) > new Date());
    
    return {
      hasActiveBonus: !!activeBonus,
      remainingMinutes: activeBonus?.remaining_minutes || 0,
      totalReferrals: referrals.length,
      pendingBonus: referrals.filter(r => !r.bonus_awarded).length,
    };
  } catch (error) {
    console.error('Support check error:', error);
    return null;
  }
}
