"use client";

import { useState, useMemo, useCallback } from 'react';
import { MapPin, Star, AlertCircle, Zap, Search } from 'lucide-react';
import { Task, CATEGORIES } from '@/types/task';

interface TaskFeedProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  userLatitude: number;
  userLongitude: number;
  onClaimTask: (taskId: string) => Promise<void>;
}

export default function TaskFeed({
  isOpen,
  onClose,
  tasks,
  userLatitude,
  userLongitude,
  onClaimTask,
}: TaskFeedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'distance' | 'reward' | 'newest'>('distance');
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesCategory = !selectedCategory || task.category === selectedCategory;
      return task.status === 'open' && matchesSearch && matchesCategory;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'distance') {
        const distA = calculateDistance(userLatitude, userLongitude, a.latitude, a.longitude);
        const distB = calculateDistance(userLatitude, userLongitude, b.latitude, b.longitude);
        return distA - distB;
      } else if (sortBy === 'reward') {
        return b.reward - a.reward;
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [tasks, searchQuery, selectedCategory, sortBy, userLatitude, userLongitude, calculateDistance]);

  const handleClaim = async (taskId: string) => {
    setClaimingId(taskId);
    try {
      await onClaimTask(taskId);
    } catch (error) {
      console.error('Error claiming task:', error);
    } finally {
      setClaimingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex-1 pb-24 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark-bg border-b border-dark-border p-4 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-white">Available Tasks</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="glass rounded-xl px-4 py-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm flex-1 outline-none text-white placeholder-gray-400"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition ${
              selectedCategory === null
                ? 'bg-neon-cyan text-dark-bg'
                : 'glass text-gray-300 hover:text-white'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition ${
                selectedCategory === cat.value
                  ? 'bg-neon-cyan text-dark-bg'
                  : 'glass text-gray-300 hover:text-white'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex gap-2">
          {(['distance', 'reward', 'newest'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                sortBy === option
                  ? 'bg-neon-purple text-white'
                  : 'glass text-gray-300 hover:text-white'
              }`}
            >
              {option === 'distance' ? '📍' : option === 'reward' ? '💰' : '⏰'} {option}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {filteredAndSortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-600 mb-3" />
            <p className="text-gray-400">No tasks found</p>
            <p className="text-gray-500 text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          filteredAndSortedTasks.map((task) => {
            const distance = calculateDistance(userLatitude, userLongitude, task.latitude, task.longitude);
            const category = CATEGORIES.find(c => c.value === task.category);

            return (
              <div
                key={task.id}
                className="glass rounded-2xl p-4 border border-dark-border hover:border-neon-cyan transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{category?.icon}</span>
                      <span className="text-xs font-semibold text-neon-cyan uppercase">
                        {category?.label}
                      </span>
                      {task.priority === 'urgent' && <Zap className="w-4 h-4 text-orange-400" />}
                      {task.priority === 'asap' && <Zap className="w-4 h-4 text-red-400" />}
                    </div>
                    <h3 className="text-white font-bold text-sm">{task.title}</h3>
                    <p className="text-gray-400 text-xs mt-1 line-clamp-2">{task.description}</p>
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-lg font-bold text-neon-gold">{task.reward}</div>
                    <div className="text-xs text-gray-400">{task.currency.toUpperCase()}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {distance.toFixed(1)} km away
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Task #{task.id.slice(0, 6)}
                  </span>
                </div>

                <button
                  onClick={() => handleClaim(task.id)}
                  disabled={claimingId === task.id}
                  className="w-full bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-bold py-2 rounded-lg hover:shadow-neon-cyan transition-all disabled:opacity-50"
                >
                  {claimingId === task.id ? 'Claiming...' : 'Claim Task'}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
