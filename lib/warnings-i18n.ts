// Multi-language Warning & Disclaimer System
// All system messages must match user's selected language (RU/EN)

export type Language = 'ru' | 'en';

export interface WarningMessages {
  escrowDisclaimer: string;
  offPlatformAttempt: string;
  fraudWarning: string;
  ratingBlockWarning: string;
  directDealRisk: string;
  accountBlocked: string;
  bonusRevoked: string;
  suspiciousActivity: string;
}

export const WARNING_MESSAGES: Record<Language, WarningMessages> = {
  ru: {
    escrowDisclaimer:
      '⚠️ Внимание! Платформа Pulse не несет финансовой ответственности за сделки, совершенные ВНЕ приложения. Договариваясь напрямую, вы теряете защиту Escrow и рискуете деньгами.',
    
    offPlatformAttempt:
      '⚠️ Ваша попытка договориться вне проекта зафиксирована. Это лишает вас страховки. Повторное нарушение приведет к блокировке рейтинга.',
    
    fraudWarning:
      '🚫 Обнаружена подозрительная активность. Ваша транзакция приостановлена до проверки службой безопасности.',
    
    ratingBlockWarning:
      '⛔ Предупреждение: При повторной попытке обхода системы ваш рейтинг будет заблокирован.',
    
    directDealRisk:
      '⚠️ Прямые сделки вне Pulse не защищены. Вы можете потерять деньги без возможности возврата.',
    
    accountBlocked:
      '🔒 Ваш аккаунт заблокирован за нарушение правил платформы. Обратитесь в поддержку для разблокировки.',
    
    bonusRevoked:
      '❌ Ваши бонусные часы аннулированы за нарушение условий использования.',
    
    suspiciousActivity:
      '⚠️ Зафиксирована подозрительная активность. Рекомендуется сменить пароль и включить двухфакторную аутентификацию.',
  },
  
  en: {
    escrowDisclaimer:
      '⚠️ Warning! Pulse platform is not financially responsible for transactions made OUTSIDE the app. Negotiating directly voids your Escrow protection and puts your money at risk.',
    
    offPlatformAttempt:
      '⚠️ Your attempt to negotiate off-platform has been recorded. This voids your insurance. Repeated violations will result in rating block.',
    
    fraudWarning:
      '🚫 Suspicious activity detected. Your transaction is suspended pending security review.',
    
    ratingBlockWarning:
      '⛔ Warning: Repeated attempts to bypass the system will result in rating block.',
    
    directDealRisk:
      '⚠️ Direct deals outside Pulse are unprotected. You may lose money with no recourse.',
    
    accountBlocked:
      '🔒 Your account has been blocked for violating platform rules. Contact support for unblocking.',
    
    bonusRevoked:
      '❌ Your bonus hours have been revoked for violating terms of service.',
    
    suspiciousActivity:
      '⚠️ Suspicious activity detected. Recommended to change password and enable two-factor authentication.',
  },
};

// Get warning message by language
export function getWarningMessage(
  type: keyof WarningMessages,
  lang: Language = 'ru'
): string {
  return WARNING_MESSAGES[lang][type] || WARNING_MESSAGES.ru[type];
}

// Auto-detect language from user profile or browser
export function detectUserLanguage(): Language {
  // SSR check - default to Russian
  if (typeof window === 'undefined') return 'ru';

  // Check localStorage first
  try {
    const saved = localStorage.getItem('language');
    if (saved === 'ru' || saved === 'en') return saved;
  } catch (e) {
    // localStorage not available
  }

  // Try browser language
  try {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('en')) return 'en';
  } catch (e) {
    // navigator not available
  }

  return 'ru'; // Default
}

// Get user's selected language from profile
export async function getUserLanguage(userId: string): Promise<Language> {
  // This would fetch from Supabase user_profiles
  // For now, fallback to auto-detect
  return detectUserLanguage();
}

export function getUserLanguageSync(): Language {
  return detectUserLanguage();
}

// Format warning with dynamic data
export function formatWarning(
  type: keyof WarningMessages,
  lang: Language,
  params?: Record<string, string | number>
): string {
  let message = getWarningMessage(type, lang);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, String(value));
    });
  }
  
  return message;
}

// Check if message contains off-platform keywords (multi-language)
export const OFF_PLATFORM_KEYWORDS: Record<Language, string[]> = {
  ru: [
    'без комиссии', 'без процента', 'напрямую', 'на карту',
    'переведи', 'скинь на', 'номер карты', 'реквизиты',
    'телефон', 'ватсап', 'телеграм', 'инстаграм',
  ],
  en: [
    'no commission', 'no fee', 'direct', 'directly',
    'bank transfer', 'card number', 'account details',
    'phone', 'whatsapp', 'telegram', 'instagram',
    'off platform', 'outside app', 'cash',
  ],
};

// Scan message for off-platform attempts in any language
export function scanForOffPlatformKeywords(
  message: string,
  userLang?: Language
): { detected: boolean; language?: Language | 'unknown'; keywords?: string[] } {
  const lowerMessage = message.toLowerCase();
  const langToCheck = userLang || detectUserLanguage();

  // Check in user's language first
  const keywords = OFF_PLATFORM_KEYWORDS[langToCheck];
  const foundKeywords: string[] = [];

  for (const keyword of keywords) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      foundKeywords.push(keyword);
    }
  }

  if (foundKeywords.length > 0) {
    return {
      detected: true,
      language: langToCheck,
      keywords: foundKeywords,
    };
  }

  // Check in other languages as fallback
  for (const [lang, kw] of Object.entries(OFF_PLATFORM_KEYWORDS)) {
    if (lang === langToCheck) continue;

    for (const keyword of kw) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        foundKeywords.push(keyword);
      }
    }
  }

  if (foundKeywords.length > 0) {
    return {
      detected: true,
      language: 'unknown' as const,
      keywords: foundKeywords,
    };
  }

  return { detected: false };
}

// Generate contextual warning based on detected keywords
export function generateContextualWarning(
  scanResult: ReturnType<typeof scanForOffPlatformKeywords>,
  lang: Language
): string {
  if (!scanResult.detected) return '';
  
  const hasCommissionKeywords = scanResult.keywords?.some(k =>
    k.includes('commission') || k.includes('комисс') || k.includes('komissiya')
  );
  
  const hasContactKeywords = scanResult.keywords?.some(k =>
    ['phone', 'whatsapp', 'telegram', 'телефон', 'ватсап'].some(c => k.includes(c))
  );
  
  const hasPaymentKeywords = scanResult.keywords?.some(k =>
    ['card', 'bank', 'transfer', 'карт', 'перевод', 'karta'].some(c => k.includes(c))
  );
  
  if (hasCommissionKeywords) {
    return getWarningMessage('offPlatformAttempt', lang);
  }
  
  if (hasContactKeywords) {
    return getWarningMessage('ratingBlockWarning', lang);
  }
  
  if (hasPaymentKeywords) {
    return getWarningMessage('directDealRisk', lang);
  }
  
  return getWarningMessage('fraudWarning', lang);
}

// Disclaimer component props
export interface DisclaimerProps {
  lang?: Language;
  type?: 'escrow' | 'direct-deal' | 'chat';
  className?: string;
}

// Get disclaimer by type
export function getDisclaimerByType(type: 'escrow' | 'direct-deal' | 'chat', lang: Language): string {
  if (type === 'escrow' || type === 'chat') {
    return getWarningMessage('escrowDisclaimer', lang);
  }
  return getWarningMessage('directDealRisk', lang);
}
