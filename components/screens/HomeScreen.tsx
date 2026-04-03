"use client";

import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/utils/translations';
import { supabase } from '@/lib/supabase';

const CATEGORIES = [
  { value: 'it', label: 'cat.it', icon: '💻', color: 'from-blue-500 to-cyan-500' },
  { value: 'delivery', label: 'cat.delivery', icon: '📦', color: 'from-orange-500 to-red-500' },
  { value: 'cleaning', label: 'cat.cleaning', icon: '🧹', color: 'from-green-500 to-emerald-500' },
  { value: 'help', label: 'cat.help', icon: '🤝', color: 'from-purple-500 to-indigo-500' },
  { value: 'photo', label: 'cat.photo', icon: '📸', color: 'from-pink-500 to-rose-500' },
  { value: 'repair', label: 'cat.repair', icon: '🔧', color: 'from-yellow-500 to-orange-500' },
  { value: 'tutoring', label: 'cat.tutoring', icon: '📚', color: 'from-indigo-500 to-purple-500' },
  { value: 'translation', label: 'cat.translation', icon: '📝', color: 'from-teal-500 to-green-500' },
  { value: 'marketing', label: 'cat.marketing', icon: '📊', color: 'from-red-500 to-pink-500' },
];

interface HomeScreenProps {
  onCategorySelect: (category: string) => void;
}

export default function HomeScreen({ onCategorySelect }: HomeScreenProps) {
  const { language } = useLanguage();
  const [stats, setStats] = useState({ open: 0, completed: 0 });

  const fetchStats = useCallback(async () => {
    try {
      const [{ count: openCount }, { count: completedCount }] = await Promise.all([
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      ]);
      setStats({ open: openCount || 0, completed: completedCount || 0 });
    } catch (e) {
      console.error('Stats error:', e);
    }
  }, []);

  return (
    <div className="pb-24 px-4 pt-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">{t(language, 'home.title')}</h1>
        <p className="text-gray-400 text-sm">{t(language, 'home.subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl p-4">
          <div className="text-2xl font-bold text-cyan-400">{stats.open}</div>
          <div className="text-xs text-gray-400 mt-1">{t(language, 'tasks.status.open')}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-4">
          <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
          <div className="text-xs text-gray-400 mt-1">{t(language, 'tasks.status.completed')}</div>
        </div>
      </div>

      {/* Categories Grid */}
      <h2 className="text-lg font-semibold text-white mb-3">{t(language, 'home.categories')}</h2>
      <div className="grid grid-cols-3 gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onCategorySelect(cat.value)}
            className={`bg-gradient-to-br ${cat.color} rounded-2xl p-4 flex flex-col items-center gap-2
                        hover:scale-105 active:scale-95 transition-transform shadow-lg`}
          >
            <span className="text-3xl">{cat.icon}</span>
            <span className="text-white text-xs font-medium text-center leading-tight">
              {t(language, cat.label)}
            </span>
          </button>
        ))}
      </div>

      {/* All Tasks Button */}
      <button
        onClick={() => onCategorySelect('all')}
        className="w-full mt-4 py-4 bg-white/5 border border-white/10 rounded-2xl
                   text-white font-medium hover:bg-white/10 transition-colors"
      >
        {t(language, 'cat.all')} →
      </button>
    </div>
  );
}
