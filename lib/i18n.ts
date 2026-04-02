// i18n Configuration with Geo-IP Detection
// Smart localization based on user location

export type Language = 'ru' | 'kg' | 'en';

export const translations = {
  ru: {
    // Navigation
    feed: 'Лента',
    map: 'Карта',
    myOrders: 'Мои заказы',
    profile: 'Профиль',
    
    // Task Categories
    categories: {
      it: 'IT-услуги',
      repair: 'Ремонт',
      translation: 'Переводы',
      delivery: 'Доставка',
      cleaning: 'Клининг',
      tutoring: 'Репетиторство',
      other: 'Другое',
    },
    
    // Task Creation
    createTask: 'Создать задание',
    taskTitle: 'Название задания',
    taskDescription: 'Описание',
    taskCategory: 'Категория',
    taskBudget: 'Бюджет',
    taskAddress: 'Адрес',
    setOnMap: 'Указать на карте',
    createTaskButton: 'Создать задание',
    
    // Chat
    chat: 'Чат',
    sendMessage: 'Отправить сообщение',
    contactHidden: 'Контакты скрыты после завершения',
    call: 'Позвонить',
    message: 'Написать',
    
    // Order Status
    status: {
      open: 'Открыто',
      inProgress: 'В работе',
      completed: 'Завершено',
      cancelled: 'Отменено',
    },
    
    // Notifications
    notifications: {
      taskCreated: 'Задание создано',
      taskCompleted: 'Задание завершено',
      newMessage: 'Новое сообщение',
    },
    
    // Errors
    errors: {
      required: 'Обязательное поле',
      invalidAddress: 'Неверный адрес',
      networkError: 'Ошибка сети',
    },
    
    // Geo
    location: {
      kyrgyzstan: 'Кыргызстан',
      jalalAbad: 'Джалал-Абад',
      detectLocation: 'Определить местоположение',
    },
  },
  
  kg: {
    // Navigation
    feed: 'Лента',
    map: 'Карта',
    myOrders: 'Менин буйрутмаларым',
    profile: 'Профиль',
    
    // Task Categories
    categories: {
      it: 'IT-кызматтар',
      repair: 'Оңдоо',
      translation: 'Котормо',
      delivery: 'Жеткирүү',
      cleaning: 'Тазалоо',
      tutoring: 'Репетиторство',
      other: 'Башка',
    },
    
    // Task Creation
    createTask: 'Тапшырма түзүү',
    taskTitle: 'Тапшырманын аталышы',
    taskDescription: 'Сүрөттөмө',
    taskCategory: 'Категория',
    taskBudget: 'Бюджет',
    taskAddress: 'Дарек',
    setOnMap: 'Картадан белгилөө',
    createTaskButton: 'Тапшырма түзүү',
    
    // Chat
    chat: 'Чат',
    sendMessage: 'Билдирүү жөнөтүү',
    contactHidden: 'Байланыштар жашырылган',
    call: 'Чалуу',
    message: 'Жазуу',
    
    // Order Status
    status: {
      open: 'Ачык',
      inProgress: 'Иштеп жатат',
      completed: 'Аяктады',
      cancelled: 'Жокко чыгарылды',
    },
    
    // Notifications
    notifications: {
      taskCreated: 'Тапшырма түзүлдү',
      taskCompleted: 'Тапшырма аяктады',
      newMessage: 'Жаңы билдирүү',
    },
    
    // Errors
    errors: {
      required: 'Милдеттүү талаа',
      invalidAddress: 'Туура эмес дарек',
      networkError: 'Тармак катасы',
    },
    
    // Geo
    location: {
      kyrgyzstan: 'Кыргызстан',
      jalalAbad: 'Жалал-Абад',
      detectLocation: 'Жайгашкан жерди аныктоо',
    },
  },
  
  en: {
    // Navigation
    feed: 'Feed',
    map: 'Map',
    myOrders: 'My Orders',
    profile: 'Profile',
    
    // Task Categories
    categories: {
      it: 'IT Services',
      repair: 'Repair',
      translation: 'Translation',
      delivery: 'Delivery',
      cleaning: 'Cleaning',
      tutoring: 'Tutoring',
      other: 'Other',
    },
    
    // Task Creation
    createTask: 'Create Task',
    taskTitle: 'Task Title',
    taskDescription: 'Description',
    taskCategory: 'Category',
    taskBudget: 'Budget',
    taskAddress: 'Address',
    setOnMap: 'Set on Map',
    createTaskButton: 'Create Task',
    
    // Chat
    chat: 'Chat',
    sendMessage: 'Send Message',
    contactHidden: 'Contacts hidden after completion',
    call: 'Call',
    message: 'Message',
    
    // Order Status
    status: {
      open: 'Open',
      inProgress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    },
    
    // Notifications
    notifications: {
      taskCreated: 'Task created',
      taskCompleted: 'Task completed',
      newMessage: 'New message',
    },
    
    // Errors
    errors: {
      required: 'Required field',
      invalidAddress: 'Invalid address',
      networkError: 'Network error',
    },
    
    // Geo
    location: {
      kyrgyzstan: 'Kyrgyzstan',
      jalalAbad: 'Jalal-Abad',
      detectLocation: 'Detect Location',
    },
  },
};

// Geo-IP detection helper
export async function detectUserLocation(): Promise<{
  country: string;
  city?: string;
  language: Language;
}> {
  try {
    // Try to get location from IP
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    const country = data.country_code;
    const city = data.city;
    
    // Determine language based on location
    let language: Language = 'en'; // Default
    
    if (country === 'KG') {
      // Kyrgyzstan - prefer Russian/Kyrgyz
      language = 'ru';
    } else if (['RU', 'KZ', 'UZ', 'TJ'].includes(country)) {
      // CIS countries - Russian
      language = 'ru';
    } else {
      // Rest of world - English
      language = 'en';
    }
    
    return { country, city, language };
  } catch (error) {
    console.error('Geo-IP detection failed:', error);
    // Fallback to browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('ru') || browserLang.startsWith('uk')) {
      return { country: 'unknown', language: 'ru' };
    } else if (browserLang.startsWith('ky')) {
      return { country: 'KG', language: 'kg' };
    }
    return { country: 'unknown', language: 'en' };
  }
}

// Get translation helper
export function t(lang: Language, key: string, params?: Record<string, string>): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  if (typeof value !== 'string') {
    return key; // Fallback to key
  }
  
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      value = value.replace(`{${k}}`, v);
    });
  }
  
  return value;
}

// Auto-detect and set language on first load
export async function initializeLanguage(): Promise<Language> {
  // Check localStorage first
  const saved = localStorage.getItem('language');
  if (saved && ['ru', 'kg', 'en'].includes(saved)) {
    return saved as Language;
  }
  
  // Detect from Geo-IP
  const location = await detectUserLocation();
  localStorage.setItem('language', location.language);
  
  return location.language;
}
