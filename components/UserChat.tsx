"use client";

import { useEffect, useState, useRef } from 'react';
import { Send, Bot, Shield, Eye, EyeOff, Phone, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/utils/translations';
import { moderateChatMessage } from '@/lib/ai-moderation';
import HelpChat from './HelpChat';

interface UserChatProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  taskId: string;
  otherUserId: string;
  taskStatus: string;
}

export default function UserChat({ isOpen, onClose, userId, taskId, otherUserId, taskStatus }: UserChatProps) {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Array<{
    id: string;
    senderId: string;
    content: string;
    timestamp: number;
    isModerated: boolean;
  }>>([]);
  const [input, setInput] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isTaskCompleted = taskStatus === 'completed';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // AI Moderation check
    const moderation = moderateChatMessage(trimmed);
    if (!moderation.isSafe) {
      alert(language === 'ru' ? moderation.reason : moderation.reason);
      return;
    }

    setMessages(prev => [...prev, {
      id: `${Date.now()}`,
      senderId: userId,
      content: trimmed,
      timestamp: Date.now(),
      isModerated: true,
    }]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[4000] bg-black/60 backdrop-blur-lg flex items-end sm:items-center justify-center">
      <div className="w-full sm:max-w-md h-[75vh] sm:h-[650px] bg-gradient-to-b from-gray-950 via-gray-900 to-black rounded-t-3xl sm:rounded-3xl border border-white/10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <div>
            <h3 className="text-white font-bold">{t(language, 'chat.title')}</h3>
            <p className="text-xs text-gray-400">{isTaskCompleted ? '✅ Заказ завершён' : '🔄 Заказ в процессе'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsHelpOpen(true)} className="p-2 bg-cyan-500/20 rounded-xl">
              <Bot size={18} className="text-cyan-400" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl">
              <span className="text-gray-400">✕</span>
            </button>
          </div>
        </div>

        {/* Contact visibility notice */}
        {!isTaskCompleted && (
          <div className="p-3 bg-yellow-500/10 border-b border-yellow-500/20">
            <div className="flex items-center gap-2 text-xs text-yellow-400">
              <Shield size={14} />
              <span>{language === 'ru' ? 'Контакты скрыты до завершения заказа' : 'Contacts hidden until order completed'}</span>
            </div>
          </div>
        )}

        {/* Contact reveal when completed */}
        {isTaskCompleted && (
          <div className="p-3 bg-green-500/10 border-b border-green-500/20">
            <button
              onClick={() => setShowContacts(!showContacts)}
              className="flex items-center gap-2 text-xs text-green-400"
            >
              {showContacts ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>{showContacts
                ? (language === 'ru' ? 'Скрыть контакт' : 'Hide contact')
                : (language === 'ru' ? 'Показать номер телефона' : 'Show phone number')
              }</span>
            </button>
            {showContacts && (
              <div className="mt-2 flex items-center gap-2">
                <Phone size={14} className="text-green-400" />
                <span className="text-white text-sm font-mono">+996 XXX XXX XXX</span>
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Clock size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">{t(language, 'chat.noChats')}</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                msg.senderId === userId
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white rounded-tr-none border border-cyan-500/20'
                  : 'bg-white/8 text-gray-200 rounded-tl-none border border-white/5'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
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
              placeholder={t(language, 'chat.sendMessage')}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm
                         placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl disabled:opacity-40 active:scale-95"
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Help Chat overlay */}
      <HelpChat isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} userId={userId} />
    </div>
  );
}
