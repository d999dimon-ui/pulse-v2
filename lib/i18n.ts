// Pulse v2 i18n Configuration
// EN/RU localization

export type Language = 'ru' | 'en';

export const i18n = {
  ru: {
    // Navigation
    nav: {
      feed: 'Лента',
      map: 'Карта',
      chats: 'Сообщения',
      profile: 'Профиль',
    },
    
    // Feed
    feed: {
      title: 'Лента заданий',
      search: 'Поиск заданий...',
      noTasks: 'Заданий не найдено',
      loading: 'Загрузка...',
      createNew: 'Создать задание',
    },
    
    // Categories
    categories: {
      all: 'Все',
      it: 'IT-услуги',
      repair: 'Ремонт',
      translation: 'Переводы',
      delivery: 'Доставка',
      cleaning: 'Клининг',
      tutoring: 'Репетиторство',
      marketing: 'Маркетинг',
      photo: 'Фото/Видео',
      other: 'Другое',
      custom: 'Своя категория',
    },
    
    // Task Creation
    task: {
      createTitle: 'Создать задание',
      title: 'Название',
      titlePlaceholder: 'Например: Настроить Telegram-бота',
      description: 'Описание',
      descriptionPlaceholder: 'Опишите задачу подробно...',
      category: 'Категория',
      budget: 'Бюджет',
      budgetPlaceholder: 'Сумма в USDT',
      address: 'Адрес',
      addressPlaceholder: 'Город, улица, дом',
      setOnMap: 'Указать на карте',
      phone: 'Контактный телефон',
      phonePlaceholder: '+996 ___ ___ ___',
      createButton: 'Создать задание',
      success: 'Задание создано!',
      error: 'Ошибка создания',
    },
    
    // Chat
    chat: {
      title: 'Сообщения',
      noChats: 'Нет диалогов',
      search: 'Поиск...',
      sendMessage: 'Введите сообщение...',
      contactHidden: 'Контакт скрыт после завершения',
      call: 'Позвонить',
      taskCompleted: 'Заказ завершён',
    },
    
    // Profile
    profile: {
      title: 'Профиль',
      balance: 'Баланс',
      completed: 'Выполнено',
      active: 'Активные',
      settings: 'Настройки',
      language: 'Язык',
      logout: 'Выйти',
      joinDate: 'В системе с',
      rating: 'Рейтинг',
    },
    
    // Status
    status: {
      open: 'Открыто',
      inProgress: 'В работе',
      completed: 'Завершено',
      cancelled: 'Отменено',
    },
    
    // Errors
    errors: {
      required: 'Обязательное поле',
      invalidPhone: 'Неверный формат телефона',
      invalidAddress: 'Неверный адрес',
      networkError: 'Ошибка сети',
      unauthorized: 'Требуется авторизация',
      forbidden: 'Доступ запрещён',
    },
    
    // Notifications
    notifications: {
      taskCreated: 'Задание создано',
      taskCompleted: 'Задание завершено',
      newMessage: 'Новое сообщение',
      offerReceived: 'Новое предложение',
    },
    
    // Common
    common: {
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      edit: 'Редактировать',
      confirm: 'Подтвердить',
      close: 'Закрыть',
      loading: 'Загрузка...',
      usdt: 'USDT',
    },
  },
  
  en: {
    // Navigation
    nav: {
      feed: 'Feed',
      map: 'Map',
      chats: 'Messages',
      profile: 'Profile',
    },
    
    // Feed
    feed: {
      title: 'Task Feed',
      search: 'Search tasks...',
      noTasks: 'No tasks found',
      loading: 'Loading...',
      createNew: 'Create Task',
    },
    
    // Categories
    categories: {
      all: 'All',
      it: 'IT Services',
      repair: 'Repair',
      translation: 'Translation',
      delivery: 'Delivery',
      cleaning: 'Cleaning',
      tutoring: 'Tutoring',
      marketing: 'Marketing',
      photo: 'Photo/Video',
      other: 'Other',
      custom: 'Custom Category',
    },
    
    // Task Creation
    task: {
      createTitle: 'Create Task',
      title: 'Title',
      titlePlaceholder: 'e.g., Setup Telegram Bot',
      description: 'Description',
      descriptionPlaceholder: 'Describe the task in detail...',
      category: 'Category',
      budget: 'Budget',
      budgetPlaceholder: 'Amount in USDT',
      address: 'Address',
      addressPlaceholder: 'City, street, building',
      setOnMap: 'Set on Map',
      phone: 'Contact Phone',
      phonePlaceholder: '+996 ___ ___ ___',
      createButton: 'Create Task',
      success: 'Task created!',
      error: 'Creation error',
    },
    
    // Chat
    chat: {
      title: 'Messages',
      noChats: 'No conversations',
      search: 'Search...',
      sendMessage: 'Type a message...',
      contactHidden: 'Contact hidden after completion',
      call: 'Call',
      taskCompleted: 'Order completed',
    },
    
    // Profile
    profile: {
      title: 'Profile',
      balance: 'Balance',
      completed: 'Completed',
      active: 'Active',
      settings: 'Settings',
      language: 'Language',
      logout: 'Logout',
      joinDate: 'Member since',
      rating: 'Rating',
    },
    
    // Status
    status: {
      open: 'Open',
      inProgress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    },
    
    // Errors
    errors: {
      required: 'Required field',
      invalidPhone: 'Invalid phone format',
      invalidAddress: 'Invalid address',
      networkError: 'Network error',
      unauthorized: 'Authorization required',
      forbidden: 'Access denied',
    },
    
    // Notifications
    notifications: {
      taskCreated: 'Task created',
      taskCompleted: 'Task completed',
      newMessage: 'New message',
      offerReceived: 'New offer',
    },
    
    // Common
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      confirm: 'Confirm',
      close: 'Close',
      loading: 'Loading...',
      usdt: 'USDT',
    },
  },
};

// Auto-detect language
export function detectLanguage(): Language {
  if (typeof window === 'undefined') return 'en';

  const saved = localStorage.getItem('language');
  if (saved === 'ru' || saved === 'en') return saved;

  const browserLang = navigator.language.toLowerCase();

  // CIS countries → Russian
  const cisCodes = ['ru', 'uk', 'be', 'kk', 'tj', 'az', 'hy'];
  if (cisCodes.some(code => browserLang.startsWith(code))) return 'ru';

  return 'en';
}

// Initialize language on first load
export async function initializeLanguage(): Promise<Language> {
  const lang = detectLanguage();
  if (typeof window !== 'undefined') localStorage.setItem('language', lang);
  return lang;
}

// Get translation helper
export function t(lang: Language, key: string, params?: Record<string, string>): string {
  const keys = key.split('.');
  let value: any = i18n[lang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  if (typeof value !== 'string') {
    return key;
  }
  
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      value = value.replace(`{${k}}`, v);
    });
  }
  
  return value;
}

// Set language
export function setLanguage(lang: Language): void {
  if (typeof window !== 'undefined') localStorage.setItem('language', lang);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('language-change', { detail: lang }));
  }
}
