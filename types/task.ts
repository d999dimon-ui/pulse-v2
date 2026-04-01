// Types for the Task Management System

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  currency: 'stars' | 'usd';
  category: Category;
  latitude: number;
  longitude: number;
  status: 'active' | 'completed' | 'claimed';
  createdAt: number;
  userId: string;
}

export type Category = 'delivery' | 'cleaning' | 'help' | 'photo';

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
];

export const CATEGORY_COLORS: Record<Category, string> = {
  delivery: 'from-orange-500 to-red-500',
  cleaning: 'from-green-500 to-emerald-500',
  help: 'from-blue-500 to-indigo-500',
  photo: 'from-purple-500 to-pink-500',
};
