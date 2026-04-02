"use client";

import { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, X, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ChatRoomProps {
  taskId: string;
  taskTitle: string;
  participantId: string;
  isCompleted: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export default function ChatRoom({ taskId, taskTitle, participantId, isCompleted, onClose }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`chat-${taskId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `task_id=eq.${taskId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) console.error('Load messages error:', error);
    else setMessages(data || []);

    setIsLoading(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isCompleted) return;

    const message = {
      task_id: taskId,
      sender_id: currentUser.id,
      receiver_id: participantId,
      content: newMessage,
      message_type: 'text',
    };

    const { error } = await supabase.from('messages').insert(message);

    if (error) {
      console.error('Send message error:', error);
    } else {
      setNewMessage('');
    }
  };

  const handleCall = () => {
    // Open phone dialer
    window.location.href = 'tel:+';
  };

  const canSendMessages = !isCompleted;

  return (
    <div className="fixed inset-0 z-[6000] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <X size={24} className="text-white" />
          </button>
          <div>
            <h3 className="font-bold text-white">{taskTitle}</h3>
            <p className="text-xs text-gray-400">
              {isCompleted ? '✓ Завершён' : '● Активен'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleCall}
            disabled={isCompleted}
            className="p-3 bg-green-500/20 border border-green-500/50 rounded-full hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Phone size={20} className="text-green-400" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-400 py-12">Загрузка...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p>Нет сообщений</p>
            <p className="text-xs mt-2">Начните обсуждение задания</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === currentUser.id;
            
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    isOwn
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-cyan-100' : 'text-gray-400'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-black/50 backdrop-blur-xl border-t border-white/10">
        {isCompleted ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm bg-white/5 rounded-xl px-4 py-3">
            <Shield size={16} />
            <span>Чат закрыт после завершения заказа</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Введите сообщение..."
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                         text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl
                         disabled:opacity-50 disabled:cursor-not-allowed
                         hover:opacity-90 transition-all"
            >
              <Send size={20} className="text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Safe area */}
      <div className="h-4" />
    </div>
  );
}
