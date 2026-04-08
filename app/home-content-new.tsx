"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Plus, Wallet, Bell, Search, TrendingUp, MapPin, Globe,
  Phone, MessageSquare, Star, Zap, Crown, Clock,
  Send, X, ChevronDown, Shield, CheckCircle, AlertCircle,
  ArrowUpRight, Copy, Users, Gift, AlertTriangle, Settings,
  LogOut, User, Camera, CreditCard, Navigation, Map,
  Filter, Repeat, AlertOctagon, Gift as GiftIcon, BarChart3,
  ChevronRight, Edit3, Save, Loader2, Target, Sparkles
} from "lucide-react";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import CreateTaskModal from "@/components/CreateTaskModal";
import TaskFeed from "@/components/TaskFeed";
import TabBar from "@/components/TabBar";
import Splash from "@/components/Splash";
import { Task as TaskType, UserProfile as UserProfileType, CATEGORIES } from "@/types/task";
import { supabase } from "@/lib/supabase";

// Translation helper - ВСЁ на русском при выборе RU
const i18n = {
  ru: {
    app: 'Pulse',
    subtitle: 'Маркетплейс услуг',
    balance: 'Ваши балансы',
    stars: 'Stars',
    usdt: 'USDT',
    withdraw: 'Вывести',
    search: 'Поиск задач...',
    categories: 'Категории',
    available: 'доступно',
    createTask: 'Создать заказ',
    recent: 'Последние',
    support: 'Поддержка',
    supportDesc: 'Поддержка на русском и английском',
    startChat: 'Начать чат',
    profile: 'Профиль',
    settings: 'Настройки',
    logout: 'Выйти',
    rating: 'Рейтинг',
    completed: 'задач',
    vip: 'VIP',
    inviteFriend: 'Пригласи друга',
    inviteDesc: '5 заказов друга = 12ч без комиссии',
    invited: 'Приглашено',
    tasks: 'Заказов',
    bonus: 'Бонус',
    referralLink: 'Реферальная ссылка',
    copied: 'Скопировано!',
    location: 'Местоположение',
    detecting: 'Определяю...',
    myOrders: 'Мои заказы',
    active: 'Активные',
    completedOrders: 'Завершённые',
    cancelled: 'Отменённые',
    repeat: 'Повторить',
    phone: 'Телефон',
    phonePlaceholder: '+996 ___ ___ ___',
    fullName: 'Полное имя',
    bio: 'О себе',
    save: 'Сохранить',
    cancel: 'Отмена',
    selfie: 'Селфи',
    passport: 'Паспортные данные',
    verified: 'Проверен',
    notVerified: 'Не проверен',
    upload: 'Загрузить',
    comment: 'Комментарий',
    addComment: 'Добавить отзыв',
    aiChecking: 'AI проверяет отзыв...',
    reviewSubmitted: 'Отзыв отправлен',
    notifications: 'Уведомления',
    language: 'Язык',
    darkMode: 'Тёмная тема',
    sounds: 'Звуки',
    about: 'О приложении',
    help: 'Помощь',
    surge: 'Повышенный спрос',
    extremeSurge: 'Экстремальный спрос',
    highSurge: 'Высокий спрос',
    fee: 'Комиссия Pulse',
    youEarn: 'Вы получите',
    accept: 'Принять заказ',
    priorityPickup: 'Быстрая подача',
    skipQueue: 'Без очереди',
    priorityDesc: 'Курьер приедет быстрее',
    vipPriority: 'VIP приоритет',
    customerContact: 'Контакт заказчика',
    contactHidden: 'Доступен после принятия',
    paymentDetails: 'Детали оплаты',
    noCommission: 'Без комиссии',
    promoActive: 'Промокод активен',
    promoExpired: 'Промокод истёк',
    orderHistory: 'История заказов',
    filterStatus: 'Фильтр по статусу',
    allOrders: 'Все заказы',
    statistics: 'Статистика',
    earnings: 'Заработок',
    today: 'Сегодня',
    thisWeek: 'На этой неделе',
    thisMonth: 'В этом месяце',
    rank: 'Рейтинг среди курьеров',
    subscriptions: 'Подписки',
    monthlyVIP: 'Monthly VIP',
    vipDesc: 'Сниженная комиссия 5%',
    prioritySupport: 'Приоритетная поддержка',
    exclusiveOrders: 'Эксклюзивные заказы',
    subscribe: 'Подписаться',
    promos: 'Промокоды',
    firstOrder: 'Скидка на первый заказ',
    seasonal: 'Сезонные акции',
    complaints: 'Жалобы',
    report: 'Пожаловаться',
    reportDesc: 'Модерация админом',
    banned: 'Заблокирован',
    verification: 'Верификация',
    phoneVerify: 'Подтверждение телефона',
    kyc: 'KYC для курьеров',
    verifiedBadge: 'Бейдж "Проверен"',
    liveTracking: 'GPS трекинг',
    eta: 'Время прибытия',
    route: 'Маршрут',
    chatWithCourier: 'Чат с курьером',
    chatWithCustomer: 'Чат с заказчиком',
    messagePlaceholder: 'Введите сообщение...',
    send: 'Отправить',
    contactWarning: '⚠️ Обмен контактами запрещён до принятия заказа!',
    noTasks: 'Заданий не найдено',
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успешно',
    confirm: 'Подтвердить',
    close: 'Закрыть',
    back: 'Назад',
    next: 'Далее',
    skip: 'Пропустить',
    welcome: 'Добро пожаловать в Pulse!',
    howItWorks: 'Как это работает',
    createFirst: 'Создайте первый заказ',
    findCourier: 'Найдите курьера',
    paySecurely: 'Безопасная оплата',
    getStarted: 'Начать!',
  },
  en: {
    app: 'Pulse',
    subtitle: 'Service Marketplace',
    balance: 'Your Balances',
    stars: 'Stars',
    usdt: 'USDT',
    withdraw: 'Withdraw',
    search: 'Search tasks...',
    categories: 'Categories',
    available: 'available',
    createTask: 'Create Task',
    recent: 'Recent',
    support: 'Support',
    supportDesc: 'Support in Russian and English',
    startChat: 'Start Chat',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    rating: 'Rating',
    completed: 'tasks',
    vip: 'VIP',
    inviteFriend: 'Invite a Friend',
    inviteDesc: 'Friend completes 5 tasks = 12h no fee',
    invited: 'Invited',
    tasks: 'Tasks',
    bonus: 'Bonus',
    referralLink: 'Referral Link',
    copied: 'Copied!',
    location: 'Location',
    detecting: 'Detecting...',
    myOrders: 'My Orders',
    active: 'Active',
    completedOrders: 'Completed',
    cancelled: 'Cancelled',
    repeat: 'Repeat',
    phone: 'Phone',
    phonePlaceholder: '+996 ___ ___ ___',
    fullName: 'Full Name',
    bio: 'About',
    save: 'Save',
    cancel: 'Cancel',
    selfie: 'Selfie',
    passport: 'Passport Data',
    verified: 'Verified',
    notVerified: 'Not Verified',
    upload: 'Upload',
    comment: 'Comment',
    addComment: 'Add Review',
    aiChecking: 'AI checking review...',
    reviewSubmitted: 'Review submitted',
    notifications: 'Notifications',
    language: 'Language',
    darkMode: 'Dark Mode',
    sounds: 'Sounds',
    about: 'About',
    help: 'Help',
    surge: 'Elevated Demand',
    extremeSurge: 'Extreme Demand',
    highSurge: 'High Demand',
    fee: 'Pulse Fee',
    youEarn: 'You Earn',
    accept: 'Accept Task',
    priorityPickup: 'Priority Pickup',
    skipQueue: 'Skip Queue',
    priorityDesc: 'Courier arrives faster',
    vipPriority: 'VIP priority',
    customerContact: 'Customer Contact',
    contactHidden: 'Available after accepting',
    paymentDetails: 'Payment Details',
    noCommission: 'No commission',
    promoActive: 'Promo active',
    promoExpired: 'Promo expired',
    orderHistory: 'Order History',
    filterStatus: 'Filter by status',
    allOrders: 'All Orders',
    statistics: 'Statistics',
    earnings: 'Earnings',
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    rank: 'Rank among couriers',
    subscriptions: 'Subscriptions',
    monthlyVIP: 'Monthly VIP',
    vipDesc: 'Reduced 5% commission',
    prioritySupport: 'Priority Support',
    exclusiveOrders: 'Exclusive Orders',
    subscribe: 'Subscribe',
    promos: 'Promo Codes',
    firstOrder: 'First order discount',
    seasonal: 'Seasonal promotions',
    complaints: 'Complaints',
    report: 'Report',
    reportDesc: 'Admin moderation',
    banned: 'Banned',
    verification: 'Verification',
    phoneVerify: 'Phone verification',
    kyc: 'KYC for couriers',
    verifiedBadge: '"Verified" badge',
    liveTracking: 'GPS Tracking',
    eta: 'ETA',
    route: 'Route',
    chatWithCourier: 'Chat with courier',
    chatWithCustomer: 'Chat with customer',
    messagePlaceholder: 'Type a message...',
    send: 'Send',
    contactWarning: '⚠️ Contact exchange prohibited before accepting!',
    noTasks: 'No tasks found',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    skip: 'Skip',
    welcome: 'Welcome to Pulse!',
    howItWorks: 'How it works',
    createFirst: 'Create your first task',
    findCourier: 'Find a courier',
    paySecurely: 'Secure payment',
    getStarted: 'Get Started!',
  }
};

const t = (key: string, lang: string) => i18n[lang as keyof typeof i18n]?.[key as keyof (typeof i18n)['ru']] || key;

// Loader
const Loader = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0f1729] to-[#0a0a1a] flex items-center justify-center">
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
    { code: 'ru', label: 'Русский', flag: '🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
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

// Contact Protection
function protectContact(text: string): { safe: boolean; warning: string } {
  const phoneRe = /(\+?\d[\d\s\-()]{7,}\d)/g;
  const tgRe = /(@\w+|t\.me\/\w+|telegram\.me\/\w+)/gi;
  const waRe = /(wa\.me\/\d+|whatsapp\.com)/gi;
  const emailRe = /[\w.+-]+@[\w-]+\.[\w.]+/g;

  if (phoneRe.test(text) || tgRe.test(text) || waRe.test(text) || emailRe.test(text)) {
    return { safe: false, warning: '⚠️ Обмен контактами запрещён до принятия заказа!' };
  }
  return { safe: true, warning: '' };
}

// AI Chat Bot - отвечает как человек за 1-2 минуты
function useAIChat(lang: string) {
  const responses = useMemo(() => ({
    ru: {
      greeting: 'Привет! Я из поддержки Pulse. Чем могу помочь? 😊',
      thinking: ['Сейчас посмотрю...', 'Дайте секунду...', 'Проверяю информацию...', 'Так, сейчас разберёмся...'],
      answers: {
        'order': 'Понял ваш вопрос по заказу. Дайте мне пару минут, проверю статус и напишу вам.',
        'payment': 'По оплате — обычно зачисление происходит в течение 5-10 минут. Если дольше — напишите номер заказа, я проверю.',
        'problem': 'Опишите проблему подробнее? Я постараюсь помочь прямо сейчас.',
        'default': 'Хорошо, я понял. Сейчас уточню у коллег и вернусь с ответом. Это займёт буквально пару минут.',
      }
    },
    en: {
      greeting: 'Hi! I\'m from Pulse support. How can I help? 😊',
      thinking: ['Let me check...', 'Give me a sec...', 'Looking into it...', 'Alright, let\'s figure this out...'],
      answers: {
        'order': 'Got your question about the order. Let me check the status and get back to you in a few minutes.',
        'payment': 'Regarding payment — usually it processes within 5-10 minutes. If longer, send me the order number.',
        'problem': 'Could you describe the issue in more detail? I\'ll try to help right away.',
        'default': 'Alright, I understand. Let me check with the team and get back to you. Just a couple minutes.',
      }
    }
  }), [lang]);

  const getAIResponse = useCallback((userMsg: string): { response: string; delay: number; needsAdmin: boolean } => {
    const msg = userMsg.toLowerCase();
    let category = 'default';
    let needsAdmin = false;

    if (msg.includes('order') || msg.includes('заказ') || msg.includes('task')) category = 'order';
    if (msg.includes('pay') || msg.includes('оплат') || msg.includes('money') || msg.includes('stars') || msg.includes('usdt')) category = 'payment';
    if (msg.includes('problem') || msg.includes('проблем') || msg.includes('error') || msg.includes('bug')) { category = 'problem'; needsAdmin = true; }
    if (msg.includes('complaint') || msg.includes('жалоб') || msg.includes('report')) needsAdmin = true;

    const thinking = responses[lang as keyof typeof responses]?.thinking || responses.en.thinking;
    const answer = (responses[lang as keyof typeof responses]?.answers || responses.en.answers)[category as keyof typeof responses.en.answers];
    const delay = 60000 + Math.random() * 60000; // 1-2 minutes like a real person

    return { response: answer, delay, needsAdmin };
  }, [lang, responses]);

  return { getAIResponse, responses };
}

// Settings Panel
function SettingsPanel({ isOpen, onClose, lang }: { isOpen: boolean; onClose: () => void; lang: string }) {
  const [darkMode, setDarkMode] = useState(true);
  const [sounds, setSounds] = useState(true);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-50">
        <div className="bg-gradient-to-br from-[#1a1f3a] to-[#0a0a1a] rounded-3xl p-6 border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-bold text-xl">{t('settings', lang)}</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X className="w-6 h-6 text-gray-400" /></button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-yellow-400" />
                <span className="text-white">{t('language', lang)}</span>
              </div>
              <span className="text-gray-400">{lang === 'ru' ? 'Русский' : 'English'}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-yellow-400" />
                <span className="text-white">{t('notifications', lang)}</span>
              </div>
              <div className="w-12 h-6 bg-yellow-500 rounded-full relative cursor-pointer" onClick={() => setDarkMode(!darkMode)}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-white">{t('sounds', lang)}</span>
              </div>
              <div className="w-12 h-6 bg-yellow-500 rounded-full relative cursor-pointer" onClick={() => setSounds(!sounds)}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${sounds ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-yellow-400" />
                <span className="text-white">{t('about', lang)}</span>
              </div>
              <span className="text-gray-400">v2.0</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Support Chat with AI
function SupportChat({ isOpen, onClose, lang }: { isOpen: boolean; onClose: () => void; lang: string }) {
  const { getAIResponse, responses } = useAIChat(lang);
  const [messages, setMessages] = useState<{ text: string; isBot: boolean; time: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = responses[lang as keyof typeof responses]?.greeting || responses.en.greeting;
      setMessages([{ text: greeting, isBot: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }
  }, [isOpen, lang, responses]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const protection = protectContact(input);
    if (!protection.safe) return;

    const userMsg = { text: input, isBot: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const { response, delay, needsAdmin } = getAIResponse(input);

    setTimeout(() => {
      const botMsg = { text: response, isBot: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);

      if (needsAdmin) {
        setTimeout(() => {
          const adminMsg = {
            text: lang === 'ru'
              ? 'Передал ваш вопрос администратору. Он свяжется с вами в течение 10 минут.'
              : 'Forwarded your question to admin. They\'ll contact you within 10 minutes.',
            isBot: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, adminMsg]);
        }, 3000);
      }
    }, 3000 + Math.random() * 2000);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
        <div className="bg-gradient-to-br from-[#1a1f3a] to-[#0a0a1a] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold">{t('support', lang)}</p>
                <p className="text-green-400 text-xs flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full" />{lang === 'ru' ? 'Онлайн' : 'Online'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <div className="h-80 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${msg.isBot ? 'bg-white/5 text-gray-300 rounded-bl-md' : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-br-md'}`}>
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-[10px] opacity-50 mt-1">{msg.time}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 rounded-2xl px-4 py-3 rounded-bl-md">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="p-4 border-t border-white/5">
            <div className="flex gap-2">
              <input
                type="text" value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('messagePlaceholder', lang)}
                className="flex-1 bg-white/5 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 outline-none focus:ring-2 focus:ring-yellow-400/50"
              />
              <button onClick={handleSend} className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Real Profile Editor
function ProfileEditor({ user, onSave, lang }: { user: UserProfileType | null; onSave: (data: Partial<UserProfileType>) => void; lang: string }) {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.display_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState('');
  const [selfieUploaded, setSelfieUploaded] = useState(false);
  const [passportUploaded, setPassportUploaded] = useState(false);

  const handleSave = () => {
    onSave({ display_name: name, bio });
    setEditMode(false);
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold">{t('profile', lang)}</h3>
        <button onClick={() => setEditMode(!editMode)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10">
          <Edit3 className="w-4 h-4 text-yellow-400" />
        </button>
      </div>

      {editMode ? (
        <div className="space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('fullName', lang)}
            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 outline-none focus:ring-2 focus:ring-yellow-400/50" />
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder={t('bio', lang)} rows={3}
            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 outline-none resize-none" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('phonePlaceholder', lang)}
            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 outline-none" />
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-xl font-medium">
              {t('save', lang)}
            </button>
            <button onClick={() => setEditMode(false)} className="px-4 bg-white/5 text-gray-400 rounded-xl">{t('cancel', lang)}</button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-white font-medium">{user.display_name}</p>
          <p className="text-gray-400 text-sm">{user.bio}</p>
          {(user as any).phone && <p className="text-gray-400 text-sm flex items-center gap-2"><Phone className="w-4 h-4" />{(user as any).phone}</p>}
        </div>
      )}

      {/* Verification */}
      <div className="bg-white/5 rounded-xl p-4 space-y-3">
        <h4 className="text-white text-sm font-medium">{t('verification', lang)}</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <Camera className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-white text-sm">{t('selfie', lang)}</p>
                <p className="text-gray-500 text-xs">{t('verifiedBadge', lang)}</p>
              </div>
            </div>
            {selfieUploaded ? <CheckCircle className="w-5 h-5 text-green-400" /> : <button className="text-yellow-400 text-xs">{t('upload', lang)}</button>}
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-white text-sm">{t('passport', lang)}</p>
                <p className="text-gray-500 text-xs">KYC</p>
              </div>
            </div>
            {passportUploaded ? <CheckCircle className="w-5 h-5 text-green-400" /> : <button className="text-yellow-400 text-xs">{t('upload', lang)}</button>}
          </div>
        </div>
        {(selfieUploaded || passportUploaded) && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400 text-sm">{t('verified', lang)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Order History
function OrderHistory({ lang, userId }: { lang: string; userId: string }) {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  const mockOrders = [
    { id: '1', title: 'Доставка документов', status: 'completed', date: '2026-04-05', reward: 5 },
    { id: '2', title: 'Настройка роутера', status: 'active', date: '2026-04-07', reward: 15 },
    { id: '3', title: 'Уборка квартиры', status: 'cancelled', date: '2026-04-03', reward: 10 },
  ];

  const filtered = filter === 'all' ? mockOrders : mockOrders.filter(o => o.status === filter);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: t('allOrders', lang) },
          { key: 'active', label: t('active', lang) },
          { key: 'completed', label: t('completedOrders', lang) },
          { key: 'cancelled', label: t('cancelled', lang) },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key as any)}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap ${filter === f.key ? 'bg-yellow-500 text-black' : 'bg-white/5 text-gray-400'}`}>
            {f.label}
          </button>
        ))}
      </div>
      {filtered.map(order => (
        <div key={order.id} className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-white text-sm font-medium">{order.title}</h4>
            <span className={`px-2 py-1 rounded-full text-xs ${
              order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
              order.status === 'active' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {order.status === 'completed' ? '✓' : order.status === 'active' ? '⏳' : '✕'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{order.date}</span>
            <span className="text-yellow-400">{order.reward} USDT</span>
          </div>
          {order.status === 'completed' && (
            <button className="mt-2 w-full py-2 bg-white/5 rounded-lg text-yellow-400 text-xs flex items-center justify-center gap-1">
              <Repeat className="w-3 h-3" />{t('repeat', lang)}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// Statistics Panel
function StatisticsPanel({ lang }: { lang: string }) {
  const stats = {
    today: { earned: 45, tasks: 3 },
    week: { earned: 280, tasks: 18 },
    month: { earned: 1250, tasks: 89 },
    rank: 12,
    totalCouriers: 500,
  };

  return (
    <div className="space-y-4">
      <h3 className="text-white font-bold">{t('statistics', lang)}</h3>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-yellow-400 font-bold text-lg">{stats.today.earned}</p>
          <p className="text-gray-500 text-xs">{t('today', lang)}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-yellow-400 font-bold text-lg">{stats.week.earned}</p>
          <p className="text-gray-500 text-xs">{t('thisWeek', lang)}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-yellow-400 font-bold text-lg">{stats.month.earned}</p>
          <p className="text-gray-500 text-xs">{t('thisMonth', lang)}</p>
        </div>
      </div>
      <div className="bg-white/5 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">{t('rank', lang)}</span>
          <span className="text-yellow-400 font-bold">#{stats.rank}/{stats.totalCouriers}</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full" style={{ width: `${((stats.totalCouriers - stats.rank) / stats.totalCouriers) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

// User Reviews with AI check
function UserReviews({ userId, lang }: { userId: string; lang: string }) {
  const [reviews, setReviews] = useState<{ user: string; rating: number; text: string; aiChecked: boolean }[]>([
    { user: 'Мария К.', rating: 5, text: 'Отличный курьер, доставил быстро!', aiChecked: true },
    { user: 'Алексей П.', rating: 4, text: 'Всё хорошо, немного опоздал.', aiChecked: true },
  ]);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [aiChecking, setAiChecking] = useState(false);

  const handleSubmitReview = () => {
    if (!newReview.trim()) return;
    setAiChecking(true);

    // Simulate AI check
    setTimeout(() => {
      setReviews(prev => [...prev, { user: 'Вы', rating: newRating, text: newReview, aiChecked: true }]);
      setNewReview('');
      setAiChecking(false);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-white font-bold">{lang === 'ru' ? 'Отзывы' : 'Reviews'}</h3>
      {reviews.map((r, i) => (
        <div key={i} className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-medium">{r.user}</span>
              {r.aiChecked && <Sparkles className="w-4 h-4 text-yellow-400" />}
            </div>
            <div className="flex gap-0.5">{Array.from({ length: 5 }, (_, j) => <span key={j}>{j < r.rating ? '⭐' : '☆'}</span>)}</div>
          </div>
          <p className="text-gray-400 text-sm">{r.text}</p>
        </div>
      ))}
      <div className="bg-white/5 rounded-xl p-4">
        <div className="flex gap-1 mb-3">
          {Array.from({ length: 5 }, (_, i) => (
            <button key={i} onClick={() => setNewRating(i + 1)} className="text-xl">{i < newRating ? '⭐' : '☆'}</button>
          ))}
        </div>
        <textarea value={newReview} onChange={(e) => setNewReview(e.target.value)}
          placeholder={t('addComment', lang)} rows={3}
          className="w-full bg-white/5 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 outline-none resize-none mb-2" />
        <button onClick={handleSubmitReview} disabled={aiChecking || !newReview.trim()}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2">
          {aiChecking ? <><Loader2 className="w-4 h-4 animate-spin" />{t('aiChecking', lang)}</> : t('addComment', lang)}
        </button>
      </div>
    </div>
  );
}

// Main Home Content
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
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileTab, setProfileTab] = useState<'profile' | 'orders' | 'stats' | 'reviews' | 'settings'>('profile');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const surgeMultiplier = useMemo(() => {
    if (tasks.length === 0) return 1;
    const nearby = tasks.filter(tk => Math.sqrt(Math.pow(tk.latitude - userPosition[0], 2) + Math.pow(tk.longitude - userPosition[1], 2)) * 111 < 5).length;
    return nearby > 10 ? 2 : nearby > 5 ? 1.5 : 1;
  }, [tasks, userPosition]);

  useEffect(() => {
    setIsClient(true);
    setTimeout(() => setShowSplash(false), 2000);
    loadUserProfile();
    loadTasks();
  }, []);

  const loadUserProfile = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').limit(1).single();
      if (data && !error) {
        setUserProfile({ ...data, rating: data.rating || 5 });
      } else {
        // Fallback: new user with 5-star rating
        setUserProfile({
          id: 'new-user', username: 'PulseUser',
          display_name: language === 'ru' ? 'Пользователь' : 'User',
          avatar_url: 'https://i.pravatar.cc/150?img=12',
          bio: '', balance: 0, rating: 5, total_reviews: 0,
          completed_tasks_as_executor: 0, completed_tasks_as_customer: 0,
          is_verified: false, is_banned: false, vip_status: 'none',
          language, country: '',
          created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        } as UserProfileType);
      }
    } catch (e) {
      console.error(e);
    }
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

  const detectLocation = () => {
    setIsDetectingLocation(true);
    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          setUserPosition([p.coords.latitude, p.coords.longitude]);
          setIsDetectingLocation(false);
        },
        () => {
          fetch('https://ipapi.co/json/').then(r => r.json()).then(d => d.latitude && setUserPosition([+d.latitude, +d.longitude])).finally(() => setIsDetectingLocation(false));
        }
      );
    } else {
      setIsDetectingLocation(false);
    }
  };

  const filtered = selectedCategory ? tasks.filter(tk => tk.category === selectedCategory) : tasks;
  const searched = searchQuery ? filtered.filter(tk => tk.title.toLowerCase().includes(searchQuery.toLowerCase()) || tk.description?.toLowerCase().includes(searchQuery.toLowerCase())) : filtered;

  // ===== RENDER =====
  if (showSplash) return <Splash onFinish={() => setShowSplash(false)} />;
  if (!isClient) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0f1729] to-[#0a0a1a]">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-yellow-500/[0.03] rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-orange-500/[0.03] rounded-full blur-[100px]" />
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-blue-500/[0.02] rounded-full blur-[80px]" />
      </div>

      {/* HOME TAB */}
      {activeTab === 'home' && (
        <div className="relative pb-24">
          <div className="sticky top-0 z-30 backdrop-blur-xl bg-[#0a0a1a]/90 border-b border-white/5">
            <div className="max-w-lg mx-auto px-4 py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <h1 className="text-white font-bold text-lg">Pulse</h1>
                    <p className="text-gray-400 text-xs">{t('subtitle', language)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <LanguageSelector language={language} setLanguage={(l) => setLanguage(l as any)} />
                  <button className="relative p-2.5 bg-white/5 rounded-xl hover:bg-white/10"><Bell className="w-5 h-5 text-gray-300" />{unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">{unreadCount}</span>}</button>
                  <button onClick={() => setShowSupport(true)} className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10"><MessageSquare className="w-5 h-5 text-gray-300" /></button>
                </div>
              </div>

              {/* Balance */}
              <div className="relative overflow-hidden bg-white/5 rounded-2xl p-5 mb-4 border border-white/5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2"><Wallet className="w-5 h-5 text-yellow-400" /><span className="text-gray-400 text-sm">{t('balance', language)}</span></div>
                    {userProfile?.vip_status !== 'none' && <span className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded-full"><Crown className="w-3 h-3 text-purple-400" /><span className="text-purple-400 text-xs">{t('vip', language)}</span></span>}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">⭐ {t('stars', language)}</p>
                      <p className="text-2xl font-bold text-yellow-400">{((userProfile?.balance || 0) * 10).toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">💵 {t('usdt', language)}</p>
                      <p className="text-2xl font-bold text-green-400">{(userProfile?.balance || 0).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3 text-xs">
                      <span className="text-gray-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" />{userProfile?.rating || 5}/5 ⭐</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400">{userProfile?.completed_tasks_as_executor || 0} {t('completed', language)}</span>
                    </div>
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white text-xs font-medium">
                      <ArrowUpRight className="w-3 h-3" />{t('withdraw', language)}
                    </button>
                  </div>
                </div>
              </div>

              {/* Surge */}
              {surgeMultiplier > 1 && (
                <div className={`rounded-xl p-3 mb-4 flex items-center justify-between ${surgeMultiplier >= 2 ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/20' : 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/20'}`}>
                  <div className="flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400 animate-pulse" /><span className="text-white font-bold text-sm">{surgeMultiplier >= 2 ? t('extremeSurge', language) : t('highSurge', language)}</span></div>
                  <span className="text-yellow-400 text-xs">×{surgeMultiplier.toFixed(1)}</span>
                </div>
              )}

              {/* Search */}
              <div className="bg-white/5 rounded-xl px-4 py-3 flex items-center gap-3">
                <Search className="w-4 h-4 text-gray-400" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search', language)} className="bg-transparent text-sm flex-1 outline-none text-white placeholder-gray-500" />
              </div>
            </div>
          </div>

          <div className="max-w-lg mx-auto px-4 py-6">
            <h2 className="text-white font-bold text-lg mb-4">{t('categories', language)}</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {CATEGORIES.map(cat => (
                <div key={cat.value} onClick={() => { setSelectedCategory(cat.value === selectedCategory ? null : cat.value); setActiveTab('feed'); }}
                  className={`group bg-white/5 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] ${selectedCategory === cat.value ? 'border-yellow-400 shadow-lg shadow-yellow-500/20' : 'border-transparent hover:border-white/10'}`}>
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
                  <div className="text-sm font-semibold text-white mb-1">{cat.label}</div>
                  <div className="text-xs text-gray-500">{tasks.filter(tk => tk.category === cat.value).length} {t('available', language)}</div>
                </div>
              ))}
            </div>

            <button onClick={() => setIsCreateModalOpen(true)}
              className="w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-yellow-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Plus className="w-5 h-5" />{t('createTask', language)}
            </button>

            {searched.length > 0 && (
              <div className="mt-8">
                <h3 className="text-white font-bold text-lg mb-4">{t('recent', language)}</h3>
                <div className="space-y-3">
                  {searched.slice(0, 5).map(task => {
                    const cat = CATEGORIES.find(c => c.value === task.category);
                    return (
                      <div key={task.id} className="bg-white/5 rounded-2xl p-4 cursor-pointer hover:border-yellow-400/50 border border-transparent transition-all">
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

      {/* FEED */}
      {activeTab === 'feed' && <TaskFeed isOpen={true} onClose={() => setActiveTab('home')} tasks={searched} userLatitude={userPosition[0]} userLongitude={userPosition[1]} onClaimTask={async (id) => { await supabase.from('tasks').update({ status: 'claimed', executor_id: userProfile?.id }).eq('id', id); loadTasks(); }} />}

      {/* MAP */}
      {activeTab === 'map' && (
        <div className="h-screen relative">
          <LiveTaskMap userPosition={userPosition} selectedCategory={selectedCategory || undefined} tasks={filtered} />
          <button onClick={detectLocation} disabled={isDetectingLocation}
            className="absolute bottom-24 right-4 z-20 p-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-lg shadow-yellow-500/25 text-white disabled:opacity-50">
            {isDetectingLocation ? <Loader2 className="w-6 h-6 animate-spin" /> : <Navigation className="w-6 h-6" />}
          </button>
        </div>
      )}

      {/* CHATS */}
      {activeTab === 'chats' && (
        <div className="pb-24">
          <div className="max-w-lg mx-auto px-4 py-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center mb-4"><MessageSquare className="w-10 h-10 text-yellow-400" /></div>
              <h2 className="text-white font-bold text-xl mb-2">{t('support', language)}</h2>
              <p className="text-gray-400 text-sm">{t('supportDesc', language)}</p>
            </div>
            <button onClick={() => setShowSupport(true)} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2">
              <MessageSquare className="w-5 h-5" />{t('startChat', language)}
            </button>
          </div>
        </div>
      )}

      {/* PROFILE */}
      {activeTab === 'profile' && userProfile && (
        <div className="pb-24">
          <div className="max-w-lg mx-auto px-4 py-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <img src={userProfile.avatar_url} alt="" className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-yellow-400" />
                {userProfile.is_verified && (
                  <div className="absolute bottom-4 right-0 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#0a0a1a]">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <h2 className="text-white font-bold text-xl">{userProfile.display_name}</h2>
              <p className="text-gray-400">@{userProfile.username}</p>
              <div className="flex justify-center gap-1 mt-2">{Array.from({ length: 5 }, (_, i) => <span key={i}>{i < Math.floor(userProfile.rating || 5) ? '⭐' : '☆'}</span>)}</div>
            </div>

            {/* Profile Tabs */}
            <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1">
              {[
                { key: 'profile', icon: User, label: t('profile', language) },
                { key: 'orders', icon: Clock, label: t('myOrders', language) },
                { key: 'stats', icon: BarChart3, label: t('statistics', language) },
                { key: 'reviews', icon: Star, label: 'Отзывы' },
                { key: 'settings', icon: Settings, label: t('settings', language) },
              ].map(tab => (
                <button key={tab.key} onClick={() => setProfileTab(tab.key as any)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition ${profileTab === tab.key ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'}`}>
                  <tab.icon className="w-3 h-3" /><span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {profileTab === 'profile' && <ProfileEditor user={userProfile} onSave={(data) => setUserProfile(prev => prev ? { ...prev, ...data } : null)} lang={language} />}
            {profileTab === 'orders' && <OrderHistory lang={language} userId={userProfile.id} />}
            {profileTab === 'stats' && <StatisticsPanel lang={language} />}
            {profileTab === 'reviews' && <UserReviews userId={userProfile.id} lang={language} />}
            {profileTab === 'settings' && (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3"><Globe className="w-5 h-5 text-yellow-400" /><span className="text-white">{t('language', language)}</span></div>
                    <button onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')} className="text-yellow-400 text-sm">{language === 'ru' ? 'English' : 'Русский'}</button>
                  </div>
                </div>
                <button onClick={() => setShowSettings(true)} className="w-full bg-white/5 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3"><Settings className="w-5 h-5 text-yellow-400" /><span className="text-white">{t('settings', language)}</span></div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-full bg-white/5 rounded-xl p-4 flex items-center justify-between text-red-400">
                  <div className="flex items-center gap-3"><LogOut className="w-5 h-5" /><span>{t('logout', language)}</span></div>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {isCreateModalOpen && <CreateTaskModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreateTask={handleCreateTask} userPosition={userPosition} />}
      <SupportChat isOpen={showSupport} onClose={() => setShowSupport(false)} lang={language} />
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} lang={language} />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} unreadCount={unreadCount} />
    </div>
  );
}

export default function HomePageWrapper() {
  return <LanguageProvider><HomeContent /></LanguageProvider>;
}
