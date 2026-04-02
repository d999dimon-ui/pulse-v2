"use client";

import { useState, useEffect } from 'react';
import { MapPin, Search, Plus, Clock, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/i18n';
import { Task as TaskType } from '@/types/task';

interface TaskFeedProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'ru' | 'en' | 'uz';
  onTaskClick?: (task: TaskType) => void;
  onCreateTask?: () => void;
  tasks: TaskType[];
  userLatitude: number;
  userLongitude: number;
  onClaimTask: (taskId: string) => void;
}

export default function TaskFeed({
  isOpen,
  onClose,
  language,
  onTaskClick,
  onCreateTask,
  tasks,
  userLatitude,
  userLongitude,
  onClaimTask
}: TaskFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { value: 'all', label: t(language, 'categories.all'), icon: '📋' },
    { value: 'it', label: t(language, 'categories.it'), icon: '💻' },
    { value: 'repair', label: t(language, 'categories.repair'), icon: '🔧' },
    { value: 'translation', label: t(language, 'categories.translation'), icon: '📝' },
    { value: 'delivery', label: t(language, 'categories.delivery'), icon: '📦' },
    { value: 'cleaning', label: t(language, 'categories.cleaning'), icon: '🧹' },
    { value: 'tutoring', label: t(language, 'categories.tutoring'), icon: '📚' },
    { value: 'marketing', label: t(language, 'categories.marketing'), icon: '📊' },
    { value: 'photo', label: t(language, 'categories.photo'), icon: '📸' },
  ];

  useEffect(() => {
    loadTasks();
  }, [selectedCategory]);

  const loadTasks = async () => {
    setIsLoading(true);
    
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (selectedCategory !== 'all') {
      query = query.eq('category', selectedCategory);
    }

    const { data, error } = await query;

    if (error) console.error('Load tasks error:', error);
    else setTasks(data || []);

    setIsLoading(false);
  };

  const filteredTasks = tasks.filter(task => {
    if (!searchQuery) return true;
    return task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           task.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="pb-24">
      {/* Search Bar */}
      <div className="sticky top-0 z-[1000] p-4 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(language, 'feed.search')}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl
                         text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <button
            onClick={onCreateTask}
            className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl hover:opacity-90 transition-all"
          >
            <Plus size={24} className="text-white" />
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.value
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <span>{cat.icon}</span>
              <span className="text-xs">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="text-center text-gray-400 py-12">
            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>{t(language, 'feed.loading')}</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <Search size={48} className="mx-auto mb-4 opacity-50" />
            <p>{t(language, 'feed.noTasks')}</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onTaskClick(task)}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-cyan-500/30 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-1">{task.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2">{task.description}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-cyan-400 font-bold">
                    <DollarSign size={16} />
                    <span>{task.reward}</span>
                  </div>
                  <span className="text-xs text-gray-500">{task.currency}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(task.created_at).toLocaleDateString()}
                  </span>
                  <span className="px-2 py-1 bg-white/5 rounded-full capitalize">
                    {task.category}
                  </span>
                </div>
                
                {task.exact_address && (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin size={12} />
                    <span className="truncate max-w-[150px]">{task.exact_address}</span>
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
