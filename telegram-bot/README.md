# Pulse Telegram Bot - Complete Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Create Bot

1. Open Telegram → Find **@BotFather**
2. Send: `/newbot`
3. Name: `Pulse Assistant`
4. Username: `PulseHelperBot` (must end with 'bot')
5. **SAVE THE TOKEN** (format: `1234567890:ABCdef...`)

### Step 2: Set Webhook (Vercel)

After deploying to Vercel:

```bash
# Replace with your actual URLs
curl -X POST "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook" \
  -d "url=https://your-app.vercel.app/api/telegram-bot"
```

### Step 3: Configure Menu Button

**Via @BotFather:**
```
1. Send: /mybots
2. Select your bot
3. Bot Settings → Menu Button
4. Send URL: https://your-app.vercel.app
5. Send text (RU): Открыть Pulse 🌍
   Send text (EN): Open Pulse 🌍
```

**Via API:**
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_TOKEN>/setChatMenuButton" \
  -H "Content-Type: application/json" \
  -d '{
    "button": {
      "type": "web_app",
      "text": "Open Pulse 🌍",
      "web_app": {
        "url": "https://your-app.vercel.app"
      }
    }
  }'
```

---

## 📋 Features

### 1. Auto-Language Detection (RU/EN Only)

Bot automatically detects user's language from `language_code`:

| Language Code | Bot Response |
|--------------|--------------|
| `ru`, `uk`, `be` | Russian |
| All others | English |

**Welcome Messages:**
- **RU:** "Добро пожаловать в Pulse! Нажми на кнопку ниже, чтобы открыть карту заданий."
- **EN:** "Welcome to Pulse! Click the button below to open the task map."

**Button Text:**
- **RU:** "Запустить Pulse 🚀"
- **EN:** "Launch Pulse 🚀"

### 2. Dynamic Menu Button

Based on user's language:
- **RU:** "Открыть Pulse 🌍"
- **EN:** "Open Pulse 🌍"

### 3. Direct Link

```
https://t.me/YOUR_BOT_USERNAME/app
```

Opens Mini App directly without chat.

---

## 🤖 AI Support (Economy Mode)

### System Prompt Rules:

1. **Language:** Only Russian or English
2. **Response Length:** Max 2-3 sentences
3. **Token Limit:** 150 tokens max
4. **Temperature:** 0.3 (focused responses)
5. **Identity:** Never admit being AI → "I'm a Pulse support manager"
6. **Off-topic:** "Sorry, I only consult on Pulse matters. How can I help with your order?"
7. **Escalation:** After 3 messages or "Human" keyword → `needs_admin_help: true`

### Database Schema (Supabase):

```sql
CREATE TABLE support_chats (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  messages JSONB[],
  language TEXT DEFAULT 'en',
  message_count INTEGER DEFAULT 0,
  needs_admin_help BOOLEAN DEFAULT FALSE,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### AI Integration:

```javascript
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
  },
  body: JSON.stringify({
    model: 'qwen/qwen-2.5-72b-instruct',
    messages: [...messages],
    temperature: 0.3,
    max_tokens: 150,
    stop: ['\n\n\n'],
  }),
});
```

---

## 🔧 Environment Variables

Add to Vercel:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_key
WEB_APP_URL=https://your-app.vercel.app
```

---

## 📱 Bot Commands

| Command | RU | EN |
|---------|-----|-----|
| `/start` | Запустить приложение | Start Pulse App |
| `/help` | Помощь | Get help |
| `/profile` | Мой профиль | View profile |
| `/tasks` | Задания | Browse tasks |

---

## 🎯 Testing Checklist

- [ ] Bot responds to `/start` in Russian (for RU users)
- [ ] Bot responds to `/start` in English (for EN users)
- [ ] Menu button shows correct language
- [ ] Inline button opens Web App
- [ ] Direct link `t.me/bot/app` works
- [ ] AI support responds in correct language
- [ ] AI responses are short (2-3 sentences)
- [ ] Off-topic questions get warning
- [ ] "Human" keyword escalates to admin

---

## 🐛 Troubleshooting

**Bot doesn't respond:**
- Check webhook: `https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
- Verify Vercel function is deployed

**Wrong language:**
- Check user's `language_code` in Telegram
- Bot defaults to English for unknown languages

**AI not working:**
- Verify OpenRouter API key
- Check token limit (150 max)

---

## 📞 Support

For admin intervention, check `/admin-pulse-master` → Support tab
