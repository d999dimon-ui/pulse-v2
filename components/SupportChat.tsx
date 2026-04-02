"use client";

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/utils/translations';
import { Send, X, Bot, User, AlertTriangle, Gift, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { checkUserBonusesForSupport } from '@/lib/referral-bonus';
import { getWarningMessage, Language } from '@/lib/warnings-i18n';

interface SupportChatProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const SYSTEM_PROMPT = `Ты — менеджер поддержки Pulse. Отвечай ТОЛЬКО на русском или английском.
ПРАВИЛА:
1. Отвечай максимально коротко (2-3 предложения)
2. Не признавай что ты ИИ. На "Ты бот?" отвечай "Нет, я менеджер поддержки Pulse"
3. Если вопрос не по теме Pulse — отвечай: "Извините, я консультирую только по вопросам Pulse. Чем помочь по вашему заказу?"
4. Если пользователь пишет на другом языке — "Извините, поддержка доступна только на русском и английском языках"
5. После 2 предупреждений о флуде — ставь флаг needs_admin_help: true
6. Если пользователь пишет "Human" или недоволен после 3 сообщений — ставь needs_admin_help: true

БОНУСЫ:
- Ты можешь ВИДЕТЬ бонусы пользователя через API
- НЕЛЬЗЯ выдавать промокоды самостоятельно
- Если пользователь просит компенсацию — проверь доказательства (фото/скриншоты)
- Если доказательства чёткие — можешь выдать бонус 30 мин - 6 часов
- Если ситуация спорная — передай админу
- Никогда не давай больше 6 часов за раз
- Если доказательства сомнительные — отказывай вежливо

Будь вежливым и профессиональным.`;

export default function SupportChat({ isOpen, onClose, userId }: SupportChatProps) {
  const { language, setLanguage } = useLanguage();
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [needsAdminHelp, setNeedsAdminHelp] = useState(false);
  const [userBonuses, setUserBonuses] = useState<{
    hasActiveBonus: boolean;
    remainingMinutes: number;
    totalReferrals: number;
    pendingBonus: number;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageCountRef = useRef(0);

  // Use language from context for warnings
  const warningLang: Language = (language === 'ru' || language === 'en') ? language : 'ru';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load or create chat session
  useEffect(() => {
    if (isOpen && userId) {
      loadOrCreateChat();
      loadUserBonuses();
    }
  }, [isOpen, userId]);

  const loadUserBonuses = async () => {
    const bonuses = await checkUserBonusesForSupport(userId);
    setUserBonuses(bonuses);
  };

  const loadOrCreateChat = async () => {
    // Try to load existing chat
    const { data: existingChat } = await supabase
      .from('support_chats')
      .select('*')
      .eq('user_id', userId)
      .eq('is_resolved', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingChat) {
      setChatId(existingChat.id);
      setMessages(existingChat.messages || []);
      setNeedsAdminHelp(existingChat.needs_admin_help);
    } else {
      // Create new chat
      const { data: newChat } = await supabase
        .from('support_chats')
        .insert({
          user_id: userId,
          messages: [],
          needs_admin_help: false,
        })
        .select()
        .single();

      if (newChat) {
        setChatId(newChat.id);
        // Add welcome message
        const welcomeMsg = { role: 'assistant', content: language === 'ru' 
          ? 'Здравствуйте! Я менеджер поддержки Pulse. Чем могу помочь?' 
          : 'Hello! I\'m a Pulse support manager. How can I help you?' };
        setMessages([welcomeMsg]);
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !chatId) return;

    const userMsg = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    messageCountRef.current += 1;

    // Check for "Human" request
    if (input.toLowerCase().includes('human') || messageCountRef.current > 3) {
      setNeedsAdminHelp(true);
      await supabase
        .from('support_chats')
        .update({ needs_admin_help: true })
        .eq('id', chatId);
    }

    // Save to database
    await supabase
      .from('support_chats')
      .update({ messages: updatedMessages })
      .eq('id', chatId);

    // Call AI API
    setIsLoading(true);
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Pulse Support',
        },
        body: JSON.stringify({
          model: 'qwen/qwen-2.5-72b-instruct',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...updatedMessages,
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      const data = await response.json();
      const aiMsg = { 
        role: 'assistant', 
        content: data.choices[0]?.message?.content || getWarningMessage('fraudWarning', warningLang)
      };

      const finalMessages = [...updatedMessages, aiMsg];
      setMessages(finalMessages);

      // Save to database
      await supabase
        .from('support_chats')
        .update({ messages: finalMessages })
        .eq('id', chatId);

    } catch (error) {
      console.error('AI Error:', error);
      const errorMsg = { role: 'assistant', content: getWarningMessage('fraudWarning', warningLang) };
      setMessages([...updatedMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[4500]" onClick={onClose} />
      
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-[4501]">
        <div className="bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl
                        border border-purple-500/30 rounded-3xl overflow-hidden
                        shadow-[0_0_40px_rgba(168,85,247,0.2)] max-h-[80vh] flex flex-col">
          
          {/* Header */}
          <div className="relative p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-white/10">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500
                              flex items-center justify-center">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Pulse Support</h2>
                <p className="text-xs text-gray-400">
                  {needsAdminHelp 
                    ? (language === 'ru' ? '⚠️ Ожидает помощи админа' : '⚠️ Awaiting admin help')
                    : (language === 'ru' ? 'Онлайн поддержка' : 'Online Support')}
                </p>
              </div>
            </div>
            
            {needsAdminHelp && (
              <div className="mt-3 flex items-center gap-2 text-yellow-400 text-xs bg-yellow-500/20 px-3 py-2 rounded-xl">
                <AlertTriangle size={14} />
                <span>{language === 'ru' ? 'Ваш запрос передан администрации' : 'Your request has been escalated to admin'}</span>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}>
                  {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
                </div>
                <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50'
                    : 'bg-white/5 border border-white/10'
                }`}>
                  <p className="text-sm text-white whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={language === 'ru' ? 'Введите сообщение...' : 'Type a message...'}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                           text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl
                           disabled:opacity-50 disabled:cursor-not-allowed
                           hover:opacity-90 transition-all"
              >
                <Send size={20} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
