// AI Content Moderation System
// Blocks criminal, weapons, drugs, and other illegal content

import { supabase } from './supabase';

// Forbidden keywords database (multi-language)
const FORBIDDEN_KEYWORDS = {
  drugs: [
    'наркотик', 'наркотики', 'наркота', 'дурь', 'трава', 'кокаин', 'героин', 'марихуана',
    'drug', 'drugs', 'cocaine', 'heroin', 'weed', 'marijuana', 'meth', 'crack',
    'гиёҳванд', 'нарко', 'дурмани',
  ],
  weapons: [
    'оружие', 'пистолет', 'автомат', 'винтовка', 'нож', 'бомба', 'взрывчатка', 'граната',
    'weapon', 'gun', 'pistol', 'rifle', 'knife', 'bomb', 'explosive', 'grenade', 'firearm',
    'қурол', 'топпа', 'автомат', 'бомба',
  ],
  violence: [
    'убить', 'убийство', 'насилие', 'изнасилование', 'террорист', 'терроризм', 'экстремизм',
    'kill', 'murder', 'violence', 'rape', 'terrorist', 'terrorism', 'extremism',
    'куштан', 'кушиш', 'зоравонлик',
  ],
  fraud: [
    'обман', 'мошенник', 'афера', 'скам', 'фишинг', 'carding',
    'fraud', 'scam', 'phishing', 'carding', 'hack',
  ],
};

const SEVERITY_LEVELS = {
  drugs: 'critical',
  weapons: 'critical',
  violence: 'critical',
  fraud: 'high',
} as const;

interface ModerationResult {
  isSafe: boolean;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  detectedCategory: string | null;
  detectedWords: string[];
  shouldBlock: boolean;
  message: string;
}

// Check text against forbidden keywords
function checkKeywords(text: string): ModerationResult {
  const lowerText = text.toLowerCase();
  const detectedWords: string[] = [];
  let maxSeverity: string = 'none';
  let detectedCategory: string | null = null;

  for (const [category, keywords] of Object.entries(FORBIDDEN_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        detectedWords.push(keyword);
        const severity = SEVERITY_LEVELS[category as keyof typeof SEVERITY_LEVELS] || 'low';
        if (severity === 'critical') maxSeverity = 'critical';
        else if (severity === 'high' && maxSeverity !== 'critical') maxSeverity = 'high';
        else if (severity === 'medium' && !['critical', 'high'].includes(maxSeverity)) maxSeverity = 'medium';
        if (!detectedCategory) detectedCategory = category;
      }
    }
  }

  const shouldBlock = ['critical', 'high'].includes(maxSeverity);

  const messages = {
    ru: {
      critical: '⛔ Задание заблокировано. Обнаружен запрещённый контент.',
      high: '⚠️ Задание отправлено на модерацию. Обнаружен подозрительный контент.',
      medium: 'Задание создано, но будет проверено.',
      none: '',
    },
    en: {
      critical: '⛔ Task blocked. Prohibited content detected.',
      high: '⚠️ Task sent for moderation. Suspicious content detected.',
      medium: 'Task created but will be reviewed.',
      none: '',
    },
  };

  return {
    isSafe: detectedWords.length === 0,
    severity: maxSeverity as ModerationResult['severity'],
    detectedCategory,
    detectedWords,
    shouldBlock,
    message: detectedWords.length > 0 ? (messages.ru as any)[maxSeverity] || messages.ru.none : '',
  };
}

// AI-powered moderation using OpenRouter
export async function aiModerateText(text: string, language: 'en' | 'ru'): Promise<ModerationResult> {
  // First check local keywords (fast, free)
  const keywordResult = checkKeywords(text);
  if (keywordResult.shouldBlock) return keywordResult;

  // Then AI check for subtle violations
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
        'X-Title': 'TaskHub Moderation',
      },
      body: JSON.stringify({
        model: 'google/gemma-3-1b-it:free',
        messages: [
          {
            role: 'system',
            content: language === 'ru'
              ? 'Ты модератор. Проверь текст на: наркотики, оружие, насилие, мошенничество. Ответь ТОЛЬКО: SAFE, LOW, HIGH, или CRITICAL.'
              : 'You are a moderator. Check text for: drugs, weapons, violence, fraud. Reply ONLY: SAFE, LOW, HIGH, or CRITICAL.',
          },
          { role: 'user', content: text.substring(0, 500) },
        ],
        temperature: 0.1,
        max_tokens: 10,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const aiVerdict = data.choices?.[0]?.message?.content?.trim().toUpperCase() || 'SAFE';

      if (aiVerdict === 'CRITICAL' || aiVerdict === 'HIGH') {
        return {
          isSafe: false,
          severity: aiVerdict.toLowerCase() as 'critical' | 'high',
          detectedCategory: 'ai_flagged',
          detectedWords: [],
          shouldBlock: aiVerdict === 'CRITICAL',
          message: language === 'ru'
            ? '⚠️ Задание отправлено на ручную модерацию.'
            : '⚠️ Task sent for manual review.',
        };
      }
    }
  } catch {
    // If AI fails, rely on keyword check
  }

  return keywordResult;
}

// Check chat messages in real-time
export function moderateChatMessage(text: string): { isSafe: boolean; reason: string } {
  const result = checkKeywords(text);
  if (!result.isSafe) {
    return {
      isSafe: false,
      reason: result.severity === 'critical'
        ? 'Запрещённый контент'
        : 'Подозрительный контент',
    };
  }

  // Check for phone numbers (blocked until task completed)
  const phoneRegex = /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/;
  if (phoneRegex.test(text)) {
    return { isSafe: false, reason: 'Передача контактов запрещена' };
  }

  // Check for external links
  const linkRegex = /https?:\/\/|t\.me\/|wa\.me\/|whatsapp/i;
  if (linkRegex.test(text)) {
    return { isSafe: false, reason: 'Внешние ссылки запрещены' };
  }

  return { isSafe: true, reason: '' };
}

// Log moderation violations to Supabase
export async function logViolation(
  userId: string,
  taskId: string,
  severity: string,
  category: string,
  text: string
) {
  try {
    await supabase.from('moderation_logs').insert({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      task_id: taskId,
      severity,
      category,
      content_snippet: text.substring(0, 200),
      created_at: new Date().toISOString(),
    });
  } catch { /* ignore */ }
}

// Check if user has too many violations (auto-ban)
export async function checkUserViolations(userId: string): Promise<{ isBanned: boolean; reason: string }> {
  try {
    const { data, error } = await supabase
      .from('moderation_logs')
      .select('severity')
      .eq('user_id', userId)
      .eq('severity', 'critical');

    if (!error && data && data.length >= 3) {
      return { isBanned: true, reason: 'Множественные нарушения правил' };
    }
  } catch { /* ignore */ }

  return { isBanned: false, reason: '' };
}
