"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, Loader2, Sparkles, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/utils/translations';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface HelpChatProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

// Ultra-short system prompt to save 80-90% tokens
const getSystemPrompt = (lang: string) => lang === 'ru'
  ? 'Ты помощник TaskHub. Отвечай ТОЛЬКО по делу. Максимум 1 предложение. Без приветствий. Без повторов. Если не знаешь — скажи "Не знаю".'
  : 'You are TaskHub assistant. Answer ONLY on-topic. Maximum 1 sentence. No greetings. No repetitions. If unknown — say "I don\'t know".';

// Response cache to avoid duplicate API calls
const responseCache = new Map<string, string>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default function HelpChat({ isOpen, onClose, userId }: HelpChatProps) {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMsg: Message = { role: 'user', content: trimmed, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Check cache first
    const cacheKey = trimmed.toLowerCase();
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - CACHE_TTL < 0) {
      setMessages(prev => [...prev, { role: 'assistant', content: cached, timestamp: Date.now() }]);
      setIsTyping(false);
      return;
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
          'X-Title': 'TaskHub Help',
        },
        body: JSON.stringify({
          // Cheapest model that works
          model: 'google/gemma-3-1b-it:free',
          messages: [
            { role: 'system', content: getSystemPrompt(language) },
            ...messages.slice(-3).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: trimmed },
          ],
          temperature: 0.3,
          max_tokens: 60, // Ultra short = 80% savings
          presence_penalty: 0.5, // Reduce repetition
        }),
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content?.trim() || (language === 'ru' ? 'Ошибка' : 'Error');

      // Cache response
      responseCache.set(cacheKey, reply);

      setMessages(prev => [...prev, { role: 'assistant', content: reply, timestamp: Date.now() }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: language === 'ru' ? '⚠️ Ошибка соединения' : '⚠️ Connection error',
        timestamp: Date.now(),
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, language, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const quickQuestions = language === 'ru'
    ? ['Как создать задание?', 'Как получить оплату?', 'Что такое Stars?', 'Безопасно ли это?']
    : ['How to create a task?', 'How to get paid?', 'What are Stars?', 'Is it safe?'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[4000] bg-black/60 backdrop-blur-lg flex items-end sm:items-center justify-center">
      <div className="w-full sm:max-w-md h-[75vh] sm:h-[650px] bg-gradient-to-b from-gray-950 via-gray-900 to-black rounded-t-3xl sm:rounded-3xl border border-cyan-500/20 flex flex-col shadow-[0_0_60px_rgba(34,211,238,0.15)]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-t-3xl sm:rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Sparkles size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base">TaskHub {language === 'ru' ? 'Помощник' : 'Assistant'}</h3>
              <p className="text-[11px] text-gray-400 flex items-center gap-1">
                <Shield size={10} /> {language === 'ru' ? 'AI поддержка 24/7' : 'AI Support 24/7'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <span className="text-gray-400 text-xl leading-none">✕</span>
          </button>
        </div>

        {/* Quick Questions */}
        {messages.length === 0 && (
          <div className="p-4 border-b border-white/5">
            <p className="text-xs text-gray-500 mb-3">{language === 'ru' ? 'Частые вопросы:' : 'FAQ:'}</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(q); }}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-300 hover:bg-white/10 hover:border-cyan-500/30 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-start gap-2 ${msg.role === 'assistant' ? '' : 'flex-row-reverse'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                msg.role === 'assistant' ? 'bg-gradient-to-br from-cyan-500 to-blue-600' : 'bg-gradient-to-br from-purple-500 to-pink-600'
              }`}>
                {msg.role === 'assistant' ? <Sparkles size={16} className="text-white" /> : <span className="text-white text-xs font-bold">{userId.charAt(0).toUpperCase()}</span>}
              </div>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'assistant'
                  ? 'bg-white/8 text-gray-200 rounded-tl-none border border-white/5'
                  : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white rounded-tr-none border border-cyan-500/20'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Sparkles size={16} className="text-white" />
              </div>
              <div className="bg-white/8 px-4 py-3 rounded-2xl rounded-tl-none border border-white/5">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Loader2 size={14} className="animate-spin" />
                  {language === 'ru' ? 'Думаю...' : 'Thinking...'}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10 bg-black/50">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={language === 'ru' ? 'Ваш вопрос...' : 'Your question...'}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm
                         placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
              disabled={isTyping}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl hover:shadow-lg hover:shadow-cyan-500/20
                         disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
