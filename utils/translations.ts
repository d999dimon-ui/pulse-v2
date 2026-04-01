// Translations for English and Russian

export type Language = 'en' | 'ru';

export const translations = {
  en: {
    // Common
    loading: 'Loading...',
    close: 'Close',
    create: 'Create',
    cancel: 'Cancel',
    save: 'Save',
    confirm: 'Confirm',
    
    // Map
    mapLoading: 'Loading map...',
    longPressHint: '📍 Long press on map to create a task',
    welcome: 'Welcome!',
    
    // Task Creation
    createTaskTitle: 'Create New Task',
    taskTitle: 'Task Title',
    taskTitlePlaceholder: 'e.g., Deliver package to downtown',
    description: 'Description',
    descriptionPlaceholder: 'Describe the task details...',
    reward: 'Reward',
    currency: 'Currency',
    stars: 'Stars',
    usd: 'USD',
    category: 'Category',
    categories: {
      delivery: 'Delivery',
      cleaning: 'Cleaning',
      help: 'Help',
      photo: 'Photo',
    },
    createTaskButton: '🚀 Create Task',
    
    // Task Feed
    nearbyTasks: 'Nearby Tasks',
    tasksWithin5km: '{count} tasks within 5km',
    noTasksNearby: 'No tasks nearby',
    beFirstToCreate: 'Be the first to create a task!',
    claim: 'Claim',
    
    // User Profile
    currentBalance: 'Current Balance',
    withdrawFunds: '💸 Withdraw Funds',
    completed: 'Completed',
    active: 'Active',
    rating: 'Rating',
    overview: 'Overview',
    myTasks: 'My Tasks',
    totalEarned: 'Total Earned',
    successRate: 'Success Rate',
    noTasksYet: 'No tasks yet',
    taskerSince: 'Tasker since',
    minimumWithdrawal: 'Minimum withdrawal is 10 Stars',
    withdrawalSubmitted: 'Withdrawal request for {amount} Stars submitted!',
    withdrawalInfo: 'In production, this would integrate with Telegram Stars or TON payment.',
    
    // Language
    language: 'Language',
    english: 'English',
    russian: 'Русский',
    selectLanguage: 'Select Language',
    selectLanguageHint: 'Choose your preferred language to get started',
    
    // Task Status
    status: {
      active: 'Active',
      completed: 'Completed',
      claimed: 'Claimed',
    },
    
    // Notifications
    taskClaimed: 'Task claimed! Contact the task creator to complete.',
    paymentSuccess: 'Payment for "{tariff}" successful!',
    paymentTest: 'Telegram WebApp not available. Test payment: {tariff} - {invoiceId}',
  },
  ru: {
    // Common
    loading: 'Загрузка...',
    close: 'Закрыть',
    create: 'Создать',
    cancel: 'Отмена',
    save: 'Сохранить',
    confirm: 'Подтвердить',
    
    // Map
    mapLoading: 'Загрузка карты...',
    longPressHint: '📍 Долгое нажатие для создания задания',
    welcome: 'Добро пожаловать!',
    
    // Task Creation
    createTaskTitle: 'Новое задание',
    taskTitle: 'Название',
    taskTitlePlaceholder: 'Например, Доставить посылку в центр',
    description: 'Описание',
    descriptionPlaceholder: 'Опишите детали задания...',
    reward: 'Награда',
    currency: 'Валюта',
    stars: 'Stars',
    usd: 'USD',
    category: 'Категория',
    categories: {
      delivery: 'Доставка',
      cleaning: 'Уборка',
      help: 'Помощь',
      photo: 'Фото',
    },
    createTaskButton: '🚀 Создать задание',
    
    // Task Feed
    nearbyTasks: 'Задания рядом',
    tasksWithin5km: '{count} заданий в радиусе 5км',
    noTasksNearby: 'Нет заданий рядом',
    beFirstToCreate: 'Создайте первое задание!',
    claim: 'Взять',
    
    // User Profile
    currentBalance: 'Текущий баланс',
    withdrawFunds: '💸 Вывести средства',
    completed: 'Выполнено',
    active: 'Активные',
    rating: 'Рейтинг',
    overview: 'Обзор',
    myTasks: 'Мои задания',
    totalEarned: 'Всего заработано',
    successRate: 'Успешность',
    noTasksYet: 'Пока нет заданий',
    taskerSince: 'В приложении с',
    minimumWithdrawal: 'Минимальный вывод 10 Stars',
    withdrawalSubmitted: 'Запрос на вывод {amount} Stars отправлен!',
    withdrawalInfo: 'В продакшене это будет интегрировано с Telegram Stars или TON.',
    
    // Language
    language: 'Язык',
    english: 'English',
    russian: 'Русский',
    selectLanguage: 'Выберите язык',
    selectLanguageHint: 'Выберите предпочитаемый язык для начала работы',
    
    // Task Status
    status: {
      active: 'Активно',
      completed: 'Выполнено',
      claimed: 'Взято',
    },
    
    // Notifications
    taskClaimed: 'Задание взято! Свяжитесь с создателем для выполнения.',
    paymentSuccess: 'Оплата тарифа "{tariff}" успешна!',
    paymentTest: 'Telegram WebApp недоступен. Тест оплаты: {tariff} - {invoiceId}',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

// Helper function to get translation with interpolation
export function t(lang: Language, key: string, params?: Record<string, string | number>): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  if (typeof value !== 'string') {
    return key;
  }
  
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return String(params[paramKey] ?? match);
    });
  }
  
  return value;
}

// Get default language from localStorage or browser
export function getDefaultLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  
  const saved = localStorage.getItem('language');
  if (saved === 'en' || saved === 'ru') return saved;
  
  // Try to detect from browser
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('ru')) return 'ru';
  
  return 'en';
}
