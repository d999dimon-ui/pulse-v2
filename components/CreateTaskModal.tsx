"use client";

import { useState } from 'react';
import { Task, CATEGORIES, CATEGORY_COLORS } from '@/types/task';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/utils/translations';
import { calculateRewardWithSurge, getSurgeStatusText } from '@/lib/surge-pricing';

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
  const { language } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [baseReward, setBaseReward] = useState('5');
  const [currency, setCurrency] = useState<'stars' | 'usd'>('stars');
  const [category, setCategory] = useState<typeof CATEGORIES[0]['value']>('delivery');
  const [isAutoCategorizing, setIsAutoCategorizing] = useState(false);
  
  // Load tasks for surge calculation
  const [tasks, setTasks] = useState<any[]>([]);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
  }, []);
  
  // Calculate reward with surge pricing
  const surgeMultiplier = calculateRewardWithSurge(Number(baseReward) || 5, tasks, latitude, longitude);
  const surgeActive = surgeMultiplier > Number(baseReward);

  // AI Auto-categorization
  const autoCategorize = async () => {
    if (!title.trim() || !description.trim()) return;
    
    setIsAutoCategorizing(true);
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'TaskHub Auto-Categorize',
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a task categorizer. Categorize tasks into one of: delivery, cleaning, help, photo. Respond with ONLY the category name, nothing else.`
            },
            {
              role: 'user',
              content: `Title: "${title}"\nDescription: "${description}"\n\nCategory:`
            }
          ],
          temperature: 0.3,
          max_tokens: 10,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiCategory = data.choices[0]?.message?.content?.trim().toLowerCase();
        
        if (aiCategory && ['delivery', 'cleaning', 'help', 'photo'].includes(aiCategory)) {
          setCategory(aiCategory as typeof category);
        }
      }
    } catch (error) {
      console.error('Auto-categorize error:', error);
    } finally {
      setIsAutoCategorizing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      title,
      description,
      reward: surgeMultiplier,
      currency,
      category,
      latitude,
      longitude,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setBaseReward('5');
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
            <h2 className="text-2xl font-bold text-white">{t(language, 'createTaskTitle')}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label={t(language, 'close')}
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
                {t(language, 'taskTitle')}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t(language, 'taskTitlePlaceholder')}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                           text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50
                           focus:ring-1 focus:ring-cyan-500/50 transition-all"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                {t(language, 'description')}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t(language, 'descriptionPlaceholder')}
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                           text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50
                           focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none"
                required
              />
            </div>

            {/* Reward & Currency */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {t(language, 'reward')}
                </label>
                <input
                  type="number"
                  value={baseReward}
                  onChange={(e) => setBaseReward(e.target.value)}
                  min="1"
                  step="0.5"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                             text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50
                             focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  required
                />
              </div>
              
              {/* Surge Pricing Indicator */}
              {surgeActive && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-red-400 text-sm font-semibold">
                      {getSurgeStatusText(surgeMultiplier / Number(baseReward), language)}
                    </span>
                    <span className="text-red-400 font-bold text-lg">x{(surgeMultiplier / Number(baseReward)).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Base: {baseReward}</span>
                    <span className="text-gray-400">With Surge:</span>
                    <span className="text-red-400 font-bold">{surgeMultiplier} ⭐</span>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {t(language, 'currency')}
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
                    ⭐ {t(language, 'stars')}
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
                    💵 {t(language, 'usd')}
                  </button>
                </div>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                {t(language, 'category')}
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
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
                    <span className="text-xs font-medium">{t(language, `categories.${cat.value}`)}</span>
                  </button>
                ))}
              </div>
              {/* AI Auto-categorize Button */}
              <button
                type="button"
                onClick={autoCategorize}
                disabled={isAutoCategorizing || !title.trim() || !description.trim()}
                className="w-full py-2 px-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 
                           border border-purple-500/50 rounded-xl text-purple-400 text-sm font-medium
                           hover:from-purple-500/30 hover:to-pink-500/30
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isAutoCategorizing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                    {language === 'ru' ? '🤖 ИИ выбирает...' : '🤖 AI choosing...'}
                  </>
                ) : (
                  <>
                    ✨ {language === 'ru' ? 'Авто-категория (ИИ)' : 'Auto-Category (AI)'}
                  </>
                )}
              </button>
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
              {t(language, 'createTaskButton')}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
