// Telegram Bot Configuration for Pulse Mini App
// Save this as: telegram-bot-setup.js

const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE'; // Get from @BotFather
const WEB_APP_URL = 'https://pulse-v2-git-main-d999dimon-uis-projects.vercel.app';

// API endpoints
const API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// 1. Set Web App Button (Menu Button)
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
  
  const data = await response.json();
  console.log('Menu Button:', data);
  return data;
}

// 2. Set Inline Keyboard with Web App
async function setInlineKeyboard(chatId) {
  const response = await fetch(`${API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: '👋 Добро пожаловать в Pulse!\n\nНажми на кнопку ниже, чтобы открыть карту заданий и начать зарабатывать.',
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
        ],
      },
    }),
  });
  
  const data = await response.json();
  console.log('Message sent:', data);
  return data;
}

// 3. Set Short Link (t.me/bot/app)
async function setAppLink() {
  // This is configured in @BotFather -> My Bots -> Select Bot -> Bot Settings -> Menu Button
  console.log('Configure in @BotFather:');
  console.log('1. Send /mybots');
  console.log('2. Select your bot');
  console.log('3. Bot Settings -> Menu Button');
  console.log('4. Set URL:', WEB_APP_URL);
}

// 4. Handle /start command
async function handleStart(chatId) {
  await setInlineKeyboard(chatId);
}

// 5. Get bot info
async function getBotInfo() {
  const response = await fetch(`${API_URL}/getMe`);
  const data = await response.json();
  console.log('Bot Info:', data);
  return data;
}

// Export functions
module.exports = {
  setMenuButton,
  setInlineKeyboard,
  setAppLink,
  handleStart,
  getBotInfo,
};

// If run directly
if (require.main === module) {
  console.log('Pulse Telegram Bot Setup');
  console.log('========================');
  console.log('Web App URL:', WEB_APP_URL);
  console.log('');
  console.log('Setup Instructions:');
  console.log('1. Get bot token from @BotFather');
  console.log('2. Replace YOUR_BOT_TOKEN_HERE with your token');
  console.log('3. Run: node telegram-bot-setup.js');
  console.log('');
  console.log('Manual Setup via @BotFather:');
  console.log('1. Send /newbot to create bot');
  console.log('2. Send /setmenubutton');
  console.log('3. Select your bot');
  console.log('4. Send URL:', WEB_APP_URL);
  console.log('5. Send button text: Открыть Pulse');
}
