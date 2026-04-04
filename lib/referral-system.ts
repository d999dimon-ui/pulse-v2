// Referral System - 5 completed orders = 12 no-commission promo codes
import { supabase } from './supabase';

export interface ReferralData {
  referrerId: string;
  refereeId: string;
  refereeCompletedTasks: number;
  rewardClaimed: boolean;
  promoCodesIssued: number;
}

// Generate referral link
export function getReferralLink(userId: string): string {
  if (typeof window === 'undefined') return '';
  const tg = (window as any).Telegram?.WebApp;
  const botUsername = tg?.initDataUnsafe?.user?.username || tg?.initDataUnsafe?.user?.first_name || 'pulse_bot';
  return `https://t.me/${botUsername}?start=ref_${userId}`;
}

// Check referee progress towards reward
export async function checkReferralProgress(referrerId: string): Promise<{
  referees: Array<{ id: string; completed: number; progress: number }>;
  totalProgress: number;
  rewardsEarned: number;
}> {
  try {
    const { data } = await supabase
      .from('referrals')
      .select(`
        referee_id,
        referee_completed_tasks
      `)
      .eq('referrer_id', referrerId);

    if (!data) return { referees: [], totalProgress: 0, rewardsEarned: 0 };

    const referees = data.map(r => ({
      id: r.referee_id,
      completed: r.referee_completed_tasks || 0,
      progress: Math.min((r.referee_completed_tasks || 0) / 5, 1),
    }));

    const totalProgress = referees.reduce((sum, r) => sum + r.progress, 0);
    const rewardsEarned = Math.floor(totalProgress) * 12; // 12 promo codes per full referral

    return { referees, totalProgress, rewardsEarned };
  } catch {
    return { referees: [], totalProgress: 0, rewardsEarned: 0 };
  }
}

// Issue promo codes when referral completes 5 tasks
export async function issueReferralReward(referrerId: string, refereeId: string): Promise<{
  success: boolean;
  promoCodes: string[];
}> {
  try {
    // Check if reward already issued
    const { data: existing } = await supabase
      .from('referrals')
      .select('reward_claimed')
      .eq('referrer_id', referrerId)
      .eq('referee_id', refereeId)
      .single();

    if (existing?.reward_claimed) {
      return { success: false, promoCodes: [] };
    }

    // Generate 12 no-commission promo codes
    const promoCodes: string[] = [];
    for (let i = 0; i < 12; i++) {
      const code = `REF-${referrerId.slice(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${i}`;
      promoCodes.push(code);

      await supabase.from('promo_codes').insert({
        id: code,
        type: 'no_commission',
        created_by: referrerId,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        is_used: false,
        created_at: new Date().toISOString(),
      });
    }

    // Mark reward as claimed
    await supabase
      .from('referrals')
      .update({ reward_claimed: true, promo_codes_issued: 12 })
      .eq('referrer_id', referrerId)
      .eq('referee_id', refereeId);

    return { success: true, promoCodes };
  } catch (e) {
    console.error('Referral reward error:', e);
    return { success: false, promoCodes: [] };
  }
}

// Use promo code
export async function usePromoCode(userId: string, code: string): Promise<{
  success: boolean;
  type: string;
  message: string;
}> {
  try {
    const { data: promo, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('id', code)
      .eq('is_used', false)
      .single();

    if (error || !promo) {
      return { success: false, type: '', message: 'Промокод не найден или уже использован' };
    }

    // Check expiry
    if (new Date(promo.valid_until) < new Date()) {
      return { success: false, type: '', message: 'Промокод истёк' };
    }

    // Mark as used
    await supabase
      .from('promo_codes')
      .update({ is_used: true, used_by: userId, used_at: new Date().toISOString() })
      .eq('id', code);

    return {
      success: true,
      type: promo.type,
      message: promo.type === 'no_commission'
        ? 'Промокод активирован: 0% комиссии на 7 дней'
        : `Промокод активирован: ${promo.type}`,
    };
  } catch {
    return { success: false, type: '', message: 'Ошибка активации' };
  }
}
