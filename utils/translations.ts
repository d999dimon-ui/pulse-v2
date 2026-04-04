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
    share: 'Share',
    copy: 'Copy',
    search: 'Search...',
    noData: 'No data',
    tryAgain: 'Try Again',
    back: 'Back',
    done: 'Done',
    delete: 'Delete',
    edit: 'Edit',

    // Nav
    'nav.home': 'Home',
    'nav.map': 'Map',
    'nav.tasks': 'Tasks',
    'nav.profile': 'Profile',
    'nav.chats': 'Chats',

    // Home
    'home.title': 'Find Tasks Nearby',
    'home.subtitle': 'Choose a category to get started',
    'home.search': 'Search tasks...',
    'home.categories': 'Categories',
    'home.nearbyTasks': 'Nearby Tasks',
    'home.tasksWithin5km': '{count} tasks within 5km',
    'home.noTasksNearby': 'No tasks nearby',
    'home.beFirstToCreate': 'Be the first to create a task!',

    // Categories
    'cat.all': 'All',
    'cat.it': 'IT Services',
    'cat.delivery': 'Delivery',
    'cat.cleaning': 'Cleaning',
    'cat.help': 'Help',
    'cat.photo': 'Photo/Video',
    'cat.repair': 'Repair',
    'cat.tutoring': 'Tutoring',
    'cat.translation': 'Translation',
    'cat.marketing': 'Marketing',
    'cat.custom': 'Custom',
    'cat.other': 'Other',

    // Map
    'map.loading': 'Loading map...',
    'map.hint': 'Long press on map to create a task',
    'map.noTasks': 'No tasks nearby',
    'map.zoomIn': 'Zoom in to see tasks',
    'map.currentLocation': 'Current location',

    // Tasks
    'tasks.title': 'Available Tasks',
    'tasks.filter': 'Filter',
    'tasks.sort': 'Sort',
    'tasks.noTasks': 'No tasks found',
    'tasks.loading': 'Loading tasks...',
    'tasks.claim': 'Claim',
    'tasks.claimed': 'Claimed',
    'tasks.reward': 'Reward',
    'tasks.distance': 'Distance',
    'tasks.created': 'Created',
    'tasks.status.open': 'Open',
    'tasks.status.in_progress': 'In Progress',
    'tasks.status.completed': 'Completed',
    'tasks.status.cancelled': 'Cancelled',
    'tasks.status.claimed': 'Claimed',
    'tasks.status.active': 'Active',

    // Profile
    'profile.title': 'Profile',
    'profile.balance': 'Balance',
    'profile.stars': 'Stars',
    'profile.completed': 'Completed',
    'profile.active': 'Active',
    'profile.rating': 'Rating',
    'profile.settings': 'Settings',
    'profile.language': 'Language',
    'profile.wallet': 'Connect Wallet',
    'profile.disconnect': 'Disconnect Wallet',
    'profile.withdraw': 'Withdraw Funds',
    'profile.referral': 'Invite Friends',
    'profile.referralHint': 'Get 24h premium access when your friend completes 5 tasks',
    'profile.referralLink': 'Your referral link',
    'profile.referralCopied': 'Link copied!',
    'profile.myTasks': 'My Tasks',
    'profile.noTasksYet': 'No tasks yet',
    'profile.overview': 'Overview',
    'profile.totalEarned': 'Total Earned',
    'profile.successRate': 'Success Rate',
    'profile.support': 'Support Chat',
    'profile.about': 'About',
    'profile.logout': 'Logout',
    'profile.taskerSince': 'Member since',
    'profile.minWithdraw': 'Minimum withdrawal is 10 Stars',
    'profile.withdrawSubmit': 'Withdrawal request for {amount} Stars submitted!',
    'profile.withdrawInfo': 'In production, this integrates with Telegram Stars or TON.',
    'profile.currentBalance': 'Current Balance',
    'profile.withdrawFunds': 'Withdraw Funds',

    // Task Creation
    'task.createTitle': 'Create New Task',
    'task.title': 'Task Title',
    'task.titlePlaceholder': 'e.g., Deliver package to downtown',
    'task.description': 'Description',
    'task.descriptionPlaceholder': 'Describe the task details...',
    'task.reward': 'Reward',
    'task.currency': 'Currency',
    'task.stars': 'Stars',
    'task.usd': 'USD',
    'task.category': 'Category',
    'task.createButton': 'Create Task',
    'task.success': 'Task created!',
    'task.error': 'Error creating task',
    'taskAddress': 'Address',
    'taskAddressPlaceholder': 'City, street, building',
    'taskSetOnMap': 'Set on Map',
    'taskPhone': 'Contact Phone',
    'taskPhonePlaceholder': '+996 ___ ___ ___',

    // Chat
    'chat.title': 'Messages',
    'chat.noChats': 'No conversations',
    'chat.placeholder': 'Type a message...',
    'chat.send': 'Send',
    'chat.contactHidden': 'Contact hidden after completion',
    'chat.call': 'Call',
    'chat.taskCompleted': 'Order completed',
    'chat.sendMessage': 'Enter message...',

    // Language Selector
    'lang.select': 'Select Language',
    'lang.hint': 'Choose your preferred language to get started',
    'lang.english': 'English',
    'lang.russian': 'Русский',

    // Onboarding
    'onboarding.welcome': 'Welcome to TaskHub!',
    'onboarding.skip': 'Skip',
    'onboarding.next': 'Next',
    'onboarding.start': 'Get Started!',
    'onboarding.step1.title': 'Map of Opportunities',
    'onboarding.step1.desc': 'Find tasks nearby or delegate your tasks to people around the world.',
    'onboarding.step2.title': 'Secure Payments',
    'onboarding.step2.desc': 'Your Stars are protected. Payment occurs only after confirmation.',
    'onboarding.step3.title': 'Earn Everywhere',
    'onboarding.step3.desc': 'Become part of the global TaskHub network.',

    // Notifications
    'taskClaimed': 'Task claimed! Contact the task creator to complete.',
    'minimumWithdrawal': 'Minimum withdrawal is 10 Stars',
    'withdrawalSubmitted': 'Withdrawal request for {amount} Stars submitted!',
    'withdrawalInfo': 'In production, this would integrate with Telegram Stars or TON payment.',
    'longPressHint': 'Long press on map to create a task',
    'paymentSuccess': 'Payment for "{tariff}" successful!',
    'paymentTest': 'Telegram WebApp not available. Test payment: {tariff} - {invoiceId}',

    // Common actions
    'createTaskTitle': 'Create New Task',
    'createTaskButton': 'Create Task',

    // Errors
    'error.title': 'Something went wrong',
    'error.message': 'An unexpected error occurred',
    'error.network': 'Network error. Check your connection.',
    'error.unauthorized': 'Please sign in to continue',
    'error.forbidden': 'Access denied',
    'error.notFound': 'Not found',

    // NeuroChat
    'neuro.title': 'NeuroChat AI',
    'neuro.placeholder': 'Ask about tasks, pricing, or tips...',
    'neuro.welcome': 'Hi! I\'m your TaskHub assistant. Ask me anything about tasks, payments, or how to get started!',
    'neuro.typing': 'AI is typing...',

    // Admin
    'admin.title': 'Admin Panel',
    'admin.createTask': 'Create Task',
    'admin.editTask': 'Edit Task',
    'admin.tasks': 'All Tasks',
    'admin.users': 'Users',
    'admin.stats': 'Statistics',
  },

  ru: {
    // Common
    loading: 'Загрузка...',
    close: 'Закрыть',
    create: 'Создать',
    cancel: 'Отмена',
    save: 'Сохранить',
    confirm: 'Подтвердить',
    share: 'Поделиться',
    copy: 'Копировать',
    search: 'Поиск...',
    noData: 'Нет данных',
    tryAgain: 'Попробовать снова',
    back: 'Назад',
    done: 'Готово',
    delete: 'Удалить',
    edit: 'Редактировать',

    // Nav
    'nav.home': 'Главная',
    'nav.map': 'Карта',
    'nav.tasks': 'Задания',
    'nav.profile': 'Профиль',
    'nav.chats': 'Чаты',

    // Home
    'home.title': 'Задания рядом',
    'home.subtitle': 'Выберите категорию',
    'home.search': 'Поиск заданий...',
    'home.categories': 'Категории',
    'home.nearbyTasks': 'Задания рядом',
    'home.tasksWithin5km': '{count} заданий в радиусе 5км',
    'home.noTasksNearby': 'Нет заданий рядом',
    'home.beFirstToCreate': 'Создайте первое задание!',

    // Categories
    'cat.all': 'Все',
    'cat.it': 'IT-услуги',
    'cat.delivery': 'Доставка',
    'cat.cleaning': 'Уборка',
    'cat.help': 'Помощь',
    'cat.photo': 'Фото/Видео',
    'cat.repair': 'Ремонт',
    'cat.tutoring': 'Репетиторство',
    'cat.translation': 'Переводы',
    'cat.marketing': 'Маркетинг',
    'cat.custom': 'Своя',
    'cat.other': 'Другое',

    // Map
    'map.loading': 'Загрузка карты...',
    'map.hint': 'Долгое нажатие для создания задания',
    'map.noTasks': 'Нет заданий рядом',
    'map.zoomIn': 'Приблизьте карту',
    'map.currentLocation': 'Текущее местоположение',

    // Tasks
    'tasks.title': 'Доступные задания',
    'tasks.filter': 'Фильтр',
    'tasks.sort': 'Сортировка',
    'tasks.noTasks': 'Задания не найдены',
    'tasks.loading': 'Загрузка заданий...',
    'tasks.claim': 'Взять',
    'tasks.claimed': 'Взято',
    'tasks.reward': 'Награда',
    'tasks.distance': 'Расстояние',
    'tasks.created': 'Создано',
    'tasks.status.open': 'Открыто',
    'tasks.status.in_progress': 'В работе',
    'tasks.status.completed': 'Выполнено',
    'tasks.status.cancelled': 'Отменено',
    'tasks.status.claimed': 'Взято',
    'tasks.status.active': 'Активно',

    // Profile
    'profile.title': 'Профиль',
    'profile.balance': 'Баланс',
    'profile.stars': 'Stars',
    'profile.completed': 'Выполнено',
    'profile.active': 'Активные',
    'profile.rating': 'Рейтинг',
    'profile.settings': 'Настройки',
    'profile.language': 'Язык',
    'profile.wallet': 'Подключить кошелёк',
    'profile.disconnect': 'Отключить кошелёк',
    'profile.withdraw': 'Вывести средства',
    'profile.referral': 'Пригласить друга',
    'profile.referralHint': 'Получите 24ч премиум-доступа когда друг выполнит 5 заданий',
    'profile.referralLink': 'Ваша реферальная ссылка',
    'profile.referralCopied': 'Ссылка скопирована!',
    'profile.myTasks': 'Мои задания',
    'profile.noTasksYet': 'Пока нет заданий',
    'profile.overview': 'Обзор',
    'profile.totalEarned': 'Всего заработано',
    'profile.successRate': 'Успешность',
    'profile.support': 'Поддержка',
    'profile.about': 'О приложении',
    'profile.logout': 'Выйти',
    'profile.taskerSince': 'В приложении с',
    'profile.minWithdraw': 'Минимальный вывод 10 Stars',
    'profile.withdrawSubmit': 'Запрос на вывод {amount} Stars отправлен!',
    'profile.withdrawInfo': 'В продакшене интеграция с Telegram Stars или TON.',
    'profile.currentBalance': 'Текущий баланс',
    'profile.withdrawFunds': 'Вывести средства',

    // Task Creation
    'task.createTitle': 'Новое задание',
    'task.title': 'Название',
    'task.titlePlaceholder': 'Например, Доставить посылку в центр',
    'task.description': 'Описание',
    'task.descriptionPlaceholder': 'Опишите детали задания...',
    'task.reward': 'Награда',
    'task.currency': 'Валюта',
    'task.stars': 'Stars',
    'task.usd': 'USD',
    'task.category': 'Категория',
    'task.createButton': 'Создать задание',
    'task.success': 'Задание создано!',
    'task.error': 'Ошибка создания задания',
    'taskAddress': 'Адрес',
    'taskAddressPlaceholder': 'Город, улица, дом',
    'taskSetOnMap': 'Указать на карте',
    'taskPhone': 'Контактный телефон',
    'taskPhonePlaceholder': '+996 ___ ___ ___',

    // Chat
    'chat.title': 'Сообщения',
    'chat.noChats': 'Нет диалогов',
    'chat.placeholder': 'Введите сообщение...',
    'chat.send': 'Отправить',
    'chat.contactHidden': 'Контакт скрыт после завершения',
    'chat.call': 'Позвонить',
    'chat.taskCompleted': 'Заказ завершён',
    'chat.sendMessage': 'Введите сообщение...',

    // Language Selector
    'lang.select': 'Выберите язык',
    'lang.hint': 'Выберите предпочитаемый язык для начала работы',
    'lang.english': 'English',
    'lang.russian': 'Русский',

    // Onboarding
    'onboarding.welcome': 'Добро пожаловать в TaskHub!',
    'onboarding.skip': 'Пропустить',
    'onboarding.next': 'Далее',
    'onboarding.start': 'Начать!',
    'onboarding.step1.title': 'Карта возможностей',
    'onboarding.step1.desc': 'Находи задания рядом или делегируй свои задачи.',
    'onboarding.step2.title': 'Безопасные платежи',
    'onboarding.step2.desc': 'Твои Stars под защитой. Оплата после подтверждения.',
    'onboarding.step3.title': 'Зарабатывай везде',
    'onboarding.step3.desc': 'Стань частью глобальной сети помощников.',

    // Notifications
    'taskClaimed': 'Задание взято! Свяжитесь с создателем для выполнения.',
    'minimumWithdrawal': 'Минимальный вывод 10 Stars',
    'withdrawalSubmitted': 'Запрос на вывод {amount} Stars отправлен!',
    'withdrawalInfo': 'В продакшене это будет интегрировано с Telegram Stars или TON.',
    'longPressHint': 'Долгое нажатие на карте для создания задания',
    'paymentSuccess': 'Оплата тарифа "{tariff}" успешна!',
    'paymentTest': 'Telegram WebApp недоступен. Тест оплаты: {tariff} - {invoiceId}',

    // Common actions
    'createTaskTitle': 'Создать задание',
    'createTaskButton': 'Создать задание',

    // Errors
    'error.title': 'Что-то пошло не так',
    'error.message': 'Произошла непредвиденная ошибка',
    'error.network': 'Ошибка сети. Проверьте подключение.',
    'error.unauthorized': 'Войдите, чтобы продолжить',
    'error.forbidden': 'Доступ запрещён',
    'error.notFound': 'Не найдено',

    // NeuroChat
    'neuro.title': 'NeuroChat ИИ',
    'neuro.placeholder': 'Спросите о заданиях, ценах или советах...',
    'neuro.welcome': 'Привет! Я ваш ассистент TaskHub. Спрашивайте о заданиях, оплатах или как начать!',
    'neuro.typing': 'ИИ печатает...',

    // Admin
    'admin.title': 'Админ-панель',
    'admin.createTask': 'Создать задание',
    'admin.editTask': 'Редактировать задание',
    'admin.tasks': 'Все задания',
    'admin.users': 'Пользователи',
    'admin.stats': 'Статистика',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

// Helper function to get translation with interpolation
export function t(lang: Language, key: string, params?: Record<string, string | number>): string {
  // First try flat key lookup (e.g., 'chat.title')
  const translationsObj = translations[lang];
  if (translationsObj && key in translationsObj) {
    let value = translationsObj[key as keyof typeof translationsObj];
    if (typeof value === 'string') {
      if (params) {
        return value.replace(/\{(\w+)\}/g, (match, paramKey) => String(params[paramKey] ?? match));
      }
      return value;
    }
  }
  // Fallback: try nested key lookup (e.g., 'nav.home' -> nav: { home: '...' })
  const keys = key.split('.');
  let value: any = translationsObj;
  for (const k of keys) {
    value = value?.[k];
  }
  if (typeof value !== 'string') return key;
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => String(params[paramKey] ?? match));
  }
  return value;
}

// Get default language from localStorage or browser
export function getDefaultLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem('language');
  if (saved === 'en' || saved === 'ru') return saved;
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('ru')) return 'ru';
  return 'en';
}
