"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Plus, Search, MessageSquare, Navigation, Loader2, Wallet, Globe, Bell, MapPin, Zap, Filter, X, Moon, Sun, ArrowUpRight, ChevronRight, LogOut, Star, CheckCircle } from "lucide-react";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import CreateTaskModal from "@/components/CreateTaskModal";
import TaskFeed from "@/components/TaskFeed";
import TabBar from "@/components/TabBar";
import Splash from "@/components/Splash";
import { Task as TaskType, UserProfile as UserProfileType } from "@/types/task";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  { value: 'it', icon: '💻' }, { value: 'couriers', icon: '🚴' },
  { value: 'household_services', icon: '🏠' }, { value: 'marketing', icon: '📊' },
  { value: 'delivery', icon: '📦' }, { value: 'cleaning', icon: '🧹' },
  { value: 'photo', icon: '📸' }, { value: 'translation', icon: '📝' },
  { value: 'tutoring', icon: '📚' }, { value: 'repair', icon: '🔧' },
];

const i18n = {
  ru: {
    subtitle: 'Маркетплейс услуг', search: 'Поиск задач...', categories: 'Категории',
    available: 'доступно', createTask: 'Создать заказ', noTasks: 'Заданий нет',
    support: 'Поддержка', supportDesc: 'Мы на связи 24/7', startChat: 'Начать чат',
    profile: 'Профиль', balance: 'Ваши балансы', stars: 'Stars', usdt: 'USDT',
    withdraw: 'Вывести', rating: 'Рейтинг', completed: 'задач', language: 'Язык',
    darkMode: 'Тёмная тема', lightMode: 'Светлая тема', logout: 'Выйти',
    filterBy: 'Фильтр', map: 'Карта', home: 'Главная', feed: 'Лента', chats: 'Чаты',
    msgPlaceholder: 'Сообщение...',
    cat_it: 'IT Услуги', cat_couriers: 'Курьеры', cat_household_services: 'Бытовые услуги',
    cat_marketing: 'Маркетинг', cat_delivery: 'Доставка', cat_cleaning: 'Уборка',
    cat_photo: 'Фото', cat_translation: 'Переводы', cat_tutoring: 'Репетиторство', cat_repair: 'Ремонт',
  },
  en: {
    subtitle: 'Service Marketplace', search: 'Search tasks...', categories: 'Categories',
    available: 'available', createTask: 'Create Task', noTasks: 'No tasks',
    support: 'Support', supportDesc: 'We\'re online 24/7', startChat: 'Start Chat',
    profile: 'Profile', balance: 'Your Balances', stars: 'Stars', usdt: 'USDT',
    withdraw: 'Withdraw', rating: 'Rating', completed: 'tasks', language: 'Language',
    darkMode: 'Dark Mode', lightMode: 'Light Mode', logout: 'Logout',
    filterBy: 'Filter', map: 'Map', home: 'Home', feed: 'Feed', chats: 'Chats',
    msgPlaceholder: 'Message...',
    cat_it: 'IT Services', cat_couriers: 'Couriers', cat_household_services: 'Household Services',
    cat_marketing: 'Marketing', cat_delivery: 'Delivery', cat_cleaning: 'Cleaning',
    cat_photo: 'Photo', cat_translation: 'Translation', cat_tutoring: 'Tutoring', cat_repair: 'Repair',
  }
};

const t = (key: string, lang: string) => (i18n as any)[lang]?.[key] || (i18n as any).en[key] || key;
const catLabel = (v: string, lang: string) => t(`cat_${v}`, lang);

const Loader = () => (
  <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-full border-4 border-yellow-400/20 border-t-yellow-400 animate-spin" />
      <p className="text-yellow-400">Loading Pulse...</p>
    </div>
  </div>
);

const LiveTaskMap = dynamic(() => import("@/components/LiveTaskMap"), { ssr: false, loading: () => <Loader /> });

function SupportChat({ isOpen, onClose, lang }: { isOpen: boolean; onClose: () => void; lang: string }) {
  const [messages, setMessages] = useState<{ text: string; isBot: boolean }[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ text: lang === 'ru' ? 'Привет! Я из поддержки Pulse 😊' : 'Hi! I\'m from Pulse support 😊', isBot: true }]);
    }
  }, [isOpen, lang, messages.length]);

  const send = () => {
    if (!input.trim()) return;
    const re = /(\+?\d[\d\s\-()]{7,}\d|@\w+|t\.me|wa\.me|whatsapp|@[\w.-]+)/gi;
    if (re.test(input)) return;
    setMessages(p => [...p, { text: input, isBot: false }]);
    setInput(''); setTyping(true);
    const resp = lang === 'ru'
      ? { order: 'Понял. Дайте пару минут, проверю.', payment: 'Оплата 5-10 минут. Номер заказа?', problem: 'Опишите проблему?', default: 'Хорошо, уточню и вернусь.' }
      : { order: 'Got it. Checking...', payment: 'Payment 5-10 min.', problem: 'Describe?', default: 'Alright, let me check.' };
    const lower = input.toLowerCase();
    const cat = (lower.includes('order') || lower.includes('заказ')) ? 'order' : (lower.includes('pay') || lower.includes('оплат')) ? 'payment' : (lower.includes('problem') || lower.includes('проблем')) ? 'problem' : 'default';
    setTimeout(() => { setMessages(p => [...p, { text: resp[cat as keyof typeof resp], isBot: true }]); setTyping(false); }, 1500);
  };

  if (!isOpen) return null;
  return (<>
    <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
    <div className="fixed bottom-24 left-4 right-4 md:right-4 md:w-96 z-50">
      <div className="bg-[#1a1f3a] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          <p className="text-white font-bold">{t('support', lang)}</p>
          <button onClick={onClose} className="p-1"><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="h-72 overflow-y-auto p-4 space-y-2">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${m.isBot ? 'bg-white/5 text-gray-300' : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'}`}>{m.text}</div>
            </div>
          ))}
          {typing && <div className="flex justify-start"><div className="bg-white/5 rounded-2xl px-3 py-2"><div className="flex gap-1"><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" /><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} /><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} /></div></div></div>}
        </div>
        <div className="p-3 border-t border-white/5 flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder={t('msgPlaceholder', lang)} className="flex-1 bg-white/5 rounded-xl px-3 py-2 text-white text-sm outline-none" />
          <button onClick={send} className="p-2 bg-yellow-500 rounded-xl"><Star className="w-4 h-4 text-white" fill="white" /></button>
        </div>
      </div>
    </div>
  </>);
}

function HomeContent() {
  const { language, setLanguage } = useLanguage();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number]>([40.7128, -74.006]);
  const [showSplash, setShowSplash] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [tab, setTab] = useState<'home' | 'feed' | 'map' | 'chats' | 'profile'>('home');
  const [unread] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [query, setQuery] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setTimeout(() => setShowSplash(false), 1500);
    loadProfile();
    loadTasks();
    getLocation();
    window.addEventListener('offline', () => setOffline(true));
    window.addEventListener('online', () => setOffline(false));
    return () => { window.removeEventListener('offline', () => {}); window.removeEventListener('online', () => {}); };
  }, []);

  const getLocation = () => {
    setDetecting(true);
    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        p => { setUserPosition([p.coords.latitude, p.coords.longitude]); setDetecting(false); },
        () => fetch('https://ipapi.co/json/').then(r => r.json()).then(d => d.latitude && setUserPosition([+d.latitude, +d.longitude])).finally(() => setDetecting(false))
      );
    } else setDetecting(false);
  };

  const loadProfile = useCallback(async () => {
    try {
      const { data } = await supabase.from('profiles').select('*').limit(1).single();
      if (data) setUserProfile({ ...data, rating: data.rating || 5 });
      else setUserProfile({
        id: 'u1', username: 'PulseUser', display_name: language === 'ru' ? 'Пользователь' : 'User',
        avatar_url: 'https://i.pravatar.cc/150?img=12', bio: '', balance: 0, rating: 5, total_reviews: 0,
        completed_tasks_as_executor: 0, completed_tasks_as_customer: 0, is_verified: false, is_banned: false,
        vip_status: 'none', language, country: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      } as UserProfileType);
    } catch (e) { console.error(e); }
  }, [language]);

  const loadTasks = useCallback(async () => {
    try {
      const { data } = await supabase.from('tasks').select('*').eq('visibility', true).eq('is_hidden', false).order('created_at', { ascending: false }).limit(50);
      if (data) setTasks(data.map((tk: any) => ({ ...tk, reward: Number(tk.reward) || 5, currency: (tk.currency || 'usdt') as any, category: (tk.category || 'it') as any, status: (tk.status || 'open') as any, priority: (tk.priority || 'normal') as any })));
    } catch (e) { console.error(e); }
  }, []);

  const createTask = async (td: any) => {
    try {
      const { data } = await supabase.from('tasks').insert([{ ...td, customer_id: userProfile?.id, status: 'open', visibility: true, is_hidden: false }]).select().single();
      if (data) setTasks(p => [{ ...data, reward: Number(data.reward), currency: data.currency, category: data.category, status: 'open', priority: data.priority || 'normal', is_hidden: false, reports_count: 0, visibility: true }, ...p]);
      setIsCreateOpen(false);
    } catch (e) { console.error(e); }
  };

  const claimTask = async (id: string) => {
    await supabase.from('tasks').update({ status: 'claimed', executor_id: userProfile?.id }).eq('id', id);
    loadTasks();
  };

  const filtered = selectedCat ? tasks.filter(tk => tk.category === selectedCat) : tasks;
  const searched = query ? filtered.filter(tk => tk.title.toLowerCase().includes(query.toLowerCase()) || tk.description?.toLowerCase().includes(query.toLowerCase())) : filtered;
  const bg = darkMode ? 'bg-[#0a0a1a]' : 'bg-gray-50';
  const cardBg = darkMode ? 'bg-white/5' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = darkMode ? 'border-white/10' : 'border-gray-200';

  if (showSplash) return <Splash onFinish={() => setShowSplash(false)} />;
  if (!isClient) return <Loader />;

  return (
    <div className={`min-h-screen ${bg}`}>
      {/* Background glow */}
      {darkMode && <div className="fixed inset-0 pointer-events-none"><div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" /><div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" /></div>}

      {/* Offline */}
      {offline && <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500/20 px-4 py-2 text-center"><p className="text-orange-400 text-sm">⚡ {language === 'ru' ? 'Оффлайн' : 'Offline'}</p></div>}

      {/* ===== TAB CONTENT ===== */}
      {tab === 'home' && (
        <div className="pb-20 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
          <div className="max-w-lg mx-auto px-4 py-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-lg">⚡</div>
                <div><h1 className={`${textPrimary} font-bold text-base`}>Pulse</h1><p className={`${textSecondary} text-xs`}>{t('subtitle', language)}</p></div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')} className="p-2 rounded-xl bg-white/5"><Globe className="w-5 h-5 text-yellow-400" /></button>
                <button onClick={() => setShowChat(true)} className="p-2 rounded-xl bg-white/5"><MessageSquare className="w-5 h-5 text-gray-300" /></button>
              </div>
            </div>

            {/* Search */}
            <div className={`${cardBg} rounded-xl px-4 py-3 flex items-center gap-3 mb-5`}>
              <Search className={`w-4 h-4 ${textSecondary}`} />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t('search', language)} className={`bg-transparent text-sm flex-1 outline-none ${textPrimary} placeholder-gray-500`} />
            </div>

            {/* Categories */}
            <h2 className={`${textPrimary} font-bold text-lg mb-3`}>{t('categories', language)}</h2>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {CATEGORIES.map(cat => (
                <button key={cat.value} onClick={() => setSelectedCat(cat.value === selectedCat ? null : cat.value)} type="button"
                  className={`rounded-2xl p-3 text-left transition-all active:scale-95 ${cardBg} ${selectedCat === cat.value ? 'ring-2 ring-yellow-400 bg-yellow-500/10' : ''}`}>
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <div className={`${textPrimary} text-sm font-semibold`}>{catLabel(cat.value, language)}</div>
                  <div className={`${textSecondary} text-xs`}>{tasks.filter(tk => tk.category === cat.value).length} {t('available', language)}</div>
                </button>
              ))}
            </div>

            {/* Filter badge */}
            {selectedCat && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                <Filter className="w-4 h-4 text-yellow-400" />
                <span className={`text-sm ${textSecondary}`}>{t('filterBy', language)}: <span className="text-yellow-400">{catLabel(selectedCat, language)}</span></span>
                <button onClick={() => setSelectedCat(null)} className="ml-auto"><X className="w-4 h-4 text-gray-400" /></button>
              </div>
            )}

            {/* Create button */}
            <button onClick={() => setIsCreateOpen(true)} className="w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all mb-5">
              <Plus className="w-5 h-5" />{t('createTask', language)}
            </button>

            {/* Tasks */}
            <div className="space-y-3">
              {searched.length === 0 ? <div className="text-center py-10"><p className={textSecondary}>{t('noTasks', language)}</p></div>
                : searched.map(task => {
                  const cat = CATEGORIES.find(c => c.value === task.category);
                  return (
                    <div key={task.id} className={`${cardBg} rounded-2xl p-4`}>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{cat?.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1"><span className="text-xs text-yellow-400 font-medium">{catLabel(task.category, language)}</span>{task.priority === 'urgent' && <Zap className="w-3 h-3 text-orange-400" />}</div>
                          <h4 className={`${textPrimary} font-semibold text-sm truncate`}>{task.title}</h4>
                          <p className={`${textSecondary} text-xs mt-1 truncate`}>{task.description}</p>
                        </div>
                        <div className="text-right"><div className="text-lg font-bold text-yellow-400">{task.reward}</div><div className={`text-xs ${textSecondary}`}>{task.currency?.toUpperCase()}</div></div>
                      </div>
                      {task.street_address && <div className={`flex items-center gap-1.5 mt-2 text-xs ${textSecondary}`}><MapPin className="w-3 h-3" /><span>{task.street_address}</span></div>}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {tab === 'feed' && (
        <div className="pb-20 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
          <TaskFeed isOpen={true} onClose={() => setTab('home')} tasks={searched} userLatitude={userPosition[0]} userLongitude={userPosition[1]} onClaimTask={claimTask} />
        </div>
      )}

      {tab === 'map' && (
        <div className="h-screen relative">
          <LiveTaskMap userPosition={userPosition} selectedCategory={selectedCat || undefined} tasks={filtered} />
          <button onClick={getLocation} disabled={detecting} className="absolute bottom-24 right-4 z-20 p-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-lg text-white disabled:opacity-50 active:scale-95">
            {detecting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Navigation className="w-6 h-6" />}
          </button>
        </div>
      )}

      {tab === 'chats' && (
        <div className="pb-20 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
          <div className="max-w-lg mx-auto px-4 py-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center mb-3"><MessageSquare className="w-8 h-8 text-yellow-400" /></div>
              <h2 className={`${textPrimary} font-bold text-xl mb-2`}>{t('support', language)}</h2>
              <p className={textSecondary}>{t('supportDesc', language)}</p>
            </div>
            <button onClick={() => setShowChat(true)} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2">{t('startChat', language)}</button>
          </div>
        </div>
      )}

      {tab === 'profile' && (
        <div className="pb-20 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
          <div className="max-w-lg mx-auto px-4 py-6">
            {/* Avatar */}
            <div className="text-center mb-5">
              <img src={userProfile?.avatar_url} alt="" className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-yellow-400" />
              <h2 className={`${textPrimary} font-bold text-lg`}>{userProfile?.display_name}</h2>
              <p className={textSecondary}>@{userProfile?.username}</p>
              <div className="flex justify-center gap-0.5 mt-1">{Array.from({ length: 5 }, (_, i) => <span key={i}>{i < Math.floor(userProfile?.rating || 5) ? '⭐' : '☆'}</span>)}</div>
            </div>

            {/* Balance - HERE in profile */}
            <div className={`${cardBg} rounded-2xl p-5 border ${borderColor} mb-4`}>
              <div className="flex items-center gap-2 mb-3"><Wallet className="w-5 h-5 text-yellow-400" /><span className={`${textPrimary} font-semibold`}>{t('balance', language)}</span></div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div><p className={`${textSecondary} text-xs mb-1`}>⭐ {t('stars', language)}</p><p className="text-2xl font-bold text-yellow-400">{((userProfile?.balance || 0) * 10).toFixed(0)}</p></div>
                <div><p className={`${textSecondary} text-xs mb-1`}>💵 {t('usdt', language)}</p><p className="text-2xl font-bold text-green-400">{(userProfile?.balance || 0).toFixed(2)}</p></div>
              </div>
              <div className="flex items-center justify-between">
                <div className={`flex gap-3 text-xs ${textSecondary}`}><span>{userProfile?.rating || 5}/5 ⭐</span><span>•</span><span>{userProfile?.completed_tasks_as_executor || 0} {t('completed', language)}</span></div>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white text-xs font-medium"><ArrowUpRight className="w-3 h-3" />{t('withdraw', language)}</button>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-3">
              <button onClick={() => setDarkMode(!darkMode)} className={`w-full ${cardBg} rounded-xl p-4 flex items-center justify-between ${borderColor}`}>
                <div className="flex items-center gap-3">{darkMode ? <Moon className="w-5 h-5 text-yellow-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}<span className={textPrimary}>{darkMode ? t('darkMode', language) : t('lightMode', language)}</span></div>
                <div className={`w-10 h-5 rounded-full relative ${darkMode ? 'bg-yellow-500' : 'bg-gray-400'}`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${darkMode ? 'translate-x-5' : 'translate-x-0.5'}`} /></div>
              </button>
              <button onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')} className={`w-full ${cardBg} rounded-xl p-4 flex items-center justify-between ${borderColor}`}>
                <div className="flex items-center gap-3"><Globe className="w-5 h-5 text-yellow-400" /><span className={textPrimary}>{t('language', language)}</span></div>
                <span className="text-yellow-400 text-sm">{language === 'ru' ? 'English' : 'Русский'}</span>
              </button>
              <button onClick={() => setShowChat(true)} className={`w-full ${cardBg} rounded-xl p-4 flex items-center justify-between ${borderColor}`}>
                <div className="flex items-center gap-3"><MessageSquare className="w-5 h-5 text-yellow-400" /><span className={textPrimary}>{t('support', language)}</span></div>
                <ChevronRight className={`w-5 h-5 ${textSecondary}`} />
              </button>
              <button className={`w-full ${cardBg} rounded-xl p-4 flex items-center justify-between text-red-400 ${borderColor}`}>
                <div className="flex items-center gap-3"><LogOut className="w-5 h-5" /><span>{t('logout', language)}</span></div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {isCreateOpen && <CreateTaskModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreateTask={createTask} userPosition={userPosition} />}
      <SupportChat isOpen={showChat} onClose={() => setShowChat(false)} lang={language} />
      <TabBar activeTab={tab} onTabChange={setTab} unreadCount={unread} language={language} />
    </div>
  );
}

export default function HomePageWrapper() {
  return <LanguageProvider><HomeContent /></LanguageProvider>;
}
