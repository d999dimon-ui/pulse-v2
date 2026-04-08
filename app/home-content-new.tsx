"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Plus, Wallet, Bell, Search, TrendingUp, MapPin, Globe,
  Phone, MessageSquare, Star, Zap, Crown, Clock, DollarSign,
  Send, X, ChevronDown, Shield, CheckCircle, AlertCircle
} from "lucide-react";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import CreateTaskModal from "@/components/CreateTaskModal";
import TaskFeed from "@/components/TaskFeed";
import UserProfile from "@/components/UserProfile";
import TabBar from "@/components/TabBar";
import Splash from "@/components/Splash";
import { Task as TaskType, UserProfile as UserProfileType, CATEGORIES, TaskCategory } from "@/types/task";
import { supabase } from "@/lib/supabase";
import { t } from "@/lib/i18n";

// Loader Component
const Loader = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-cyan-400/20 border-t-cyan-400 animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-purple-400/20 border-b-purple-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
      <p className="text-cyan-400 font-medium animate-pulse">Loading TaskHub...</p>
    </div>
  </div>
);

// Dynamic import for LiveTaskMap
const LiveTaskMap = dynamic(
  () => import("@/components/LiveTaskMap"),
  { ssr: false, loading: () => <Loader /> }
);

// Language Selector Component
function LanguageSelector({ language, setLanguage }: { language: string; setLanguage: (lang: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ru', label: 'Русский', flag: '🇷' },
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl glass hover:bg-white/10 transition-all"
      >
        <Globe className="w-4 h-4 text-cyan-400" />
        <span className="text-sm text-white">{currentLang.flag} {currentLang.code.toUpperCase()}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-40 glass rounded-xl overflow-hidden z-50 shadow-2xl border border-white/10">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-all ${
                  language === lang.code
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.label}</span>
                {language === lang.code && <CheckCircle className="w-4 h-4 ml-auto text-cyan-400" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Surge Zone Indicator Component
function SurgeIndicator({ surgeMultiplier }: { surgeMultiplier: number }) {
  if (surgeMultiplier <= 1) return null;

  const getColor = () => {
    if (surgeMultiplier >= 2) return 'from-red-500 to-orange-500';
    if (surgeMultiplier >= 1.5) return 'from-orange-500 to-yellow-500';
    return 'from-yellow-500 to-green-500';
  };

  const getText = () => {
    if (surgeMultiplier >= 2) return '🔴 Extreme Demand';
    if (surgeMultiplier >= 1.5) return '🟠 High Demand';
    return '🟡 Elevated Demand';
  };

  return (
    <div className={`bg-gradient-to-r ${getColor()} rounded-xl p-3 mb-4 flex items-center justify-between`}>
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-white animate-pulse" />
        <span className="text-white font-bold text-sm">{getText()}</span>
      </div>
      <span className="text-white/80 text-xs">×{surgeMultiplier.toFixed(1)} reward</span>
    </div>
  );
}

// Task Detail Modal Component
function TaskDetailModal({
  task,
  onClose,
  onClaim,
  userLanguage
}: {
  task: TaskType;
  onClose: () => void;
  onClaim: () => void;
  userLanguage: string;
}) {
  const category = CATEGORIES.find(c => c.value === task.category);
  const platformFee = task.reward * 0.05;
  const tax = task.reward * 0.1;
  const executorPayout = task.reward - platformFee - tax;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-50">
        <div className="bg-gradient-to-br from-[#1a1f3a] to-[#0a0e27] rounded-3xl p-6 max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{category?.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-white">{task.title}</h2>
                <p className="text-sm text-gray-400">{category?.label}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Description */}
            <div className="glass rounded-xl p-4">
              <p className="text-gray-300 text-sm">{task.description}</p>
            </div>

            {/* Reward & Payout */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-gray-400 text-xs mb-1">{userLanguage === 'ru' ? 'Награда' : 'Reward'}</p>
                <p className="text-2xl font-bold text-cyan-400">{task.reward} {task.currency.toUpperCase()}</p>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-gray-400 text-xs mb-1">{userLanguage === 'ru' ? 'Вы получите' : 'You Earn'}</p>
                <p className="text-2xl font-bold text-green-400">{executorPayout.toFixed(2)}</p>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="glass rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-2">{userLanguage === 'ru' ? 'Детали оплаты' : 'Payment Details'}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">{userLanguage === 'ru' ? 'Комиссия платформы (5%)' : 'Platform Fee (5%)'}</span>
                  <span className="text-red-400">-{platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{userLanguage === 'ru' ? 'Налог (~10%)' : 'Tax (~10%)'}</span>
                  <span className="text-red-400">-{tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                  <span className="text-white">{userLanguage === 'ru' ? 'Итого' : 'Total'}</span>
                  <span className="text-green-400">{executorPayout.toFixed(2)} {task.currency.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Contact Info (shown after claim) */}
            <div className="glass rounded-xl p-4 border-l-4 border-cyan-400">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4 text-cyan-400" />
                <p className="text-white text-sm font-medium">{userLanguage === 'ru' ? 'Контакт заказчика' : 'Customer Contact'}</p>
              </div>
              <p className="text-gray-400 text-sm">+996 555 123 456</p>
              <p className="text-gray-500 text-xs mt-1">{userLanguage === 'ru' ? 'Доступен после принятия заказа' : 'Available after claiming'}</p>
            </div>

            {/* Priority Options */}
            <div className="glass rounded-xl p-4">
              <p className="text-white text-sm font-medium mb-3">{userLanguage === 'ru' ? 'Опции приоритета' : 'Priority Options'}</p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-600 text-cyan-400 focus:ring-cyan-400" />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{userLanguage === 'ru' ? '⚡ Быстрая подача' : '⚡ Priority Pickup'}</p>
                    <p className="text-gray-500 text-xs">{userLanguage === 'ru' ? 'Курьер приедет быстрее' : 'Courier arrives faster'}</p>
                  </div>
                  <span className="text-cyan-400 font-bold text-sm">+2 TON</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-600 text-purple-400 focus:ring-purple-400" />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium flex items-center gap-1">
                      <Crown className="w-4 h-4 text-purple-400" />
                      {userLanguage === 'ru' ? 'Без очереди' : 'Skip Queue'}
                    </p>
                    <p className="text-gray-500 text-xs">{userLanguage === 'ru' ? 'VIP приоритет в поиске' : 'VIP priority in search'}</p>
                  </div>
                  <span className="text-purple-400 font-bold text-sm">+5 TON</span>
                </label>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={onClaim}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {userLanguage === 'ru' ? 'Принять заказ' : 'Accept Task'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Support Chat Component
function SupportChat({ isOpen, onClose, userLanguage }: { isOpen: boolean; onClose: () => void; userLanguage: string }) {
  const [messages, setMessages] = useState<{ text: string; isBot: boolean; timestamp: Date }[]>([
    {
      text: userLanguage === 'ru'
        ? '👋 Привет! Я ассистент TaskHub. Чем могу помочь?'
        : '👋 Hi! I\'m TaskHub assistant. How can I help?',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');

  const quickQuestions = userLanguage === 'ru'
    ? ['Как создать заказ?', 'Как получить оплату?', 'Проблема с заказом']
    : ['How to create task?', 'How to get paid?', 'Order problem'];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { text: input, isBot: false, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);

    // Simulate bot response
    setTimeout(() => {
      const responses: Record<string, string[]> = {
        ru: [
          'Понял ваш вопрос! Наш оператор ответит в течение 5 минут.',
          'Спасибо за обращение! Мы работаем над решением.',
          'Отличный вопрос! Вот что я могу сказать...',
        ],
        en: [
          'Got your question! Our operator will respond within 5 minutes.',
          'Thanks for reaching out! We\'re working on a solution.',
          'Great question! Here\'s what I can tell you...',
        ]
      };
      const lang = userLanguage === 'ru' ? 'ru' : 'en';
      const botMsg = {
        text: responses[lang][Math.floor(Math.random() * responses[lang].length)],
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);

    setInput('');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
        <div className="bg-gradient-to-br from-[#1a1f3a] to-[#0a0e27] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold">{userLanguage === 'ru' ? 'Поддержка' : 'Support'}</p>
                <p className="text-green-400 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  {userLanguage === 'ru' ? 'Онлайн' : 'Online'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Quick Questions */}
          <div className="p-3 flex gap-2 overflow-x-auto border-b border-white/5">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => { setInput(q); }}
                className="px-3 py-1.5 glass rounded-full text-xs text-gray-300 whitespace-nowrap hover:text-white transition"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                  msg.isBot
                    ? 'bg-white/5 text-gray-300 rounded-bl-md'
                    : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-br-md'
                }`}>
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-[10px] opacity-60 mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/5">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={userLanguage === 'ru' ? 'Введите сообщение...' : 'Type a message...'}
                className="flex-1 bg-white/5 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 outline-none focus:ring-2 focus:ring-cyan-400/50"
              />
              <button
                onClick={handleSend}
                className="p-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function HomeContent() {
  const { language, setLanguage } = useLanguage();

  // ========== STATE ==========
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number]>([40.7128, -74.006]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'feed' | 'map' | 'chats' | 'profile'>('home');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [showSupport, setShowSupport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Surge calculation
  const surgeMultiplier = useMemo(() => {
    if (tasks.length === 0) return 1;
    const nearbyCount = tasks.filter(t => {
      const dist = Math.sqrt(
        Math.pow(t.latitude - userPosition[0], 2) +
        Math.pow(t.longitude - userPosition[1], 2)
      ) * 111; // rough km
      return dist < 5;
    }).length;
    if (nearbyCount > 10) return 2.0;
    if (nearbyCount > 5) return 1.5;
    return 1;
  }, [tasks, userPosition]);

  // ========== EFFECTS ==========
  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => setShowSplash(false), 2000);
    loadUserProfile();
    loadTasks();
    getUserLocation();
    return () => clearTimeout(timer);
  }, []);

  // ========== FUNCTIONS ==========
  const getUserLocation = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserPosition([position.coords.latitude, position.coords.longitude]),
        () => {
          fetch('https://ipapi.co/json/')
            .then(r => r.json())
            .then(data => {
              if (data.latitude && data.longitude) {
                setUserPosition([parseFloat(data.latitude), parseFloat(data.longitude)]);
              }
            })
            .catch(() => {});
        }
      );
    }
  }, []);

  const loadUserProfile = useCallback(async () => {
    try {
      const mockUser: UserProfileType = {
        id: 'user-123',
        username: 'TaskMaster',
        display_name: language === 'ru' ? 'Иван Мастер' : 'John Doe',
        avatar_url: 'https://i.pravatar.cc/150?img=1',
        bio: language === 'ru' ? 'Эксперт во всех задачах' : 'Expert in all tasks',
        balance: 1250.50,
        rating: 4.8,
        total_reviews: 42,
        completed_tasks_as_executor: 156,
        completed_tasks_as_customer: 89,
        is_verified: true,
        is_banned: false,
        vip_status: 'gold',
        language: language,
        country: language === 'ru' ? 'Россия' : 'Russia',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUserProfile(mockUser);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }, [language]);

  const loadTasks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('visibility', true)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data) {
        setTasks(data.map((task: any) => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          reward: Number(task.reward) || 5,
          currency: (task.currency || 'ton') as any,
          category: (task.category || 'it') as any,
          latitude: task.latitude,
          longitude: task.longitude,
          status: (task.status || 'open') as any,
          priority: (task.priority || 'normal') as any,
          customer_id: task.customer_id || '',
          executor_id: task.executor_id,
          created_at: task.created_at,
          street_address: task.street_address,
          is_hidden: task.is_hidden,
          reports_count: task.reports_count,
          visibility: task.visibility,
        })));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreateTask = async (taskData: any) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...taskData,
          customer_id: userProfile?.id,
          status: 'open',
          visibility: true,
          is_hidden: false,
        }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setTasks(prev => [{
          id: data.id,
          title: data.title,
          description: data.description || '',
          reward: Number(data.reward),
          currency: data.currency,
          category: data.category,
          latitude: data.latitude,
          longitude: data.longitude,
          status: 'open',
          priority: data.priority || 'normal',
          customer_id: data.customer_id,
          created_at: data.created_at,
          street_address: data.street_address,
          is_hidden: false,
          reports_count: 0,
          visibility: true,
        }, ...prev]);
      }
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleClaimTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'claimed', executor_id: userProfile?.id })
        .eq('id', taskId);

      if (error) throw error;
      setSelectedTask(null);
      loadTasks();
    } catch (error) {
      console.error('Error claiming task:', error);
    }
  };

  // ========== RENDER ==========
  if (showSplash) return <Splash onFinish={() => setShowSplash(false)} />;
  if (!isClient) return <Loader />;

  const filteredTasks = selectedCategory
    ? tasks.filter(t => t.category === selectedCategory)
    : tasks;

  const searchFiltered = searchQuery
    ? filteredTasks.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredTasks;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#111833] to-[#0a0e27]">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* HOME TAB */}
      {activeTab === 'home' && (
        <div className="relative pb-24">
          {/* Header */}
          <div className="sticky top-0 z-30 backdrop-blur-xl bg-[#0a0e27]/80 border-b border-white/5">
            <div className="max-w-lg mx-auto px-4 py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <h1 className="text-white font-bold text-lg">TaskHub</h1>
                    <p className="text-gray-400 text-xs">{language === 'ru' ? 'Маркетплейс услуг' : 'Service Marketplace'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <LanguageSelector language={language} setLanguage={(l) => setLanguage(l as any)} />
                  <button className="relative p-2.5 glass rounded-xl hover:bg-white/10 transition">
                    <Bell className="w-5 h-5 text-gray-300" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setShowSupport(true)}
                    className="p-2.5 glass rounded-xl hover:bg-white/10 transition"
                  >
                    <MessageSquare className="w-5 h-5 text-gray-300" />
                  </button>
                </div>
              </div>

              {/* Balance Card */}
              <div className="relative overflow-hidden glass rounded-2xl p-5 mb-4">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-cyan-400" />
                      <span className="text-gray-400 text-sm">{language === 'ru' ? 'Ваш баланс' : 'Your Balance'}</span>
                    </div>
                    {userProfile?.vip_status !== 'none' && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded-full">
                        <Crown className="w-3 h-3 text-purple-400" />
                        <span className="text-purple-400 text-xs font-medium">VIP</span>
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    {userProfile?.balance?.toFixed(2) || '0.00'} TON
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span className="flex items-center gap-1 text-gray-400">
                      <TrendingUp className="w-3 h-3" />
                      {language === 'ru' ? 'Рейтинг' : 'Rating'}: {userProfile?.rating || 5}/5 ⭐
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400">{userProfile?.completed_tasks_as_executor || 0} {language === 'ru' ? 'задач' : 'tasks'}</span>
                  </div>
                </div>
              </div>

              {/* Surge Indicator */}
              <SurgeIndicator surgeMultiplier={surgeMultiplier} />

              {/* Search */}
              <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'ru' ? 'Поиск задач...' : 'Search tasks...'}
                  className="bg-transparent text-sm flex-1 outline-none text-white placeholder-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-lg mx-auto px-4 py-6">
            {/* Categories */}
            <div className="mb-6">
              <h2 className="text-white font-bold text-lg mb-4">
                {language === 'ru' ? '📋 Категории услуг' : '📋 Service Categories'}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((category) => (
                  <div
                    key={category.value}
                    onClick={() => {
                      setSelectedCategory(category.value === selectedCategory ? null : category.value);
                      setActiveTab('feed');
                    }}
                    className={`group glass rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] ${
                      selectedCategory === category.value
                        ? 'border-cyan-400 shadow-lg shadow-cyan-500/20'
                        : 'border-transparent hover:border-white/10'
                    }`}
                  >
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{category.icon}</div>
                    <div className="text-sm font-semibold text-white mb-1">{category.label}</div>
                    <div className="text-xs text-gray-500">
                      {tasks.filter(t => t.category === category.value).length} {language === 'ru' ? 'доступно' : 'available'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Create Task Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-5 h-5" />
              {language === 'ru' ? 'Создать новый заказ' : 'Create New Task'}
            </button>

            {/* Recent Tasks */}
            {searchFiltered.length > 0 && (
              <div className="mt-8">
                <h3 className="text-white font-bold text-lg mb-4">
                  {language === 'ru' ? '🔥 Последние заказы' : '🔥 Recent Tasks'}
                </h3>
                <div className="space-y-3">
                  {searchFiltered.slice(0, 5).map((task) => {
                    const cat = CATEGORIES.find(c => c.value === task.category);
                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="glass rounded-2xl p-4 cursor-pointer hover:border-cyan-400/50 border border-transparent transition-all hover:shadow-lg hover:shadow-cyan-500/10"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{cat?.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-cyan-400">{cat?.label}</span>
                              {task.priority === 'urgent' && <Zap className="w-3 h-3 text-orange-400" />}
                            </div>
                            <h4 className="text-white font-semibold text-sm truncate">{task.title}</h4>
                            <p className="text-gray-500 text-xs mt-1 truncate">{task.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                              {task.reward}
                            </div>
                            <div className="text-xs text-gray-500">{task.currency.toUpperCase()}</div>
                          </div>
                        </div>
                        {task.street_address && (
                          <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span>{task.street_address}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FEED TAB */}
      {activeTab === 'feed' && (
        <TaskFeed
          isOpen={true}
          onClose={() => setActiveTab('home')}
          tasks={searchFiltered}
          userLatitude={userPosition[0]}
          userLongitude={userPosition[1]}
          onClaimTask={handleClaimTask}
        />
      )}

      {/* MAP TAB */}
      {activeTab === 'map' && (
        <div className="h-screen">
          <LiveTaskMap
            userPosition={userPosition}
            selectedCategory={selectedCategory || undefined}
            tasks={filteredTasks}
          />
        </div>
      )}

      {/* CHATS TAB - Support */}
      {activeTab === 'chats' && (
        <div className="pb-24">
          <div className="max-w-lg mx-auto px-4 py-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                <MessageSquare className="w-10 h-10 text-cyan-400" />
              </div>
              <h2 className="text-white font-bold text-xl mb-2">
                {language === 'ru' ? 'Чат поддержки' : 'Support Chat'}
              </h2>
              <p className="text-gray-400 text-sm">
                {language === 'ru'
                  ? 'Наши операторы готовы помочь вам на русском и английском языках'
                  : 'Our operators are ready to help you in Russian and English'}
              </p>
            </div>
            <button
              onClick={() => setShowSupport(true)}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-cyan-500/25 transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              {language === 'ru' ? 'Начать чат' : 'Start Chat'}
            </button>
          </div>
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && userProfile && (
        <UserProfile user={userProfile} onClose={() => setActiveTab('home')} />
      )}

      {/* MODALS */}
      {isCreateModalOpen && (
        <CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateTask={handleCreateTask}
          userPosition={userPosition}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onClaim={() => handleClaimTask(selectedTask.id)}
          userLanguage={language}
        />
      )}

      {/* Support Chat */}
      <SupportChat
        isOpen={showSupport}
        onClose={() => setShowSupport(false)}
        userLanguage={language}
      />

      {/* TAB BAR */}
      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadCount={unreadCount}
      />
    </div>
  );
}

export default function HomePageWrapper() {
  return (
    <LanguageProvider>
      <HomeContent />
    </LanguageProvider>
  );
}
