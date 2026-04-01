// Pulse Telegram Bot with WebApp Integration
// Full bot implementation with WebApp data handling

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN';
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://pulse-v2-git-main-d999dimon-uis-projects.vercel.app';

const API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Bot commands
const COMMANDS = [
  { command: 'start', description: 'Start Pulse Mini App' },
  { command: 'help', description: 'Get help' },
  { command: 'profile', description: 'View your profile' },
  { command: 'tasks', description: 'Browse tasks' },
];

// Set bot commands
async function setMyCommands() {
  const response = await fetch(`${API_URL}/setMyCommands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      commands: COMMANDS,
    }),
  });
  
  return await response.json();
}

// Send welcome message with Web App button
async function sendWelcomeMessage(chatId) {
  const response = await fetch(`${API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `👋 *Добро пожаловать в Pulse!*\n\n` +
            `Pulse — это глобальная платформа заданий.\n` +
            `Выполняй задачи, зарабатывай Stars и USDT!\n\n` +
            ` *Что можно делать:*\n` +
            `• Находить задания рядом\n` +
            `• Делегировать свои задачи\n` +
            `• Зарабатывать в любой точке мира\n\n` +
            `Нажми на кнопку ниже, чтобы начать! 👇`,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🗺️ Открыть карту заданий',
              web_app: {
                url: WEB_APP_URL,
              },
            },
          ],
          [
            {
              text: '👤 Мой профиль',
              callback_data: 'show_profile',
            },
            {
              text: '📋 Мои задания',
              callback_data: 'show_tasks',
            },
          ],
        ],
      },
    }),
  });
  
  return await response.json();
}

// Set menu button (Main Button in bottom-left)
async function setMenuButton() {
  const response = await fetch(`${API_URL}/setChatMenuButton`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      button: {
        type: 'web_app',
        text: 'Открыть Pulse',
        web_app: {
          url: WEB_APP_URL,
        },
      },
    }),
  });
  
  return await response.json();
}

// Handle Web App data (when user closes Mini App)
async function handleWebAppData(chatId, webAppData) {
  // Parse data from Mini App
  const data = JSON.parse(webAppData);
  
  // Example: User completed a task
  if (data.action === 'task_completed') {
    await fetch(`${API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `✅ *Задание выполнено!*\n\n` +
              `Task ID: \`${data.taskId}\`\n` +
              `Reward: ${data.reward} ${data.currency}\n\n` +
              `Средства зачислены на ваш баланс! 💰`,
        parse_mode: 'Markdown',
      }),
    });
  }
  
  // Example: User needs support
  if (data.action === 'support_request') {
    await fetch(`${API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🆘 *Запрос в поддержку*\n\n` +
              `Ваш запрос отправлен. Менеджер ответит в ближайшее время.`,
        parse_mode: 'Markdown',
      }),
    });
  }
}

// Get bot info
async function getBotInfo() {
  const response = await fetch(`${API_URL}/getMe`);
  const data = await response.json();
  
  console.log('Bot Info:');
  console.log('- ID:', data.result.id);
  console.log('- Name:', data.result.first_name);
  console.log('- Username:', data.result.username);
  console.log('- Can join groups:', data.result.can_join_groups);
  console.log('- Can read messages:', data.result.can_read_all_group_messages);
  console.log('- Supports inline:', data.result.supports_inline_queries);
  
  return data.result;
}

// Webhook handler (for production)
async function handleWebhook(req, res) {
  const update = await req.json();
  
  // Handle message
  if (update.message) {
    const chatId = update.message.chat.id;
    const text = update.message.text;
    
    if (text === '/start') {
      await sendWelcomeMessage(chatId);
    } else if (text === '/help') {
      await fetch(`${API_URL}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `📚 *Pulse Help*\n\n` +
                `/start - Открыть приложение\n` +
                `/profile - Ваш профиль\n` +
                `/tasks - Список заданий\n\n` +
                `Нужна помощь? Напишите в поддержку через приложение!`,
          parse_mode: 'Markdown',
        }),
      });
    }
  }
  
  // Handle callback query (inline buttons)
  if (update.callback_query) {
    const chatId = update.callback_query.message.chat.id;
    const data = update.callback_query.data;
    
    if (data === 'show_profile') {
      await fetch(`${API_URL}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '👤 Откройте приложение, чтобы увидеть профиль!',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🗺️ Открыть Pulse', web_app: { url: WEB_APP_URL } }],
            ],
          },
        }),
      });
    }
    
    // Answer callback
    await fetch(`${API_URL}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: update.callback_query.id,
      }),
    });
  }
  
  res.status(200).send('OK');
}

// Export for use
module.exports = {
  setMyCommands,
  sendWelcomeMessage,
  setMenuButton,
  handleWebAppData,
  getBotInfo,
  handleWebhook,
};

// CLI setup
if (typeof require !== 'undefined' && require.main === module) {
  console.log('🚀 Pulse Telegram Bot Setup\n');
  console.log('Web App URL:', WEB_APP_URL);
  console.log('');
  
  // Run setup
  (async () => {
    try {
      const botInfo = await getBotInfo();
      console.log('✅ Bot:', `@${botInfo.username}`);
      
      await setMyCommands();
      console.log('✅ Commands set');
      
      await setMenuButton();
      console.log('✅ Menu button configured');
      
      console.log('');
      console.log('📱 Direct Link:');
      console.log(`https://t.me/${botInfo.username}/app`);
      console.log('');
      console.log('✅ Setup complete!');
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  })();
}
