"use client";

import { useState, useEffect } from 'react';
import { Task, CATEGORIES, CATEGORY_COLORS } from '@/types/task';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'status' | 'userId'>) => void;
}

export default function CreateTaskModal({ 
  isOpen, 
  onClose, 
  latitude, 
  longitude,
  onSubmit 
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('5');
  const [currency, setCurrency] = useState<'stars' | 'usd'>('stars');
  const [category, setCategory] = useState<typeof CATEGORIES[0]['value']>('delivery');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      title,
      description,
      reward: parseFloat(reward),
      currency,
      category,
      latitude,
      longitude,
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setReward('5');
    setCurrency('stars');
    setCategory('delivery');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[3000]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-[3001]">
        <div className="bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl 
                        border border-cyan-500/30 rounded-3xl p-6 shadow-[0_0_40px_rgba(34,211,238,0.2)]">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Create New Task</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Task Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Deliver package to downtown"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl 
                           text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50
                           focus:ring-1 focus:ring-cyan-500/50 transition-all"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the task details..."
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl 
                           text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50
                           focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none"
                required
              />
            </div>

            {/* Reward & Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Reward
                </label>
                <input
                  type="number"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  min="1"
                  step="0.5"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl 
                             text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50
                             focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Currency
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrency('stars')}
                    className={`flex-1 py-3 px-3 rounded-xl font-medium transition-all ${
                      currency === 'stars'
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/30'
                        : 'bg-white/5 text-gray-400 border border-white/10'
                    }`}
                  >
                    ⭐ Stars
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('usd')}
                    className={`flex-1 py-3 px-3 rounded-xl font-medium transition-all ${
                      currency === 'usd'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                        : 'bg-white/5 text-gray-400 border border-white/10'
                    }`}
                  >
                    💵 USD
                  </button>
                </div>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Category
              </label>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                      category === cat.value
                        ? `bg-gradient-to-r ${CATEGORY_COLORS[cat.value]} text-white shadow-lg`
                        : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/30'
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-xs font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 
                         text-white font-bold rounded-xl
                         hover:from-cyan-600 hover:to-blue-600
                         shadow-[0_0_20px_rgba(34,211,238,0.4)]
                         hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]
                         transition-all duration-300 active:scale-98"
            >
              🚀 Create Task
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
