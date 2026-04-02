// Unified Task Type for Pulse v2
// Matches Supabase schema exactly

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  currency: 'stars' | 'usd';
  category: string;
  latitude: number;
  longitude: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled' | 'active' | 'claimed';
  created_at: number; // Timestamp from Supabase
  user_id: string;
  executor_id?: string;
  exact_address?: string;
  is_flash_task?: boolean;
  flash_xp_bonus?: number;
  urgent_until?: string;
}

export type Category = 'delivery' | 'cleaning' | 'help' | 'photo' | 'it' | 'repair' | 'translation' | 'marketing' | 'tutoring';

export interface User {
  id: string;
  username: string;
  balance: number;
  completedTasks: number;
}

export const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: 'delivery', label: 'Delivery', icon: '📦' },
  { value: 'cleaning', label: 'Cleaning', icon: '🧹' },
  { value: 'help', label: 'Help', icon: '🤝' },
  { value: 'photo', label: 'Photo', icon: '📸' },
  { value: 'it', label: 'IT Services', icon: '💻' },
  { value: 'repair', label: 'Repair', icon: '🔧' },
  { value: 'translation', label: 'Translation', icon: '📝' },
  { value: 'marketing', label: 'Marketing', icon: '📊' },
  { value: 'tutoring', label: 'Tutoring', icon: '📚' },
];

export const CATEGORY_COLORS: Record<Category, string> = {
  delivery: 'from-orange-500 to-red-500',
  cleaning: 'from-green-500 to-emerald-500',
  help: 'from-blue-500 to-indigo-500',
  photo: 'from-purple-500 to-pink-500',
  it: 'from-cyan-500 to-blue-500',
  repair: 'from-yellow-500 to-orange-500',
  translation: 'from-green-500 to-teal-500',
  marketing: 'from-pink-500 to-red-500',
  tutoring: 'from-indigo-500 to-purple-500',
};
