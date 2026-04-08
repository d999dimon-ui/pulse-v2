// TaskHub v2.0 - Complete Type Definitions
// Multi-service marketplace with Web3, Ratings, and Referral system

// ============================================
// USER TYPES
// ============================================
export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  balance: number;
  wallet_address?: string;
  rating: number;
  total_reviews: number;
  completed_tasks_as_executor: number;
  completed_tasks_as_customer: number;
  is_verified: boolean;
  is_banned: boolean;
  vip_status: 'none' | 'silver' | 'gold' | 'platinum';
  vip_expires_at?: string;
  language: string;
  country?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// TASK TYPES
// ============================================
export type TaskCategory = 
  | 'it' 
  | 'couriers' 
  | 'household_services' 
  | 'marketing' 
  | 'delivery' 
  | 'cleaning' 
  | 'photo' 
  | 'translation' 
  | 'tutoring' 
  | 'repair';

export type TaskStatus = 'open' | 'claimed' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
export type TaskPriority = 'normal' | 'urgent' | 'asap';
export type Currency = 'stars' | 'usdt' | 'ton';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  reward: number;
  currency: Currency;
  street_address?: string;
  latitude: number;
  longitude: number;
  status: TaskStatus;
  priority: TaskPriority;
  customer_id: string;
  executor_id?: string;
  created_at: string;
  deadline?: string;
  started_at?: string;
  completed_at?: string;
  is_hidden: boolean;
  reports_count: number;
  visibility: boolean;
  escrow_contract_id?: string;
  payment_tx_hash?: string;
  flash_xp_bonus?: number;
}

// ============================================
// TASK BIDDING TYPES
// ============================================
export type TaskCandidateStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface TaskCandidate {
  id: string;
  task_id: string;
  executor_id: string;
  message?: string;
  proposed_price?: number;
  status: TaskCandidateStatus;
  created_at: string;
  responded_at?: string;
  executor?: UserProfile; // denormalized for UI
}

// ============================================
// REVIEW TYPES
// ============================================
export interface Review {
  id: string;
  task_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number; // 1-5
  title?: string;
  comment?: string;
  review_type: 'for_executor' | 'for_customer';
  is_verified: boolean;
  is_hidden: boolean;
  created_at: string;
  reviewer?: UserProfile; // denormalized
}

// ============================================
// LOCATION TRACKING
// ============================================
export interface Location {
  id: string;
  task_id?: string;
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

// ============================================
// PAYMENT TYPES
// ============================================
export type PaymentMethod = 'web3_wallet' | 'credit_card' | 'internal_balance';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  task_id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  currency: Currency;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  tx_hash?: string;
  contract_address?: string;
  block_number?: number;
  created_at: string;
  completed_at?: string;
}

// ============================================
// REFERRAL TYPES
// ============================================
export interface Referral {
  id: string;
  referrer_id: string;
  referral_id: string;
  referral_code: string;
  tasks_completed_by_referral: number;
  bonus_status: 'pending' | 'active' | 'claimed' | 'expired';
  vip_promo_activated: boolean;
  vip_promo_expires_at?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// CHAT MESSAGE TYPES
// ============================================
export interface ChatMessage {
  id: string;
  task_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  attachments?: any[];
  created_at: string;
  sender?: UserProfile; // denormalized
}

// ============================================
// CATEGORY CONFIGURATION
// ============================================
export const CATEGORIES: { value: TaskCategory; label: string; icon: string; color: string }[] = [
  { value: 'it', label: 'IT Services', icon: '💻', color: 'from-cyan-500 to-blue-500' },
  { value: 'couriers', label: 'Couriers', icon: '🚴', color: 'from-orange-500 to-red-500' },
  { value: 'household_services', label: 'Household', icon: '🏠', color: 'from-green-500 to-emerald-500' },
  { value: 'marketing', label: 'Marketing', icon: '📊', color: 'from-pink-500 to-red-500' },
  { value: 'delivery', label: 'Delivery', icon: '📦', color: 'from-amber-500 to-orange-500' },
  { value: 'cleaning', label: 'Cleaning', icon: '🧹', color: 'from-green-500 to-teal-500' },
  { value: 'photo', label: 'Photo', icon: '📸', color: 'from-purple-500 to-pink-500' },
  { value: 'translation', label: 'Translation', icon: '📝', color: 'from-blue-500 to-indigo-500' },
  { value: 'tutoring', label: 'Tutoring', icon: '📚', color: 'from-indigo-500 to-purple-500' },
  { value: 'repair', label: 'Repair', icon: '🔧', color: 'from-yellow-500 to-orange-500' },
];

export const getCategoryColor = (category: TaskCategory): string => {
  return CATEGORIES.find(c => c.value === category)?.color || 'from-gray-500 to-gray-600';
};

export const getCategoryIcon = (category: TaskCategory): string => {
  return CATEGORIES.find(c => c.value === category)?.icon || '📌';
};
