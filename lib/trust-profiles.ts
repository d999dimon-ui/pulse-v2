// Trust, Profiles & Analytics Helpers

import { supabase } from './supabase';

// User profile interface
export interface UserProfile {
  user_id: string;
  username?: string;
  phone?: string;
  phone_verified: boolean;
  telegram_username?: string;
  bio?: string;
  experience_years?: number;
  joined_date?: string;
  selected_categories: string[];
  portfolio_images: string[];
  rating: number;
  total_reviews: number;
  is_blocked: boolean;
  badges: string[];
  city?: string;
  country: string;
}

// User analytics interface
export interface UserAnalytics {
  user_id: string;
  total_earned: number;
  total_earned_7d: number;
  total_earned_30d: number;
  tasks_completed: number;
  tasks_completed_7d: number;
  tasks_completed_30d: number;
  avg_rating: number;
  commission_saved: number;
  total_spent: number;
  tasks_created: number;
  success_rate: number;
}

// Get user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data as UserProfile;
  } catch (error) {
    console.error('Get profile error:', error);
    return null;
  }
}

// Get user analytics
export async function getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
  try {
    const { data, error } = await supabase
      .from('user_analytics')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data as UserAnalytics;
  } catch (error) {
    console.error('Get analytics error:', error);
    return null;
  }
}

// Get trust score (0-100)
export async function getTrustScore(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('get_trust_score', {
      p_user_id: userId,
    });
    
    if (error) throw error;
    return Number(data) || 0;
  } catch (error) {
    console.error('Trust score error:', error);
    return 0;
  }
}

// Create review
export async function createReview(
  taskId: string,
  rating: number,
  comment: string
): Promise<{ success: boolean; reviewId?: string; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('create_review', {
      p_task_id: taskId,
      p_rating: rating,
      p_comment: comment,
    });
    
    if (error) throw error;
    return { success: true, reviewId: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get user reviews
export async function getUserReviews(userId: string, limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, reviewer_id, task_id')
      .eq('reviewed_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get reviews error:', error);
    return [];
  }
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId);
    
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Upload portfolio image (returns URL)
export async function uploadPortfolioImage(
  userId: string,
  file: File,
  caption?: string
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('portfolio')
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('portfolio')
      .getPublicUrl(fileName);
    
    // Save to portfolio_images table
    const { error: dbError } = await supabase
      .from('portfolio_images')
      .insert({
        user_id: userId,
        image_url: publicUrl,
        caption,
      });
    
    if (dbError) throw dbError;
    
    return { success: true, imageUrl: publicUrl };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get portfolio images
export async function getPortfolioImages(userId: string) {
  try {
    const { data, error } = await supabase
      .from('portfolio_images')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get portfolio error:', error);
    return [];
  }
}

// Request phone verification (Telegram)
export async function requestPhoneVerification(): Promise<{
  success: boolean;
  phone?: string;
  error?: string;
}> {
  // This would be handled by Telegram WebApp
  const tg = (window as any).Telegram?.WebApp;
  
  if (!tg) {
    return { success: false, error: 'Telegram WebApp not available' };
  }
  
  // Request contact
  tg.sendData(JSON.stringify({ action: 'request_phone' }));
  
  return { success: true };
}

// Verify phone from Telegram data
export async function verifyPhoneFromTelegram(
  userId: string,
  phone: string,
  telegramId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        phone,
        phone_verified: true,
        telegram_id: telegramId,
      })
      .eq('user_id', userId);
    
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get badge icon
export function getBadgeIcon(badge: string): string {
  const badges: Record<string, string> = {
    newbie: '🌱',
    pro: '⭐',
    verified: '✓',
    top_earner: '💰',
    fast_worker: '⚡',
  };
  return badges[badge] || '';
}

// Get badge description
export function getBadgeDescription(badge: string, lang: 'ru' | 'en'): string {
  const descriptions: Record<string, Record<string, string>> = {
    newbie: {
      ru: 'Новичок в Pulse',
      en: 'New to Pulse',
    },
    pro: {
      ru: 'Профессионал (100+ задач, рейтинг 4.8+)',
      en: 'Pro (100+ tasks, 4.8+ rating)',
    },
    verified: {
      ru: 'Подтверждённый пользователь',
      en: 'Verified user',
    },
    top_earner: {
      ru: 'Топ заработков недели',
      en: 'Top earner of the week',
    },
    fast_worker: {
      ru: 'Быстрый исполнитель',
      en: 'Fast worker',
    },
  };
  return descriptions[badge]?.[lang] || badge;
}

// Calculate commission saved
export function calculateCommissionSaved(analytics: UserAnalytics): number {
  const standardCommissionRate = 0.1; // 10%
  return analytics.total_earned * standardCommissionRate - analytics.commission_saved;
}

// Format analytics for charts
export function formatAnalyticsForChart(analytics: UserAnalytics, lang: 'ru' | 'en') {
  return {
    labels: lang === 'ru' ? ['7 дней', '30 дней', 'Всего'] : ['7 days', '30 days', 'Total'],
    earned: [
      analytics.total_earned_7d,
      analytics.total_earned_30d,
      analytics.total_earned,
    ],
    tasks: [
      analytics.tasks_completed_7d,
      analytics.tasks_completed_30d,
      analytics.tasks_completed,
    ],
  };
}
