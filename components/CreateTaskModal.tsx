"use client";

import { useState } from 'react';
import { CATEGORIES, TaskCategory, Currency } from '@/types/task';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, X, MapPin } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPosition: [number, number];
  onCreateTask: (taskData: {
    title: string;
    description: string;
    reward: number;
    currency: Currency;
    category: TaskCategory;
    latitude: number;
    longitude: number;
    street_address: string;
    priority: 'normal' | 'urgent' | 'asap';
  }) => Promise<void>;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  userPosition,
  onCreateTask,
}: CreateTaskModalProps) {
  const { language } = useLanguage();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('10');
  const [currency, setCurrency] = useState<Currency>('ton');
  const [category, setCategory] = useState<TaskCategory>('it');
  const [address, setAddress] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent' | 'asap'>('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title required';
    if (!description.trim()) newErrors.description = 'Description required';
    if (Number(reward) <= 0) newErrors.reward = 'Reward must be > 0';
    if (!category) newErrors.category = 'Category required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onCreateTask({
        title,
        description,
        reward: Number(reward),
        currency,
        category,
        latitude: userPosition[0],
        longitude: userPosition[1],
        street_address: address,
        priority,
      });

      setTitle('');
      setDescription('');
      setReward('10');
      setCurrency('ton');
      setCategory('it');
      setAddress('');
      setPriority('normal');
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
      setErrors({ submit: 'Failed to create task' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-50">
        <div className="glass rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Create New Task</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Task Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title..."
                className="w-full glass rounded-xl px-4 py-3 text-white placeholder-gray-500 border border-dark-border focus:border-neon-cyan focus:outline-none transition"
              />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the task in detail..."
                rows={4}
                className="w-full glass rounded-xl px-4 py-3 text-white placeholder-gray-500 border border-dark-border focus:border-neon-cyan focus:outline-none transition resize-none"
              />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full glass rounded-xl px-4 py-3 text-white border border-dark-border focus:border-neon-cyan focus:outline-none transition"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-dark-bg">
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reward & Currency */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-white mb-2">
                  Reward Amount *
                </label>
                <input
                  type="number"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  min="1"
                  step="0.1"
                  className="w-full glass rounded-xl px-4 py-3 text-white border border-dark-border focus:border-neon-cyan focus:outline-none transition"
                />
                {errors.reward && <p className="text-red-400 text-xs mt-1">{errors.reward}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="w-full glass rounded-xl px-4 py-3 text-white border border-dark-border focus:border-neon-cyan focus:outline-none transition"
                >
                  <option value="ton" className="bg-dark-bg">TON</option>
                  <option value="usd" className="bg-dark-bg">USD</option>
                  <option value="stars" className="bg-dark-bg">STARS</option>
                </select>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Priority
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['normal', 'urgent', 'asap'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 rounded-lg font-medium transition text-sm ${
                      priority === p
                        ? 'bg-gradient-to-r from-neon-cyan to-neon-purple text-white'
                        : 'glass text-gray-300 hover:text-white'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="flex items-center text-sm font-semibold text-white mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                Address (Optional)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address..."
                className="w-full glass rounded-xl px-4 py-3 text-white placeholder-gray-500 border border-dark-border focus:border-neon-cyan focus:outline-none transition"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-bold py-3 rounded-xl hover:shadow-neon-cyan disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>

            {errors.submit && <p className="text-red-400 text-sm text-center">{errors.submit}</p>}
            <p className="text-xs text-gray-400 text-center">
              By creating a task, you agree to our Terms of Service
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
