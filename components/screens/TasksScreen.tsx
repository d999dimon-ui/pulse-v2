"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Clock, MapPin, Filter, DollarSign, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/utils/translations';
import { Task as TaskType } from '@/types/task';
import { supabase } from '@/lib/supabase';

const CATEGORIES = ['all', 'it', 'delivery', 'cleaning', 'help', 'photo', 'repair', 'tutoring', 'translation', 'marketing'];

interface TasksScreenProps {
  initialCategory?: string;
  onTaskClick: (task: TaskType) => void;
}

export default function TasksScreen({ initialCategory = 'all', onTaskClick }: TasksScreenProps) {
  const { language } = useLanguage();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<'newest' | 'reward' | 'distance'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const query = supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (selectedCategory !== 'all') query.eq('category', selectedCategory);

      const { data, error } = await query;
      if (error) throw error;

      if (data) {
        const mapped: TaskType[] = data.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          reward: Number(task.reward) || 5,
          currency: (task.currency as 'stars' | 'usd') || 'stars',
          category: (task.category as any) || 'help',
          latitude: task.latitude,
          longitude: task.longitude,
          status: (task.status as any) || 'open',
          created_at: new Date(task.created_at).getTime(),
          user_id: task.user_id || '',
          executor_id: task.executor_id,
          exact_address: task.exact_address,
        }));
        setTasks(mapped);
      }
    } catch (e) {
      console.error('Tasks fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => { setSelectedCategory(initialCategory); }, [initialCategory]);

  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(task =>
        task.title.toLowerCase().includes(q) || task.description.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'reward') result.sort((a, b) => b.reward - a.reward);
    if (sortBy === 'newest') result.sort((a, b) => b.created_at - a.created_at);
    return result;
  }, [tasks, searchQuery, sortBy]);

  return (
    <div className="pb-24">
      {/* Search Bar */}
      <div className="sticky top-0 z-[1000] p-4 bg-black/95 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(language, 'home.search')}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl
                         text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 text-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={16} className="text-gray-400" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-xl transition-colors ${showFilters ? 'bg-cyan-500 text-white' : 'bg-white/5 text-gray-400'}`}
          >
            <Filter size={20} />
          </button>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium text-xs transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {t(language, `cat.${cat === 'all' ? 'all' : cat}`)}
            </button>
          ))}
        </div>

        {/* Filter dropdown */}
        {showFilters && (
          <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-xs text-gray-400 mb-2">{t(language, 'tasks.sort')}</p>
            <div className="flex gap-2">
              {(['newest', 'reward', 'distance'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                    sortBy === s ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'text-gray-400'
                  }`}
                >
                  {s === 'newest' ? '🕐 New' : s === 'reward' ? '💰 Reward' : '📍 Distance'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <Search size={48} className="mx-auto mb-4 opacity-30" />
            <p>{t(language, 'tasks.noTasks')}</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onTaskClick(task)}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-cyan-500/30 transition-all cursor-pointer active:scale-[0.98]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-1 text-sm">{task.title}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2">{task.description}</p>
                </div>
                <div className="text-right ml-3">
                  <div className="flex items-center gap-1 text-cyan-400 font-bold text-sm">
                    <DollarSign size={14} />
                    <span>{task.reward}</span>
                  </div>
                  <span className="text-[10px] text-gray-500">{task.currency === 'stars' ? '⭐' : '💵'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(task.created_at).toLocaleDateString()}
                  </span>
                  <span className="px-2 py-0.5 bg-white/5 rounded-full capitalize">{task.category}</span>
                </div>
                {task.exact_address && (
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <MapPin size={10} />
                    <span className="truncate max-w-[120px]">{task.exact_address}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
