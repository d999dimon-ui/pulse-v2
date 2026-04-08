"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Plus, Wallet, Bell, Search, TrendingUp, MapPin, Globe,
  Phone, MessageSquare, Star, Zap, Crown, Clock, DollarSign,
  Send, X, ChevronDown, Shield, CheckCircle, AlertCircle,
  ArrowUpRight, Copy, Users, Gift, AlertTriangle
} from "lucide-react";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import CreateTaskModal from "@/components/CreateTaskModal";
import TaskFeed from "@/components/TaskFeed";
import UserProfile from "@/components/UserProfile";
import TabBar from "@/components/TabBar";
import Splash from "@/components/Splash";
import { Task as TaskType, UserProfile as UserProfileType, CATEGORIES } from "@/types/task";
import { supabase } from "@/lib/supabase";

// Loader
const Loader = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#111827] to-[#0a0e1a] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-yellow-400/20 border-t-yellow-400 animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-blue-400/20 border-b-blue-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
      <p className="text-yellow-400 font-medium animate-pulse">Loading Pulse...</p>
    </div>
  </div>
);

const LiveTaskMap = dynamic(() => import("@/components/LiveTaskMap"), { ssr: false, loading: () => <Loader /> });

// Language Selector
function LanguageSelector({ language, setLanguage }: { language: string; setLanguage: (l: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const langs = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ru', label: 'Русский', flag: '🇷' },
  ];
  const current = langs.find(l => l.code === language) || langs[0];

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition">
        <Globe className="w-4 h-4 text-yellow-400" />
        <span className="text-sm text-white">{current.flag}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-40 bg-[#1a1f3a] rounded-xl overflow-hidden z-50 shadow-2xl border border-white/10">
            {langs.map(l => (
              <button key={l.code} onClick={() => { setLanguage(l.code); setIsOpen(false); }}
                className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 ${language === l.code ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-300 hover:bg-white/5'}`}>
                <span>{l.flag}</span><span>{l.label}</span>
                {language === l.code && <CheckCircle className="w-4 h-4 ml-auto" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Surge Indicator
function SurgeIndicator({ surgeMultiplier, lang }: { surgeMultiplier: number; lang: string }) {
  if (surgeMultiplier <= 1) return null;
  const color = surgeMultiplier >= 2 ? 'from-red-500 to-orange-500' : surgeMultiplier >= 1.5 ? 'from-orange-500 to-yellow-500' : 'from-yellow-500 to-green-500';
  const text = lang === 'ru'
    ? (surgeMultiplier >= 2 ? '🔴 Экстремальный спрос' : surgeMultiplier >= 1.5 ? '🟠 Высокий спрос' : '🟡 Повышенный спрос')
    : (surgeMultiplier >= 2 ? '🔴 Extreme Demand' : surgeMultiplier >= 1.5 ? '🟠 High Demand' : '🟡 Elevated Demand');
  return (
    <div className={`bg-gradient-to-r ${color} rounded-xl p-3 mb-4 flex items-center justify-between`}>
      <div className="flex items-center gap-2"><Zap className="w-5 h-5 text-white animate-pulse" /><span className="text-white font-bold text-sm">{text}</span></div>
      <span className="text-white/80 text-xs">×{surgeMultiplier.toFixed(1)}</span>
    </div>
  );
}

// Contact Protection Utility
function protectContact(text: string, lang: string): { safe: boolean; warning?: string } {
  const phoneRegex = /(\+?\d[\d\s\-()]{7,}\d)/g;
  const telegramRegex = /(@\w+|t\.me\/\w+|telegram\.me\/\w+)/gi;
  const whatsappRegex = /(wa\.me\/\d+|whatsapp\.com)/gi;
  const emailRegex = /[\w.+-]+@[\w-]+\.[\w.]+/g;

  const hasPhone = phoneRegex.test(text);
  const hasTelegram = telegramRegex.test(text);
  const hasWhatsapp = whatsappRegex.test(text);
  const hasEmail = emailRegex.test(text);

  if (hasPhone || hasTelegram || hasWhatsapp || hasEmail) {
    const warnings: Record<string, string> = {
      ru: '⚠️ Обмен контактами запрещён до принятия заказа!',
      en: '⚠️ Contact exchange is prohibited before accepting the order!',
    };
    return { safe: false, warning: warnings[lang] || warnings.en };
  }
  return { safe: true };
}

// Protected Message Input
function ProtectedMessageInput({ value, onChange, onSend, placeholder, lang }: {
  value: string; onChange: (v: string) => void; onSend: () => void; placeholder: string; lang: string;
}) {
  const protection = protectContact(value, lang);
  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text" value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !protection.safe && onSend()}
          placeholder={placeholder}
          className="flex-1 bg-white/5 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 outline-none focus:ring-2 focus:ring-yellow-400/50"
        />
        <button onClick={onSend} disabled={!protection.safe}
          className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl disabled:opacity-30 transition">
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
      {!protection.safe && protection.warning && (
        <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> {protection.warning}
        </p>
      )}
    </div>
  );
}

// Task Detail Modal
function TaskDetailModal({ task, onClose, onClaim, lang }: {
  task: TaskType; onClose: () => void; onClaim: () => void; lang: string;
}) {
  const category = CATEGORIES.find(c => c.value === task.category);
  const fee = task.reward * 0.10; // 10% commission
  const payout = task.reward - fee;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-50">
        <div className="bg-gradient-to-br from-[#1a1f3a] to-[#0a0e1a] rounded-3xl p-6 max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{category?.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-white">{task.title}</h2>
                <p className="text-sm text-gray-400">{category?.label}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X className="w-6 h-6 text-gray-400" /></button>
          </div>

          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-gray-300 text-sm">{task.description}</p>
            </div>

            {/* Reward in Stars & USDT */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl p-4 text-center border border-yellow-500/20">
                <p className="text-gray-400 text-xs mb-1">⭐ {lang === 'ru' ? 'Stars' : 'Stars'}</p>
                <p className="text-2xl font-bold text-yellow-400">{(task.reward * 10).toFixed(0)}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center border border-green-500/20">
                <p className="text-gray-400 text-xs mb-1">💵 USDT</p>
                <p className="text-2xl font-bold text-green-400">{task.reward.toFixed(2)}</p>
              </div>
            </div>

            {/* Payout breakdown */}
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-2">{lang === 'ru' ? 'Детали оплаты' : 'Payment Details'}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">{lang === 'ru' ? 'Комиссия Pulse (10%)' : 'Pulse Fee (10%)'}</span><span className="text-red-400">-{fee.toFixed(2)} USDT</span></div>
                <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                  <span className="text-white">{lang === 'ru' ? 'Вы получите' : 'You Earn'}</span>
                  <span className="text-green-400">{payout.toFixed(2)} USDT</span>
                </div>
              </div>
            </div>

            {/* Contact info - hidden until claimed */}
            <div className="bg-white/5 rounded-xl p-4 border-l-4 border-yellow-400">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4 text-yellow-400" />
                <p className="text-white text-sm font-medium">{lang === 'ru' ? 'Контакт заказчика' : 'Customer Contact'}</p>
              </div>
              <p className="text-gray-500 text-sm blur-sm select-none">+996 555 123 456</p>
              <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {lang === 'ru' ? 'Доступен после принятия' : 'Available after accepting'}
              </p>
            </div>

            {/* Priority options */}
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-white text-sm font-medium mb-3">{lang === 'ru' ? 'Опции приоритета' : 'Priority Options'}</p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-600 text-yellow-400" />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">⚡ {lang === 'ru' ? 'Быстрая подача' : 'Priority Pickup'}</p>
                    <p className="text-gray-500 text-xs">{lang === 'ru' ? 'Курьер приедет быстрее' : 'Courier arrives faster'}</p>
                  </div>
                  <span className="text-yellow-400 font-bold text-sm">+50 ⭐</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-600 text-purple-400" />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium flex items-center gap-1">
                      <Crown className="w-4 h-4 text-purple-400" /> {lang === 'ru' ? 'Без очереди' : 'Skip Queue'}
                    </p>
                    <p className="text-gray-500 text-xs">{lang === 'ru' ? 'VIP приоритет' : 'VIP priority'}</p>
                  </div>
                  <span className="text-purple-400 font-bold text-sm">+1 USDT</span>
                </label>
              </div>
            </div>

            <button onClick={onClaim} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-yellow-500/25 transition-all flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {lang === 'ru' ? 'Принять заказ' : 'Accept Task'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Support Chat with protection
function SupportChat({ isOpen, onClose, lang }: { isOpen: boolean; onClose: () => void; lang: string }) {
  const [messages, setMessages] = useState<{ text: string; isBot: boolean }[]>([
    { text: lang === 'ru' ? '👋 Привет! Я ассистент Pulse. Чем помочь?' : '👋 Hi! I\'m Pulse assistant. How can I help?', isBot: true }
  ]);
  const [input, setInput] = useState('');

  const quickQ = lang === 'ru'
    ? ['Как создать заказ?', 'Как получить оплату?', 'Проблема с заказом']
    : ['How to create task?', 'How to get paid?', 'Order problem'];

  const handleSend = () => {
    if (!input.trim()) return;
    const protection = protectContact(input, lang);
    if (!protection.safe) return;

    setMessages(prev => [...prev, { text: input, isBot: false }]);
    setInput('');

    setTimeout(() => {
      const resp = lang === 'ru'
        ? ['Понял! Оператор ответит через 5 минут.', 'Спасибо! Работаем над решением.', 'Хороший вопрос! Вот что скажу...']
        : ['Got it! Operator will respond in 5 min.', 'Thanks! Working on a solution.', 'Great question! Here\'s what I can tell...'];
      setMessages(prev => [...prev, { text: resp[Math.floor(Math.random() * resp.length)], isBot: true }]);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
        <div className="bg-gradient-to-br from-[#1a1f3a] to-[#0a0e1a] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold">{lang === 'ru' ? 'Поддержка' : 'Support'}</p>
                <p className="text-green-400 text-xs flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full" />{lang === 'ru' ? 'Онлайн' : 'Online'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <div className="p-3 flex gap-2 overflow-x-auto border-b border-white/5">
            {quickQ.map((q, i) => (
              <button key={i} onClick={() => setInput(q)} className="px-3 py-1.5 bg-white/5 rounded-full text-xs text-gray-300 whitespace-nowrap hover:text-white">{q}</button>
            ))}
          </div>
          <div className="h-80 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${msg.isBot ? 'bg-white/5 text-gray-300 rounded-bl-md' : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-br-md'}`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-white/5">
            <ProtectedMessageInput
              value={input} onChange={setInput} onSend={handleSend}
              placeholder={lang === 'ru' ? 'Введите сообщение...' : 'Type a message...'}
              lang={lang}
            />
          </div>
        </div>
      </div>
    </>
  );
}

// Referral Panel
function ReferralPanel({ lang, user }: { lang: string; user: UserProfileType | null }) {
  const [copied, setCopied] = useState(false);
  const referralLink = `https://pulse.app/ref/${user?.id || 'user'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/5 rounded-2xl p-5 border border-yellow-500/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
          <Gift className="w-6 h-6 text-yellow-400" />
        </div>
        <div>
          <p className="text-white font-bold">{lang === 'ru' ? 'Пригласи друга' : 'Invite a Friend'}</p>
          <p className="text-gray-400 text-xs">{lang === 'ru' ? '5 заказов друга = 12ч без комиссии' : 'Friend completes 5 tasks = 12h no fee'}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <input readOnly value={referralLink} className="flex-1 bg-white/5 rounded-xl px-3 py-2 text-white text-sm border border-white/10" />
        <button onClick={handleCopy} className="p-2 bg-yellow-500/20 text-yellow-400 rounded-xl hover:bg-yellow-500/30">
          {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-2xl font-bold text-yellow-400">0</p>
          <p className="text-gray-500 text-xs">{lang === 'ru' ? 'Приглашено' : 'Invited'}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-2xl font-bold text-green-400">0/5</p>
          <p className="text-gray-500 text-xs">{lang === 'ru' ? 'Заказов' : 'Tasks'}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-2xl font-bold text-purple-400">—</p>
          <p className="text-gray-500 text-xs">{lang === 'ru' ? 'Бонус' : 'Bonus'}</p>
        </div>
      </div>
    </div>
  );
}

function HomeContent() {
  const { language, setLanguage } = useLanguage();

  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number]>([40.7128, -74.006]);
  const [showSplash, setShowSplash] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'feed' | 'map' | 'chats' | 'profile'>('home');
  const [unreadCount] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [showSupport, setShowSupport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const surgeMultiplier = useMemo(() => {
    if (tasks.length === 0) return 1;
    const nearby = tasks.filter(t => Math.sqrt(Math.pow(t.latitude - userPosition[0], 2) + Math.pow(t.longitude - userPosition[1], 2)) * 111 < 5).length;
    return nearby > 10 ? 2 : nearby > 5 ? 1.5 : 1;
  }, [tasks, userPosition]);

  useEffect(() => {
    setIsClient(true);
    setTimeout(() => setShowSplash(false), 2000);
    loadUserProfile();
    loadTasks();
    getUserLocation();
  }, []);

  const getUserLocation = useCallback(() => {
    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setUserPosition([p.coords.latitude, p.coords.longitude]),
        () => fetch('https://ipapi.co/json/').then(r => r.json()).then(d => d.latitude && setUserPosition([+d.latitude, +d.longitude])).catch(() => {})
      );
    }
  }, []);

  const loadUserProfile = useCallback(async () => {
    setUserProfile({
      id: 'user-123', username: 'PulseUser',
      display_name: language === 'ru' ? 'Алексей' : 'Alex',
      avatar_url: 'https://i.pravatar.cc/150?img=12',
      bio: language === 'ru' ? 'Курьер Pulse' : 'Pulse Courier',
      balance: 1250.50, rating: 4.8, total_reviews: 42,
      completed_tasks_as_executor: 156, completed_tasks_as_customer: 89,
      is_verified: true, is_banned: false, vip_status: 'none',
      language, country: language === 'ru' ? 'Россия' : 'Russia',
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    });
  }, [language]);

  const loadTasks = useCallback(async () => {
    try {
      const { data } = await supabase.from('tasks').select('*').eq('visibility', true).eq('is_hidden', false).order('created_at', { ascending: false }).limit(50);
      if (data) setTasks(data.map((t: any) => ({ ...t, reward: Number(t.reward) || 5, currency: (t.currency || 'usdt') as any, category: (t.category || 'it') as any, status: (t.status || 'open') as any, priority: (t.priority || 'normal') as any })));
    } catch (e) { console.error(e); }
  }, []);

  const handleCreateTask = async (td: any) => {
    try {
      const { data } = await supabase.from('tasks').insert([{ ...td, customer_id: userProfile?.id, status: 'open', visibility: true, is_hidden: false }]).select().single();
      if (data) setTasks(prev => [{ ...data, reward: Number(data.reward), currency: data.currency, category: data.category, status: 'open', priority: data.priority || 'normal', is_hidden: false, reports_count: 0, visibility: true }, ...prev]);
      setIsCreateModalOpen(false);
    } catch (e) { console.error(e); }
  };

  const handleClaimTask = async (id: string) => {
    await supabase.from('tasks').update({ status: 'claimed', executor_id: userProfile?.id }).eq('id', id);
    setSelectedTask(null); loadTasks();
  };

  if (showSplash) return <Splash onFinish={() => setShowSplash(false)} />;
  if (!isClient) return <Loader />;

  const filtered = selectedCategory ? tasks.filter(t => t.category === selectedCategory) : tasks;
  const searched = searchQuery ? filtered.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description?.toLowerCase().includes(searchQuery.toLowerCase())) : filtered;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#111827] to-[#0a0e1a]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {activeTab === 'home' && (
        <div className="relative pb-24">
          <div className="sticky top-0 z-30 backdrop-blur-xl bg-[#0a0e1a]/80 border-b border-white/5">
            <div className="max-w-lg mx-auto px-4 py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <h1 className="text-white font-bold text-lg">Pulse</h1>
                    <p className="text-gray-400 text-xs">{language === 'ru' ? 'Маркетплейс услуг' : 'Service Marketplace'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <LanguageSelector language={language} setLanguage={(l) => setLanguage(l as any)} />
                  <button className="relative p-2.5 bg-white/5 rounded-xl hover:bg-white/10"><Bell className="w-5 h-5 text-gray-300" />{unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">{unreadCount}</span>}</button>
                  <button onClick={() => setShowSupport(true)} className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10"><MessageSquare className="w-5 h-5 text-gray-300" /></button>
                </div>
              </div>

              {/* Dual Balance Card */}
              <div className="relative overflow-hidden bg-white/5 rounded-2xl p-5 mb-4 border border-white/5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2"><Wallet className="w-5 h-5 text-yellow-400" /><span className="text-gray-400 text-sm">{language === 'ru' ? 'Ваши балансы' : 'Your Balances'}</span></div>
                    {userProfile?.vip_status !== 'none' && <span className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded-full"><Crown className="w-3 h-3 text-purple-400" /><span className="text-purple-400 text-xs">VIP</span></span>}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">⭐ Stars</p>
                      <p className="text-2xl font-bold text-yellow-400">{((userProfile?.balance || 0) * 10).toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">💵 USDT</p>
                      <p className="text-2xl font-bold text-green-400">{(userProfile?.balance || 0).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3 text-xs">
                      <span className="text-gray-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" />{userProfile?.rating || 5}/5 ⭐</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400">{userProfile?.completed_tasks_as_executor || 0} {language === 'ru' ? 'задач' : 'tasks'}</span>
                    </div>
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white text-xs font-medium">
                      <ArrowUpRight className="w-3 h-3" />{language === 'ru' ? 'Вывести' : 'Withdraw'}
                    </button>
                  </div>
                </div>
              </div>

              <SurgeIndicator surgeMultiplier={surgeMultiplier} lang={language} />

              <div className="bg-white/5 rounded-xl px-4 py-3 flex items-center gap-3">
                <Search className="w-4 h-4 text-gray-400" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'ru' ? 'Поиск задач...' : 'Search tasks...'}
                  className="bg-transparent text-sm flex-1 outline-none text-white placeholder-gray-500" />
              </div>
            </div>
          </div>

          <div className="max-w-lg mx-auto px-4 py-6">
            <div className="mb-6">
              <h2 className="text-white font-bold text-lg mb-4">{language === 'ru' ? '📋 Категории' : '📋 Categories'}</h2>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map(cat => (
                  <div key={cat.value} onClick={() => { setSelectedCategory(cat.value === selectedCategory ? null : cat.value); setActiveTab('feed'); }}
                    className={`group bg-white/5 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] ${selectedCategory === cat.value ? 'border-yellow-400 shadow-lg shadow-yellow-500/20' : 'border-transparent hover:border-white/10'}`}>
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
                    <div className="text-sm font-semibold text-white mb-1">{cat.label}</div>
                    <div className="text-xs text-gray-500">{tasks.filter(t => t.category === cat.value).length} {language === 'ru' ? 'доступно' : 'available'}</div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setIsCreateModalOpen(true)}
              className="w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-yellow-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Plus className="w-5 h-5" />{language === 'ru' ? 'Создать заказ' : 'Create Task'}
            </button>

            {searched.length > 0 && (
              <div className="mt-8">
                <h3 className="text-white font-bold text-lg mb-4">{language === 'ru' ? '🔥 Последние' : '🔥 Recent'}</h3>
                <div className="space-y-3">
                  {searched.slice(0, 5).map(task => {
                    const cat = CATEGORIES.find(c => c.value === task.category);
                    return (
                      <div key={task.id} onClick={() => setSelectedTask(task)}
                        className="bg-white/5 rounded-2xl p-4 cursor-pointer hover:border-yellow-400/50 border border-transparent transition-all">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{cat?.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-yellow-400">{cat?.label}</span>
                              {task.priority === 'urgent' && <Zap className="w-3 h-3 text-orange-400" />}
                            </div>
                            <h4 className="text-white font-semibold text-sm truncate">{task.title}</h4>
                            <p className="text-gray-500 text-xs mt-1 truncate">{task.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-yellow-400">{task.reward}</div>
                            <div className="text-xs text-gray-500">{task.currency?.toUpperCase()}</div>
                          </div>
                        </div>
                        {task.street_address && <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-500"><MapPin className="w-3 h-3" /><span>{task.street_address}</span></div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'feed' && <TaskFeed isOpen={true} onClose={() => setActiveTab('home')} tasks={searched} userLatitude={userPosition[0]} userLongitude={userPosition[1]} onClaimTask={handleClaimTask} />}
      {activeTab === 'map' && <div className="h-screen"><LiveTaskMap userPosition={userPosition} selectedCategory={selectedCategory || undefined} tasks={filtered} /></div>}

      {activeTab === 'chats' && (
        <div className="pb-24">
          <div className="max-w-lg mx-auto px-4 py-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center mb-4">
                <MessageSquare className="w-10 h-10 text-yellow-400" />
              </div>
              <h2 className="text-white font-bold text-xl mb-2">{language === 'ru' ? 'Чат поддержки' : 'Support Chat'}</h2>
              <p className="text-gray-400 text-sm">{language === 'ru' ? 'Поддержка на русском и английском' : 'Support in Russian and English'}</p>
            </div>
            <button onClick={() => setShowSupport(true)} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2">
              <MessageSquare className="w-5 h-5" />{language === 'ru' ? 'Начать чат' : 'Start Chat'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'profile' && userProfile && (
        <div className="pb-24">
          <div className="max-w-lg mx-auto px-4 py-6">
            <div className="text-center mb-6">
              <img src={userProfile.avatar_url} alt="" className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-yellow-400" />
              <h2 className="text-white font-bold text-xl">{userProfile.display_name}</h2>
              <p className="text-gray-400">@{userProfile.username}</p>
              <div className="flex justify-center gap-1 mt-2">{Array.from({ length: 5 }, (_, i) => <span key={i}>{i < Math.floor(userProfile.rating) ? '⭐' : '☆'}</span>)}</div>
            </div>
            <ReferralPanel lang={language} user={userProfile} />
          </div>
        </div>
      )}

      {isCreateModalOpen && <CreateTaskModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreateTask={handleCreateTask} userPosition={userPosition} />}
      {selectedTask && <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} onClaim={() => handleClaimTask(selectedTask.id)} lang={language} />}
      <SupportChat isOpen={showSupport} onClose={() => setShowSupport(false)} lang={language} />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} unreadCount={unreadCount} />
    </div>
  );
}

export default function HomePageWrapper() {
  return <LanguageProvider><HomeContent /></LanguageProvider>;
}
