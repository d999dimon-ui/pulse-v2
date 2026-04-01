# Pulse Telegram Bot Configuration

## 🤖 Bot Setup Instructions

### Step 1: Create Bot via @BotFather

1. Open Telegram and find **@BotFather**
2. Send `/newbot`
3. Enter bot name: `Pulse Assistant`
4. Enter username: `PulseHelperBot` (must end with 'bot')
5. **Save the API token** (looks like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Step 2: Configure Menu Button

**Option A: Via @BotFather (Recommended)**
```
1. Send /mybots
2. Select your bot
3. Bot Settings → Menu Button
4. Send URL: https://pulse-v2-git-main-d999dimon-uis-projects.vercel.app
5. Send button text: Открыть Pulse
```

**Option B: Via API (Node.js)**
```bash
# Install dependencies
npm install node-fetch

# Update token in telegram-bot-setup.js
# Run setup
node telegram-bot-setup.js
```

### Step 3: Direct Link

After setup, users can access via:
- **Direct Link:** `t.me/YOUR_BOT_NAME/app`
- **Menu Button:** Bottom-left button in chat
- **Inline Button:** After `/start` command

### Step 4: Welcome Message

When user sends `/start`, bot will show:
```
👋 Добро пожаловать в Pulse!

Нажми на кнопку ниже, чтобы открыть карту заданий и начать зарабатывать.

[🗺️ Открыть карту заданий]
```

---

## 🔧 Environment Variables

Add to Vercel Environment Variables:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_BOT_USERNAME=your_bot_username
```

---

## 📱 Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message + Web App button |
| `/help` | Help information |
| `/settings` | User settings |

---

## 🎨 Bot Profile

**Name:** Pulse Assistant  
**Username:** @PulseHelperBot  
**Description:** Earn money by completing tasks in your area  
**About:** Pulse is a global task marketplace. Complete tasks, earn Stars/USDT, track in real-time.

---

## 🚀 Quick Start

1. Get bot token from @BotFather
2. Update `telegram-bot-setup.js` with your token
3. Run: `node telegram-bot-setup.js`
4. Test: Open bot in Telegram and click menu button

---

## 📝 Notes

- Web App URL must be HTTPS ✅
- Button text supports emoji ✅
- Direct link format: `t.me/botname/app`
- Menu button appears in bottom-left corner
