// Pulse Telegram Bot - Full Implementation with RU/EN Support
// Save as: telegram-bot/index.js

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEB_APP_URL = 'https://pulse-v2-git-main-d999dimon-uis-projects.vercel.app';
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

const API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// ============================================
// LANGUAGE DETECTION
// ============================================

function getUserLanguage(user) {
  // Check language_code from Telegram
  if (user?.language_code) {
    const lang = user.language_code.toLowerCase();
    if (lang.startsWith('ru')) return 'ru';
    if (lang.startsWith('uk') || lang.startsWith('be')) return 'ru'; // Fallback to Russian
  }
  return 'en'; // Default
}

function t(key, lang) {
  const translations = {
    ru: {
      welcome: 'Добро пожаловать в Pulse! Нажми на кнопку ниже, чтобы открыть карту заданий.',
      launch: 'Запустить Pulse 🚀',
      menuButton: 'Открыть Pulse 🌍',
      help: 'Помощь',
      profile: 'Мой профиль',
      tasks: 'Задания',
      supportOnly: 'Извините, поддержка доступна только на русском и английском языках.',
      ai_intro: 'Здравствуйте! Я менеджер поддержки Pulse. Чем могу помочь?',
      human_escalation: 'Ваш запрос передан старшему менеджеру. Ожидайте ответа.',
      flood_warning: 'Извините, я консультирую только по вопросам Pulse. Чем помочь по вашему заказу?',
      error: 'Произошла ошибка. Попробуйте позже.',
    },
    en: {
      welcome: 'Welcome to Pulse! Click the button below to open the task map.',
      launch: 'Launch Pulse 🚀',
      menuButton: 'Open Pulse 🌍',
      help: 'Help',
      profile: 'My Profile',
      tasks: 'Tasks',
      support_only: 'Sorry, support is only available in Russian and English.',
      ai_intro: 'Hello! I\'m a Pulse support manager. How can I help you?',
      human_escalation: 'Your request has been escalated to a senior manager. Please wait for a response.',
      flood_warning: 'Sorry, I only consult on Pulse matters. How can I help with your order?',
      error: 'An error occurred. Please try again later.',
    },
  };
  
  return translations[lang]?.[key] || translations['en'][key] || key;
}

// ============================================
// TELEGRAM API FUNCTIONS
// ============================================

async function telegramRequest(method, data) {
  const response = await fetch(`${API_URL}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await response.json();
}

// Set bot commands
async function setMyCommands() {
  const commands = [
    { command: 'start', description: 'Start Pulse App' },
    { command: 'help', description: 'Get help' },
    { command: 'profile', description: 'View profile' },
    { command: 'tasks', description: 'Browse tasks' },
  ];
  
  await telegramRequest('setMyCommands', { commands });
}

// Set menu button for specific user
async function setChatMenuButton(chatId, lang) {
  await telegramRequest('setChatMenuButton', {
    chat_id: chatId,
    button: {
      type: 'web_app',
      text: t('menuButton', lang),
      web_app: {
        url: WEB_APP_URL,
      },
    },
  });
}

// Send welcome message with inline keyboard
async function sendWelcomeMessage(chatId, lang, user) {
  await telegramRequest('sendMessage', {
    chat_id: chatId,
    text: t('welcome', lang),
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: t('launch', lang),
            web_app: {
              url: WEB_APP_URL,
            },
          },
        ],
      ],
    },
  });
}

// Send support message
async function sendSupportMessage(chatId, text, replyMarkup = null) {
  await telegramRequest('sendMessage', {
    chat_id: chatId,
    text,
    reply_markup: replyMarkup,
  });
}

// ============================================
// AI SUPPORT (ECONOMY MODE)
// ============================================

const AI_SYSTEM_PROMPT = `Ты — менеджер техподдержки Pulse. Отвечай ТОЛЬКО на русском или английском.
ПРАВИЛА:
1. Отвечай максимально коротко (2-3 предложения)
2. Не признавай что ты ИИ. На "Ты бот?" отвечай "Нет, я менеджер поддержки Pulse"
3. Если вопрос не по теме Pulse — отвечай: "Извините, я консультирую только по вопросам Pulse. Чем помочь по вашему заказу?"
4. Если пользователь пишет на другом языке — "Извините, поддержка доступна только на русском и английском языках"
5. После 2 предупреждений о флуде — ставь флаг needs_admin_help: true
6. Если пользователь пишет "Human" или недоволен после 3 сообщений — ставь needs_admin_help: true

Будь вежливым и профессиональным.`;

async function callAI(messages, lang) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': WEB_APP_URL,
        'X-Title': 'Pulse Support',
      },
      body: JSON.stringify({
        model: 'qwen/qwen-2.5-72b-instruct',
        messages: [
          { role: 'system', content: AI_SYSTEM_PROMPT },
          ...messages,
        ],
        temperature: 0.3, // Low temperature for focused responses
        max_tokens: 150, // Economy mode
        stop: ['\n\n\n'], // Prevent long responses
      }),
    });

    const data = await response.json();
    return data.choices[0]?.message?.content || t('error', lang);
  } catch (error) {
    console.error('AI Error:', error);
    return t('error', lang);
  }
}

// ============================================
// SUPABASE INTEGRATION
// ============================================

async function saveSupportChat(userId, messages, needsAdminHelp = false) {
  // This would be implemented with Supabase client
  // For now, return mock implementation
  console.log('Saving chat:', { userId, messages, needsAdminHelp });
}

async function loadSupportChat(userId) {
  // Load chat history from Supabase
  return { messages: [], needsAdminHelp: false };
}

// ============================================
// WEBHOOK HANDLER
// ============================================

export async function handleWebhook(update) {
  try {
    // Handle message
    if (update.message) {
      const chatId = update.message.chat.id;
      const user = update.message.from;
      const text = update.message.text;
      const lang = getUserLanguage(user);
      
      // /start command
      if (text === '/start') {
        await setChatMenuButton(chatId, lang);
        await sendWelcomeMessage(chatId, lang, user);
        return;
      }
      
      // /help command
      if (text === '/help') {
        await sendSupportMessage(chatId, lang === 'ru' 
          ? '📚 *Помощь Pulse*\n\n/start - Открыть приложение\n/profile - Ваш профиль\n/tasks - Список заданий\n\nНужна помощь? Напишите в поддержку через приложение!'
          : '📚 *Pulse Help*\n\n/start - Open app\n/profile - Your profile\n/tasks - Task list\n\nNeed help? Contact support via the app!',
        { parse_mode: 'Markdown' });
        return;
      }
      
      // Support chat (if in support mode)
      if (text.startsWith('/support')) {
        // Initialize support chat
        await sendSupportMessage(chatId, t('ai_intro', lang));
        return;
      }
    }
    
    // Handle callback query (inline buttons)
    if (update.callback_query) {
      const chatId = update.callback_query.message.chat.id;
      const data = update.callback_query.data;
      const user = update.callback_query.from;
      const lang = getUserLanguage(user);
      
      if (data === 'open_support') {
        await sendSupportMessage(chatId, t('ai_intro', lang));
      }
      
      await telegramRequest('answerCallbackQuery', {
        callback_query_id: update.callback_query.id,
      });
    }
    
  } catch (error) {
    console.error('Webhook error:', error);
  }
}

// ============================================
// SETUP FUNCTIONS
// ============================================

export async function setupBot() {
  console.log('🤖 Setting up Pulse Bot...\n');
  
  try {
    // Get bot info
    const botInfo = await telegramRequest('getMe', {});
    console.log('✅ Bot:', `@${botInfo.result.username}`);
    console.log('   ID:', botInfo.result.id);
    console.log('   Name:', botInfo.result.first_name);
    
    // Set commands
    await setMyCommands();
    console.log('✅ Commands configured');
    
    console.log('\n📱 Direct Link:');
    console.log(`https://t.me/${botInfo.result.username}/app`);
    
    console.log('\n✅ Setup complete!\n');
    
    return botInfo.result;
  } catch (error) {
    console.error('❌ Setup error:', error.message);
    throw error;
  }
}

// ============================================
// CLI
// ============================================

if (typeof require !== 'undefined' && require.main === module) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('❌ Please set TELEGRAM_BOT_TOKEN environment variable');
    process.exit(1);
  }
  
  setupBot();
}
