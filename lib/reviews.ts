// Rating & Review System for TaskHub
// 5-star system with detailed reviews

import { supabase } from './supabase';
import { Review } from '@/types/task';

// Create review after task completion
export const createReview = async (
  taskId: string,
  reviewerId: string,
  revieweeId: string,
  rating: number, // 1-5
  title: string,
  comment: string,
  reviewType: 'for_executor' | 'for_customer'
): Promise<Review | null> => {
  try {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        task_id: taskId,
        reviewer_id: reviewerId,
        reviewee_id: revieweeId,
        rating: Math.round(rating),
        title: title.trim(),
        comment: comment.trim(),
        review_type: reviewType,
        is_verified: true,
        is_hidden: false,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating review:', error);
    return null;
  }
};

// Get reviews for user
export const getUserReviews = async (
  userId: string,
  limit: number = 10
): Promise<Review[]> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('reviewee_id', userId)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

// Calculate user rating
export const calculateUserRating = async (userId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', userId)
      .eq('is_hidden', false);

    if (error) throw error;
    
    if (!data || data.length === 0) return 5;
    
    const sum = data.reduce((acc, rev) => acc + rev.rating, 0);
    return sum / data.length;
  } catch (error) {
    console.error('Error calculating user rating:', error);
    return 5;
  }
};

// Get rating distribution
export const getRatingDistribution = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', userId)
      .eq('is_hidden', false);

    if (error) throw error;

    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
      total: data?.length || 0,
    };

    data?.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });

    return distribution;
  } catch (error) {
    console.error('Error getting rating distribution:', error);
    return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, total: 0 };
  }
};

// Check if user can review (completed the task)
export const canLeaveReview = async (
  taskId: string,
  userId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('status, customer_id, executor_id')
      .eq('id', taskId)
      .single();

    if (error) throw error;

    if (!data) return false;

    // Can review if task is completed and user is either customer or executor
    return (
      data.status === 'completed' &&
      (data.customer_id === userId || data.executor_id === userId)
    );
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    return false;
  }
};

// Get review analytics
export const getReviewAnalytics = async (userId: string) => {
  try {
    const reviews = await getUserReviews(userId, 100);
    const distribution = await getRatingDistribution(userId);
    const avgRating = await calculateUserRating(userId);

    const reviewTypes = {
      executor: reviews.filter(r => r.review_type === 'for_executor').length,
      customer: reviews.filter(r => r.review_type === 'for_customer').length,
    };

    return {
      avgRating: parseFloat(avgRating.toFixed(2)),
      totalReviews: reviews.length,
      distribution,
      reviewTypes,
      recentReviews: reviews.slice(0, 5),
    };
  } catch (error) {
    console.error('Error getting review analytics:', error);
    return null;
  }
};

// Report review as inappropriate
export const reportReview = async (reviewId: string, reason: string): Promise<boolean> => {
  try {
    // Create a report entry or flag the review
    // Implementation depends on admin moderation system
    console.log(`Review ${reviewId} reported for: ${reason}`);
    return true;
  } catch (error) {
    console.error('Error reporting review:', error);
    return false;
  }
};

// Get helpful percentage
export const getReviewHelpfulness = async (reviewId: string) => {
  // This would require a helpful_votes table
  // Implementation: count votes and calculate percentage
  return { helpful: 0, total: 0, percentage: 0 };
};

// Moderate reviews (admin only)
export const moderateReview = async (
  reviewId: string,
  isHidden: boolean
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('reviews')
      .update({ is_hidden: isHidden })
      .eq('id', reviewId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error moderating review:', error);
    return false;
  }
};

// Get review badges
export const getReviewBadges = (avgRating: number, totalReviews: number) => {
  const badges = [];

  if (totalReviews >= 10 && avgRating >= 4.5) {
    badges.push('⭐ Top Rated');
  }
  if (totalReviews >= 50 && avgRating >= 4.8) {
    badges.push('🏆 Elite');
  }
  if (totalReviews >= 100) {
    badges.push('👑 Trusted Expert');
  }
  if (avgRating === 5) {
    badges.push('✨ Perfect Rating');
  }

  return badges;
};
