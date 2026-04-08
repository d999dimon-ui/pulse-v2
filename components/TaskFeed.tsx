"use client";

import { useState, useMemo, useCallback } from 'react';
import { MapPin, Star, AlertCircle, Zap, Search } from 'lucide-react';
import { Task, CATEGORIES } from '@/types/task';

const i18n = {
  ru: {
    title: 'Доступные заказы',
    search: 'Поиск заказов...',
    all: 'Все',
    distance: '📍 Расстояние',
    reward: '💰 Награда',
    newest: '⏰ Новые',
    noTasks: 'Заказов не найдено',
    noTasksHint: 'Попробуйте изменить фильтры',
    claim: 'Взять заказ',
    claiming: 'Беру...',
    km: 'км',
    task: 'Заказ',
    urgent: 'Срочно',
    asap: 'ASAP',
  },
  en: {
    title: 'Available Tasks',
    search: 'Search tasks...',
    all: 'All',
    distance: '📍 Distance',
    reward: '💰 Reward',
    newest: '⏰ Newest',
    noTasks: 'No tasks found',
    noTasksHint: 'Try adjusting your filters',
    claim: 'Claim Task',
    claiming: 'Claiming...',
    km: 'km',
    task: 'Task',
    urgent: 'Urgent',
    asap: 'ASAP',
  }
};

interface TaskFeedProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  userLatitude: number;
  userLongitude: number;
  onClaimTask: (taskId: string) => Promise<void>;
  language?: string;
}

export default function TaskFeed({
  isOpen,
  onClose,
  tasks,
  userLatitude,
  userLongitude,
  onClaimTask,
  language = 'ru',
}: TaskFeedProps) {
  const t = i18n[language === 'ru' ? 'ru' : 'en'];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'distance' | 'reward' | 'newest'>('distance');
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const catLabels: Record<string, { ru: string; en: string }> = {
    it: { ru: 'IT Услуги', en: 'IT Services' },
    couriers: { ru: 'Курьеры', en: 'Couriers' },
    household_services: { ru: 'Бытовые услуги', en: 'Household' },
    marketing: { ru: 'Маркетинг', en: 'Marketing' },
    delivery: { ru: 'Доставка', en: 'Delivery' },
    cleaning: { ru: 'Уборка', en: 'Cleaning' },
    photo: { ru: 'Фото', en: 'Photo' },
    translation: { ru: 'Переводы', en: 'Translation' },
    tutoring: { ru: 'Репетиторство', en: 'Tutoring' },
    repair: { ru: 'Ремонт', en: 'Repair' },
  };

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, []);

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesCategory = !selectedCategory || task.category === selectedCategory;
      return task.status === 'open' && matchesSearch && matchesCategory;
    });
    return filtered.sort((a, b) => {
      if (sortBy === 'distance') {
        return calculateDistance(userLatitude, userLongitude, a.latitude, a.longitude) - calculateDistance(userLatitude, userLongitude, b.latitude, b.longitude);
      } else if (sortBy === 'reward') {
        return b.reward - a.reward;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [tasks, searchQuery, selectedCategory, sortBy, userLatitude, userLongitude, calculateDistance]);

  const handleClaim = async (taskId: string) => {
    setClaimingId(taskId);
    try { await onClaimTask(taskId); } catch (e) { console.error(e); }
    finally { setClaimingId(null); }
  };

  if (!isOpen) return null;

  return (
    <div className="flex-1 pb-20 overflow-y-auto bg-[#0a0a1a]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a1a]/95 backdrop-blur-xl border-b border-white/5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{t.title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl"><Star className="w-5 h-5 text-gray-400" fill="currentColor" /></button>
        </div>

        {/* Search */}
        <div className="bg-white/5 rounded-xl px-4 py-3 flex items-center gap-3">
          <Search className="w-4 h-4 text-gray-400" />
          <input type="text" placeholder={t.search} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent text-sm flex-1 outline-none text-white placeholder-gray-500" />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          <button onClick={() => setSelectedCategory(null)} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${!selectedCategory ? 'bg-yellow-500 text-black' : 'bg-white/5 text-gray-300 hover:text-white'}`}>{t.all}</button>
          {CATEGORIES.map(cat => (
            <button key={cat.value} onClick={() => setSelectedCategory(cat.value)} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${selectedCategory === cat.value ? 'bg-yellow-500 text-black' : 'bg-white/5 text-gray-300 hover:text-white'}`}>
              <span>{cat.icon}</span>
              <span>{catLabels[cat.value]?.[language === 'ru' ? 'ru' : 'en'] || cat.value}</span>
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex gap-2">
          {(['distance', 'reward', 'newest'] as const).map(opt => (
            <button key={opt} onClick={() => setSortBy(opt)} className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${sortBy === opt ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/20' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
              {t[opt]}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="px-4 py-4 space-y-3">
        {filteredAndSortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-white font-medium mb-1">{t.noTasks}</p>
            <p className="text-gray-500 text-sm">{t.noTasksHint}</p>
          </div>
        ) : filteredAndSortedTasks.map(task => {
          const distance = calculateDistance(userLatitude, userLongitude, task.latitude, task.longitude);
          const cat = CATEGORIES.find(c => c.value === task.category);
          const catName = catLabels[task.category]?.[language === 'ru' ? 'ru' : 'en'] || task.category;
          return (
            <div key={task.id} className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-yellow-400/30 transition-all active:scale-[0.98]">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">{cat?.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-yellow-400 font-medium">{catName}</span>
                    {task.priority === 'urgent' && <Zap className="w-3 h-3 text-orange-400" />}
                    {task.priority === 'asap' && <Zap className="w-3 h-3 text-red-400" />}
                  </div>
                  <h3 className="text-white font-semibold text-sm truncate">{task.title}</h3>
                  <p className="text-gray-500 text-xs mt-1 truncate">{task.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-yellow-400">{task.reward}</div>
                  <div className="text-xs text-gray-500">{task.currency?.toUpperCase()}</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{distance.toFixed(1)} {t.km}</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3" />{t.task} #{task.id.slice(0, 6)}</span>
              </div>
              <button onClick={() => handleClaim(task.id)} disabled={claimingId === task.id} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-2.5 rounded-xl hover:shadow-lg hover:shadow-yellow-500/20 transition-all disabled:opacity-50 active:scale-[0.98]">
                {claimingId === task.id ? t.claiming : t.claim}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
