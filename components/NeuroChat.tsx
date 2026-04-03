"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/utils/translations';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface NeuroChatProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const SYSTEM_PROMPT = `You are NeuroChat, an AI assistant for TaskHub - a freelance task marketplace. 
You help users with: finding tasks, understanding pricing, getting started, referral program, withdrawals.
Keep responses short (2-3 sentences). Be friendly and helpful. Respond in the same language as the user.`;

export default function NeuroChat({ isOpen, onClose, userId }: NeuroChatProps) {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'assistant', content: t(language, 'neuro.welcome') },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
          'X-Title': 'TaskHub NeuroChat',
        },
        body: JSON.stringify({
          model: 'google/gemma-3-27b-it:free',
          messages: [...messages, userMessage].slice(-10),
          temperature: 0.7,
          max_tokens: 200,
        }),
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices?.[0]?.message?.content || 'Sorry, I could not process that.',
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (e) {
      console.error('NeuroChat error:', e);
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Connection error. Try again.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[4000] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <div className="w-full sm:max-w-md h-[70vh] sm:h-[600px] bg-gradient-to-b from-gray-900 to-black rounded-t-3xl sm:rounded-3xl border border-purple-500/30 flex flex-col shadow-[0_0_40px_rgba(168,85,247,0.2)]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">{t(language, 'neuro.title')}</h3>
              <p className="text-[10px] text-gray-400">AI Assistant</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.filter(m => m.role !== 'system').map((msg, i) => (
            <div key={i} className={`flex items-start gap-2 ${msg.role === 'assistant' ? '' : 'flex-row-reverse'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'assistant' ? 'bg-purple-500/20' : 'bg-cyan-500/20'
              }`}>
                {msg.role === 'assistant' ? <Bot size={16} className="text-purple-400" /> : <UserIcon size={16} className="text-cyan-400" />}
              </div>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                msg.role === 'assistant'
                  ? 'bg-white/5 text-gray-200 rounded-tl-none'
                  : 'bg-cyan-500/20 text-white rounded-tr-none'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Bot size={16} className="text-purple-400" />
              </div>
              <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-tl-none">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Loader2 size={14} className="animate-spin" />
                  {t(language, 'neuro.typing')}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t(language, 'neuro.placeholder')}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm
                         placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
              disabled={isTyping}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:opacity-90 transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
