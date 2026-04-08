// Referral Program System for TaskHub
// Yandex.Taxi style: Friend completes 5 tasks → Referrer gets VIP promo

import { supabase } from './supabase';
import { Referral } from '@/types/task';

// Generate unique referral code
export const generateReferralCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create referral link for user
export const createReferralLink = async (referrerId: string): Promise<string | null> => {
  try {
    const referralCode = generateReferralCode();
    
    // Check if user already has a referral code
    const { data: existing } = await supabase
      .from('referrals')
      .select('referral_code')
      .eq('referrer_id', referrerId)
      .limit(1);

    if (existing && existing.length > 0) {
      return `https://taskhub.app/ref/${existing[0].referral_code}`;
    }

    // Create new referral code entry
    const { data, error } = await supabase
      .from('referrals')
      .insert([{
        referrer_id: referrerId,
        referral_code: referralCode,
        bonus_status: 'pending',
      }])
      .select()
      .single();

    if (error) throw error;

    return `https://taskhub.app/ref/${referralCode}`;
  } catch (error) {
    console.error('Error creating referral link:', error);
    return null;
  }
};

// Track referred user signup
export const registerReferredUser = async (
  referralCode: string,
  newUserId: string
): Promise<boolean> => {
  try {
    // Find referral record
    const { data: referralData, error: findError } = await supabase
      .from('referrals')
      .select('referrer_id')
      .eq('referral_code', referralCode)
      .single();

    if (findError || !referralData) {
      console.log('Referral code not found');
      return false;
    }

    // Update referral record with new user
    const { error } = await supabase
      .from('referrals')
      .update({
        referral_id: newUserId,
        bonus_status: 'pending',
      })
      .eq('referral_code', referralCode);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error registering referred user:', error);
    return false;
  }
};

// Track task completion for bonus eligibility
export const trackReferralTaskCompletion = async (
  referralId: string
): Promise<void> => {
  try {
    const { data, error: getError } = await supabase
      .from('referrals')
      .select('tasks_completed_by_referral, bonus_status')
      .eq('referral_id', referralId)
      .single();

    if (getError) throw getError;

    const newCount = (data?.tasks_completed_by_referral || 0) + 1;
    let newBonusStatus = data?.bonus_status || 'pending';

    // Activate bonus after 5 tasks completed
    if (newCount >= 5 && data?.bonus_status === 'pending') {
      newBonusStatus = 'active';
    }

    const { error } = await supabase
      .from('referrals')
      .update({
        tasks_completed_by_referral: newCount,
        bonus_status: newBonusStatus,
      })
      .eq('referral_id', referralId);

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking referral task completion:', error);
  }
};

// Activate VIP promo for referrer
export const activateVIPPromo = async (referrerId: string): Promise<boolean> => {
  try {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24); // 24 hour VIP

    const { error } = await supabase
      .from('referrals')
      .update({
        vip_promo_activated: true,
        vip_promo_expires_at: expiryDate.toISOString(),
        bonus_status: 'active',
      })
      .eq('referrer_id', referrerId);

    if (error) throw error;

    // Also update user profile VIP status
    await supabase
      .from('profiles')
      .update({
        vip_status: 'gold',
        vip_expires_at: expiryDate.toISOString(),
      })
      .eq('id', referrerId);

    return true;
  } catch (error) {
    console.error('Error activating VIP promo:', error);
    return false;
  }
};

// Get referral stats for user
export const getReferralStats = async (userId: string): Promise<{
  referralCode: string;
  referralsCount: number;
  activeReferrals: number;
  bonusStatus: string;
  vipActivated: boolean;
  vipExpiresAt?: string;
} | null> => {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId)
      .single();

    if (error) throw error;

    // Count total referrals
    const { data: referralsList, error: listError } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId);

    if (listError) throw listError;

    const activeCount = (referralsList || []).filter(
      r => r.tasks_completed_by_referral >= 5
    ).length;

    return {
      referralCode: data?.referral_code || '',
      referralsCount: referralsList?.length || 0,
      activeReferrals: activeCount,
      bonusStatus: data?.bonus_status || 'pending',
      vipActivated: data?.vip_promo_activated || false,
      vipExpiresAt: data?.vip_promo_expires_at,
    };
  } catch (error) {
    console.error('Error getting referral stats:', error);
    return null;
  }
};

// Get list of user's referrals
export const getReferralsList = async (referrerId: string): Promise<Referral[]> => {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', referrerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting referrals list:', error);
    return [];
  }
};

// Check if referral bonus is expiring soon
export const checkBonusExpiry = (expiryDate?: string): {
  isExpiring: boolean;
  hoursLeft: number;
} => {
  if (!expiryDate) return { isExpiring: false, hoursLeft: 0 };

  const expiry = new Date(expiryDate);
  const now = new Date();
  const diff = expiry.getTime() - now.getTime();
  const hoursLeft = Math.floor(diff / (1000 * 60 * 60));

  return {
    isExpiring: hoursLeft <= 6 && hoursLeft > 0,
    hoursLeft: Math.max(0, hoursLeft),
  };
};

// Calculate referral bonus (discounts, features, etc.)
export const calculateReferralBonus = async (referrerId: string) => {
  try {
    const stats = await getReferralStats(referrerId);

    if (!stats) return null;

    const bonuses = {
      discountPercent: 0,
      extraEarningsPercent: 0,
      freeTasksCount: 0,
      vipFeatures: [] as string[],
    };

    // Bonus tiers
    if (stats.referralsCount >= 1 && stats.referralsCount < 5) {
      bonuses.discountPercent = 5;
      bonuses.extraEarningsPercent = 0;
    } else if (stats.referralsCount >= 5 && stats.referralsCount < 10) {
      bonuses.discountPercent = 10;
      bonuses.extraEarningsPercent = 5;
    } else if (stats.referralsCount >= 10 && stats.referralsCount < 20) {
      bonuses.discountPercent = 15;
      bonuses.extraEarningsPercent = 10;
      bonuses.freeTasksCount = 1;
    } else if (stats.referralsCount >= 20) {
      bonuses.discountPercent = 20;
      bonuses.extraEarningsPercent = 15;
      bonuses.freeTasksCount = 3;
      bonuses.vipFeatures = ['priority_matching', 'instant_payment', 'badge'];
    }

    return bonuses;
  } catch (error) {
    console.error('Error calculating referral bonus:', error);
    return null;
  }
};

// Export referral data
export const exportReferralData = async (userId: string): Promise<string | null> => {
  try {
    const referrals = await getReferralsList(userId);
    const stats = await getReferralStats(userId);

    const csv = [
      ['Referral Code', stats?.referralCode],
      ['Total Referrals', stats?.referralsCount],
      ['Active Referrals (5+ tasks)', stats?.activeReferrals],
      ['Bonus Status', stats?.bonusStatus],
      ['VIP Activated', stats?.vipActivated ? 'Yes' : 'No'],
      [],
      ['User ID', 'Tasks Completed', 'Bonus Activated', 'Date Joined'],
      ...referrals.map(r => [
        r.referral_id || 'N/A',
        r.tasks_completed_by_referral,
        r.vip_promo_activated,
        new Date(r.created_at).toLocaleDateString(),
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    return csv;
  } catch (error) {
    console.error('Error exporting referral data:', error);
    return null;
  }
};
