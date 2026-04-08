"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Plus, Wallet, Bell, Search, TrendingUp, MapPin, Globe,
  Phone, MessageSquare, Star, Zap, Crown, Clock,
  Send, X, ChevronDown, Shield, CheckCircle, AlertCircle,
  ArrowUpRight, Copy, Users, Gift, AlertTriangle, Settings,
  LogOut, User, Camera, CreditCard, Navigation, Map,
  Filter, Repeat, AlertOctagon, BarChart3,
  ChevronRight, Edit3, Save, Loader2, Target, Sparkles,
  Sun, Moon, CreditCard as Card, Award, Package, Users2,
  TrendingDown, Hash, Calendar, Award as Trophy, ShieldCheck,
  Heart, ThumbsUp, MessageCircle, Volume2, VolumeX, Moon as MoonIcon,
  WifiOff, Wallet as WalletIcon
} from "lucide-react";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import CreateTaskModal from "@/components/CreateTaskModal";
import TaskFeed from "@/components/TaskFeed";
import TabBar from "@/components/TabBar";
import Splash from "@/components/Splash";
import { Task as TaskType, UserProfile as UserProfileType } from "@/types/task";
import { supabase } from "@/lib/supabase";

// ===== i18n =====
const i18n: Record<string, Record<string, any>> = {
  ru: {
    app: 'Pulse', subtitle: 'Маркетплейс услуг', balance: 'Ваши балансы', stars: 'Stars',
    usdt: 'USDT', withdraw: 'Вывести', search: 'Поиск задач...', categories: 'Категории',
    available: 'доступно', createTask: 'Создать заказ', recent: 'Последние заказы',
    support: 'Поддержка', supportDesc: 'Мы на связи 24/7', startChat: 'Начать чат',
    profile: 'Профиль', settings: 'Настройки', logout: 'Выйти', rating: 'Рейтинг',
    completed: 'задач', vip: 'VIP', inviteFriend: 'Пригласи друга',
    inviteDesc: '5 заказов друга = 12ч без комиссии', invited: 'Приглашено',
    tasks: 'Заказов', bonus: 'Бонус', referralLink: 'Реферальная ссылка',
    copied: 'Скопировано!', location: 'Местоположение', detecting: 'Определяю...',
    myOrders: 'Заказы', active: 'Активные', completedOrders: 'Завершённые',
    cancelled: 'Отменённые', repeat: 'Повторить', phone: 'Телефон',
    fullName: 'Полное имя', bio: 'О себе', save: 'Сохранить', cancel: 'Отмена',
    selfie: 'Селфи', passport: 'Паспорт', verified: 'Проверен',
    upload: 'Загрузить', comment: 'Комментарий', addComment: 'Добавить отзыв',
    aiChecking: 'AI проверяет...', reviewSubmitted: 'Отзыв отправлен',
    notifications: 'Уведомления', language: 'Язык', darkMode: 'Тёмная тема',
    sounds: 'Звуки', about: 'О приложении', help: 'Помощь',
    surge: 'Повышенный спрос', extremeSurge: '🔴 Экстремальный спрос',
    highSurge: '🟠 Высокий спрос', fee: 'Комиссия Pulse', youEarn: 'Вы получите',
    accept: 'Принять заказ', priorityPickup: '⚡ Быстрая подача',
    skipQueue: '👑 Без очереди', priorityDesc: 'Курьер приедет быстрее',
    vipPriority: 'VIP приоритет', customerContact: 'Контакт заказчика',
    contactHidden: 'Доступен после принятия', paymentDetails: 'Детали оплаты',
    noCommission: 'Без комиссии', promoActive: 'Промокод активен',
    orderHistory: 'История заказов', filterStatus: 'Фильтр', allOrders: 'Все',
    statistics: 'Статистика', earnings: 'Заработок', today: 'Сегодня',
    thisWeek: 'Неделя', thisMonth: 'Месяц', rank: 'Рейтинг',
    subscriptions: 'Подписки', monthlyVIP: 'Monthly VIP', vipDesc: 'Комиссия 5%',
    prioritySupport: 'Приоритетная поддержка', exclusiveOrders: 'Эксклюзивные заказы',
    subscribe: 'Подписаться', promos: 'Промокоды', firstOrder: 'Скидка на первый заказ',
    seasonal: 'Сезонные акции', complaints: 'Жалобы', report: 'Пожаловаться',
    reportDesc: 'Модерация админом', banned: 'Заблокирован', verification: 'Верификация',
    phoneVerify: 'Телефон', kyc: 'KYC', verifiedBadge: 'Бейдж', liveTracking: 'GPS',
    eta: 'Время прибытия', route: 'Маршрут', chatWithCourier: 'Чат с курьером',
    chatWithCustomer: 'Чат с заказчиком', messagePlaceholder: 'Сообщение...',
    send: 'Отправить', contactWarning: '⚠️ Обмен контактами запрещён!',
    noTasks: 'Заданий нет', loading: 'Загрузка...', error: 'Ошибка',
    success: 'Успешно', confirm: 'Подтвердить', close: 'Закрыть', back: 'Назад',
    next: 'Далее', skip: 'Пропустить', welcome: 'Добро пожаловать в Pulse!',
    howItWorks: 'Как это работает', createFirst: 'Создайте заказ',
    findCourier: 'Найдите курьера', paySecurely: 'Безопасная оплата',
    getStarted: 'Начать!', groupOrder: 'Групповой заказ', auction: 'Аукцион',
    subscribeCourier: 'Подписка на курьера', aiPrice: 'AI оценка',
    guarantee: 'Гарантия возврата', districtRank: 'Рейтинг районов',
    seasonalBonus: 'Сезонные бонусы', achievements: 'Достижения',
    lightMode: 'Светлая тема', offline: 'Оффлайн', cached: 'Кэшировано',
    myReviews: 'Мои отзывы', asExecutor: 'Как исполнитель', asCustomer: 'Как заказчик',
    totalEarned: 'Всего заработано', successRate: 'Успешность',
    responseTime: 'Время ответа', ordersPerDay: 'Заказов в день',
    topCourier: 'Топ курьер', fastDelivery: 'Быстрая доставка',
    reliable: 'Надёжный', fiveStars: '5 звёзд',
    cat_it: 'IT Услуги', cat_couriers: 'Курьеры', cat_household_services: 'Бытовые услуги',
    cat_marketing: 'Маркетинг', cat_delivery: 'Доставка', cat_cleaning: 'Уборка',
    cat_photo: 'Фото', cat_translation: 'Переводы', cat_tutoring: 'Репетиторство',
    cat_repair: 'Ремонт',
    home: 'Главная', feed: 'Лента', map: 'Карта', chats: 'Чаты',
    allTasks: 'Все заказы', filterBy: 'Фильтр',
  },
  en: {
    app: 'Pulse', subtitle: 'Service Marketplace', balance: 'Your Balances', stars: 'Stars',
    usdt: 'USDT', withdraw: 'Withdraw', search: 'Search tasks...', categories: 'Categories',
    available: 'available', createTask: 'Create Task', recent: 'Recent Orders',
    support: 'Support', supportDesc: 'We\'re online 24/7', startChat: 'Start Chat',
    profile: 'Profile', settings: 'Settings', logout: 'Logout', rating: 'Rating',
    completed: 'tasks', vip: 'VIP', inviteFriend: 'Invite a Friend',
    inviteDesc: 'Friend completes 5 tasks = 12h no fee', invited: 'Invited',
    tasks: 'Tasks', bonus: 'Bonus', referralLink: 'Referral Link',
    copied: 'Copied!', location: 'Location', detecting: 'Detecting...',
    myOrders: 'Orders', active: 'Active', completedOrders: 'Completed',
    cancelled: 'Cancelled', repeat: 'Repeat', phone: 'Phone',
    fullName: 'Full Name', bio: 'About', save: 'Save', cancel: 'Cancel',
    selfie: 'Selfie', passport: 'Passport', verified: 'Verified',
    upload: 'Upload', comment: 'Comment', addComment: 'Add Review',
    aiChecking: 'AI checking...', reviewSubmitted: 'Review submitted',
    notifications: 'Notifications', language: 'Language', darkMode: 'Dark Mode',
    sounds: 'Sounds', about: 'About', help: 'Help',
    surge: 'Elevated Demand', extremeSurge: '🔴 Extreme Demand',
    highSurge: '🟠 High Demand', fee: 'Pulse Fee', youEarn: 'You Earn',
    accept: 'Accept Task', priorityPickup: '⚡ Priority Pickup',
    skipQueue: '👑 Skip Queue', priorityDesc: 'Courier arrives faster',
    vipPriority: 'VIP priority', customerContact: 'Customer Contact',
    contactHidden: 'Available after accepting', paymentDetails: 'Payment Details',
    noCommission: 'No commission', promoActive: 'Promo active',
    orderHistory: 'Order History', filterStatus: 'Filter', allOrders: 'All',
    statistics: 'Statistics', earnings: 'Earnings', today: 'Today',
    thisWeek: 'Week', thisMonth: 'Month', rank: 'Rank',
    subscriptions: 'Subscriptions', monthlyVIP: 'Monthly VIP', vipDesc: '5% commission',
    prioritySupport: 'Priority Support', exclusiveOrders: 'Exclusive Orders',
    subscribe: 'Subscribe', promos: 'Promo Codes', firstOrder: 'First order discount',
    seasonal: 'Seasonal promotions', complaints: 'Complaints', report: 'Report',
    reportDesc: 'Admin moderation', banned: 'Banned', verification: 'Verification',
    phoneVerify: 'Phone', kyc: 'KYC', verifiedBadge: 'Badge', liveTracking: 'GPS',
    eta: 'ETA', route: 'Route', chatWithCourier: 'Chat with courier',
    chatWithCustomer: 'Chat with customer', messagePlaceholder: 'Message...',
    send: 'Send', contactWarning: '⚠️ Contact exchange prohibited!',
    noTasks: 'No tasks', loading: 'Loading...', error: 'Error',
    success: 'Success', confirm: 'Confirm', close: 'Close', back: 'Back',
    next: 'Next', skip: 'Skip', welcome: 'Welcome to Pulse!',
    howItWorks: 'How it works', createFirst: 'Create a task',
    findCourier: 'Find a courier', paySecurely: 'Secure payment',
    getStarted: 'Get Started!', groupOrder: 'Group Order', auction: 'Auction',
    subscribeCourier: 'Courier Subscription', aiPrice: 'AI Price Estimate',
    guarantee: 'Money Back Guarantee', districtRank: 'District Rankings',
    seasonalBonus: 'Seasonal Bonuses', achievements: 'Achievements',
    lightMode: 'Light Mode', offline: 'Offline', cached: 'Cached',
    myReviews: 'My Reviews', asExecutor: 'As Executor', asCustomer: 'As Customer',
    totalEarned: 'Total Earned', successRate: 'Success Rate',
    responseTime: 'Response Time', ordersPerDay: 'Orders/Day',
    topCourier: 'Top Courier', fastDelivery: 'Fast Delivery',
    reliable: 'Reliable', fiveStars: '5 Stars',
    cat_it: 'IT Services', cat_couriers: 'Couriers', cat_household_services: 'Household Services',
    cat_marketing: 'Marketing', cat_delivery: 'Delivery', cat_cleaning: 'Cleaning',
    cat_photo: 'Photo', cat_translation: 'Translation', cat_tutoring: 'Tutoring',
    cat_repair: 'Repair',
    home: 'Home', feed: 'Feed', map: 'Map', chats: 'Chats',
    allTasks: 'All Tasks', filterBy: 'Filter',
  }
};

const t = (key: string, lang: string) => i18n[lang]?.[key] || i18n.en[key] || key;

const CATEGORIES = [
  { value: 'it', icon: '💻' }, { value: 'couriers', icon: '🚴' },
  { value: 'household_services', icon: '🏠' }, { value: 'marketing', icon: '📊' },
  { value: 'delivery', icon: '📦' }, { value: 'cleaning', icon: '🧹' },
  { value: 'photo', icon: '📸' }, { value: 'translation', icon: '📝' },
  { value: 'tutoring', icon: '📚' }, { value: 'repair', icon: '🔧' },
];

const getCategoryLabel = (value: string, lang: string) => t(`cat_${value}`, lang);

const Loader = () => (
  <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-full border-4 border-yellow-400/20 border-t-yellow-400 animate-spin" />
      <p className="text-yellow-400 font-medium">Loading Pulse...</p>
    </div>
  </div>
);

const LiveTaskMap = dynamic(() => import("@/components/LiveTaskMap"), { ssr: false, loading: () => <Loader /> });

function LanguageSelector({ language, setLanguage }: { language: string; setLanguage: (l: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const langs = [{ code: 'ru', label: 'Русский', flag: '🇷' }, { code: 'en', label: 'English', flag: '🇬🇧' }];
  const current = langs.find(l => l.code === language) || langs[0];
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10">
        <Globe className="w-4 h-4 text-yellow-400" /><span className="text-sm text-white">{current.flag}</span>
      </button>
      {isOpen && (<>
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
        <div className="absolute right-0 top-full mt-2 w-40 bg-[#1a1f3a] rounded-xl overflow-hidden z-50 shadow-2xl border border-white/10">
          {langs.map(l => (<button key={l.code} onClick={() => { setLanguage(l.code); setIsOpen(false); }}
            className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 ${language === l.code ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-300 hover:bg-white/5'}`}>
            <span>{l.flag}</span><span>{l.label}</span>{language === l.code && <CheckCircle className="w-4 h-4 ml-auto" />}
          </button>))}
        </div>
      </>)}
    </div>
  );
}

function SupportChat({ isOpen, onClose, lang }: { isOpen: boolean; onClose: () => void; lang: string }) {
  const [messages, setMessages] = useState<{ text: string; isBot: boolean; time: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = lang === 'ru' ? 'Привет! Я из поддержки Pulse. Чем могу помочь? 😊' : 'Hi! I\'m from Pulse support. How can I help? 😊';
      setMessages([{ text: greeting, isBot: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }
  }, [isOpen, lang]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const re = /(\+?\d[\d\s\-()]{7,}\d|@\w+|t\.me\/\w+|telegram\.me|wa\.me|whatsapp|[\w.+-]+@[\w-]+\.[\w.]+)/gi;
    if (re.test(input)) return;
    setMessages(prev => [...prev, { text: input, isBot: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setInput(''); setIsTyping(true);
    const responses = lang === 'ru'
      ? { order: 'Понял ваш вопрос. Дайте пару минут, проверю статус.', payment: 'Оплата обычно 5-10 минут. Если дольше — напишите номер заказа.', problem: 'Опишите проблему подробнее?', default: 'Хорошо, понял. Уточню и вернусь.' }
      : { order: 'Got it. Let me check.', payment: 'Payment usually 5-10 min.', problem: 'Describe the issue?', default: 'Alright, let me check.' };
    const lower = input.toLowerCase();
    let cat = 'default';
    if (lower.includes('order') || lower.includes('заказ')) cat = 'order';
    if (lower.includes('pay') || lower.includes('оплат')) cat = 'payment';
    if (lower.includes('problem') || lower.includes('проблем')) cat = 'problem';
    setTimeout(() => {
      setMessages(prev => [...prev, { text: responses[cat as keyof typeof responses], isBot: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setIsTyping(false);
    }, 2000);
  };

  if (!isOpen) return null;

  return (<>
    <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
    <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
      <div className="bg-gradient-to-br from-[#1a1f3a] to-[#0a0a1a] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4 flex items-center justify-between">
          <div><p className="text-white font-bold">{t('support', lang)}</p></div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="h-80 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (<div key={i} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${m.isBot ? 'bg-white/5 text-gray-300' : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'}`}>
              <p className="text-sm">{m.text}</p>
            </div>
          </div>))}
          {isTyping && <div className="flex justify-start"><div className="bg-white/5 rounded-2xl px-4 py-3"><div className="flex gap-1"><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" /><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} /><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} /></div></div></div>}
          <div ref={endRef} />
        </div>
        <div className="p-4 border-t border-white/5">
          <div className="flex gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={t('messagePlaceholder', lang)} className="flex-1 bg-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none" />
            <button onClick={handleSend} className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl"><Send className="w-5 h-5 text-white" /></button>
          </div>
        </div>
      </div>
    </div>
  </>);
}

// ===== MAIN =====
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
  const [showSupport, setShowSupport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [profileSection, setProfileSection] = useState('overview');

  useEffect(() => {
    setIsClient(true);
    setTimeout(() => setShowSplash(false), 1500);
    loadUserProfile();
    loadTasks();
    detectLocation();
    window.addEventListener('offline', () => setIsOffline(true));
    window.addEventListener('online', () => setIsOffline(false));
    return () => { window.removeEventListener('offline', () => {}); window.removeEventListener('online', () => {}); };
  }, []);

  const detectLocation = () => {
    setIsDetecting(true);
    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => { setUserPosition([p.coords.latitude, p.coords.longitude]); setIsDetecting(false); },
        () => fetch('https://ipapi.co/json/').then(r => r.json()).then(d => d.latitude && setUserPosition([+d.latitude, +d.longitude])).finally(() => setIsDetecting(false))
      );
    } else setIsDetecting(false);
  };

  const loadUserProfile = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').limit(1).single();
      if (data && !error) setUserProfile({ ...data, rating: data.rating || 5 });
      else setUserProfile({
        id: 'new-user', username: 'PulseUser', display_name: language === 'ru' ? 'Пользователь' : 'User',
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

  const handleCreateTask = async (td: any) => {
    try {
      const { data } = await supabase.from('tasks').insert([{ ...td, customer_id: userProfile?.id, status: 'open', visibility: true, is_hidden: false }]).select().single();
      if (data) setTasks(prev => [{ ...data, reward: Number(data.reward), currency: data.currency, category: data.category, status: 'open', priority: data.priority || 'normal', is_hidden: false, reports_count: 0, visibility: true }, ...prev]);
      setIsCreateModalOpen(false);
    } catch (e) { console.error(e); }
  };

  const filteredTasks = selectedCategory ? tasks.filter(tk => tk.category === selectedCategory) : tasks;
  const searched = searchQuery ? filteredTasks.filter(tk => tk.title.toLowerCase().includes(searchQuery.toLowerCase()) || tk.description?.toLowerCase().includes(searchQuery.toLowerCase())) : filteredTasks;

  if (showSplash) return <Splash onFinish={() => setShowSplash(false)} />;
  if (!isClient) return <Loader />;

  // ===== HOME TAB =====
  const renderHome = () => (
    <div className="pb-24 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 65px)' }}>
      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center"><span className="text-xl">⚡</span></div>
            <div><h1 className="text-white font-bold">Pulse</h1><p className="text-gray-500 text-xs">{t('subtitle', language)}</p></div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector language={language} setLanguage={(l) => setLanguage(l as any)} />
            <button onClick={() => setShowSupport(true)} className="p-2 bg-white/5 rounded-xl"><MessageSquare className="w-5 h-5 text-gray-300" /></button>
          </div>
        </div>

        {/* Compact Search */}
        <div className="bg-white/5 rounded-xl px-4 py-3 flex items-center gap-3 mb-6">
          <Search className="w-4 h-4 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('search', language)} className="bg-transparent text-sm flex-1 outline-none text-white placeholder-gray-500" />
        </div>

        {/* Categories */}
        <h2 className="text-white font-bold text-lg mb-4">{t('categories', language)}</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {CATEGORIES.map(cat => (
            <button key={cat.value} onClick={() => setSelectedCategory(cat.value === selectedCategory ? null : cat.value)} type="button"
              className={`rounded-2xl p-4 text-left transition-all active:scale-[0.98] ${darkMode ? 'bg-white/5' : 'bg-gray-100'} ${selectedCategory === cat.value ? 'border-2 border-yellow-400 bg-yellow-500/10' : 'border-2 border-transparent'}`}>
              <div className="text-2xl mb-2">{cat.icon}</div>
              <div className="text-sm font-semibold text-white">{getCategoryLabel(cat.value, language)}</div>
              <div className="text-xs text-gray-500">{tasks.filter(tk => tk.category === cat.value).length} {t('available', language)}</div>
            </button>
          ))}
        </div>

        {/* Create Task Button */}
        <button onClick={() => setIsCreateModalOpen(true)} className="w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all mb-6">
          <Plus className="w-5 h-5" />{t('createTask', language)}
        </button>

        {/* Filter Indicator */}
        {selectedCategory && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
            <Filter className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-300">{t('filterBy', language)}: <span className="text-yellow-400 font-medium">{getCategoryLabel(selectedCategory, language)}</span></span>
            <button onClick={() => setSelectedCategory(null)} className="ml-auto text-gray-400"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Task List */}
        <div className="space-y-3">
          {searched.length === 0 ? (
            <div className="text-center py-12"><p className="text-gray-400">{t('noTasks', language)}</p></div>
          ) : searched.map(task => {
            const cat = CATEGORIES.find(c => c.value === task.category);
            return (
              <div key={task.id} className="bg-white/5 rounded-2xl p-4 border-2 border-transparent">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{cat?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-yellow-400">{getCategoryLabel(task.category, language)}</span>
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
    </div>
  );

  // ===== FEED TAB =====
  const renderFeed = () => (
    <div className="pb-24 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 65px)' }}>
      <TaskFeed isOpen={true} onClose={() => setActiveTab('home')} tasks={searched} userLatitude={userPosition[0]} userLongitude={userPosition[1]} onClaimTask={async (id) => { await supabase.from('tasks').update({ status: 'claimed', executor_id: userProfile?.id }).eq('id', id); loadTasks(); }} />
    </div>
  );

  // ===== MAP TAB =====
  const renderMap = () => (
    <div className="h-screen relative">
      <LiveTaskMap userPosition={userPosition} selectedCategory={selectedCategory || undefined} tasks={filteredTasks} />
      {/* Location Button */}
      <button onClick={detectLocation} disabled={isDetecting} className="absolute bottom-24 right-4 z-20 p-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-lg text-white disabled:opacity-50">
        {isDetecting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Navigation className="w-6 h-6" />}
      </button>
    </div>
  );

  // ===== CHATS TAB =====
  const renderChats = () => (
    <div className="pb-24 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 65px)' }}>
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center mb-4"><MessageSquare className="w-10 h-10 text-yellow-400" /></div>
          <h2 className="text-white font-bold text-xl mb-2">{t('support', language)}</h2>
          <p className="text-gray-400 text-sm">{t('supportDesc', language)}</p>
        </div>
        <button onClick={() => setShowSupport(true)} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2"><MessageSquare className="w-5 h-5" />{t('startChat', language)}</button>
      </div>
    </div>
  );

  // ===== PROFILE TAB =====
  const renderProfile = () => (
    <div className="pb-24 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 65px)' }}>
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Avatar */}
        <div className="text-center mb-6">
          <img src={userProfile?.avatar_url} alt="" className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-yellow-400" />
          <h2 className="text-white font-bold text-xl">{userProfile?.display_name}</h2>
          <p className="text-gray-400 text-sm">@{userProfile?.username}</p>
          <div className="flex justify-center gap-1 mt-2">{Array.from({ length: 5 }, (_, i) => <span key={i}>{i < Math.floor(userProfile?.rating || 5) ? '⭐' : '☆'}</span>)}</div>
        </div>

        {/* Balance Card - MOVED HERE */}
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl p-5 border border-yellow-500/20 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <WalletIcon className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-semibold">{t('balance', language)}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><p className="text-gray-500 text-xs mb-1">⭐ {t('stars', language)}</p><p className="text-2xl font-bold text-yellow-400">{((userProfile?.balance || 0) * 10).toFixed(0)}</p></div>
            <div><p className="text-gray-500 text-xs mb-1">💵 {t('usdt', language)}</p><p className="text-2xl font-bold text-green-400">{(userProfile?.balance || 0).toFixed(2)}</p></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-3 text-xs text-gray-400">
              <span>{userProfile?.rating || 5}/5 ⭐</span>
              <span>•</span>
              <span>{userProfile?.completed_tasks_as_executor || 0} {t('completed', language)}</span>
            </div>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white text-xs font-medium"><ArrowUpRight className="w-3 h-3" />{t('withdraw', language)}</button>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-3">
          <button onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')} className="w-full bg-white/5 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3"><Globe className="w-5 h-5 text-yellow-400" /><span className="text-white">{t('language', language)}</span></div>
            <span className="text-yellow-400 text-sm">{language === 'ru' ? 'English' : 'Русский'}</span>
          </button>
          <button onClick={() => setShowSupport(true)} className="w-full bg-white/5 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3"><MessageSquare className="w-5 h-5 text-yellow-400" /><span className="text-white">{t('support', language)}</span></div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button className="w-full bg-white/5 rounded-xl p-4 flex items-center justify-between text-red-400">
            <div className="flex items-center gap-3"><LogOut className="w-5 h-5" /><span>{t('logout', language)}</span></div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-yellow-500/[0.03] rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-orange-500/[0.03] rounded-full blur-[100px]" />
      </div>

      {/* Offline Banner */}
      {isOffline && <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500/20 px-4 py-2 text-center">
        <p className="text-orange-400 text-sm flex items-center justify-center gap-2"><WifiOff className="w-4 h-4" />{language === 'ru' ? 'Оффлайн' : 'Offline'}</p>
      </div>}

      {/* Tab Content */}
      {activeTab === 'home' && renderHome()}
      {activeTab === 'feed' && renderFeed()}
      {activeTab === 'map' && renderMap()}
      {activeTab === 'chats' && renderChats()}
      {activeTab === 'profile' && renderProfile()}

      {/* Modals */}
      {isCreateModalOpen && <CreateTaskModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreateTask={handleCreateTask} userPosition={userPosition} />}
      <SupportChat isOpen={showSupport} onClose={() => setShowSupport(false)} lang={language} />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} unreadCount={unreadCount} language={language} />
    </div>
  );
}

export default function HomePageWrapper() {
  return <LanguageProvider><HomeContent /></LanguageProvider>;
}
