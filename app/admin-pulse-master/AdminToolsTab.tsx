"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Percent, 
  Users, 
  Send, 
  Bell, 
  MessageSquare, 
  Monitor, 
  Sparkles, 
  DollarSign,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Copy,
  Trash2,
  Edit
} from 'lucide-react';

export default function AdminToolsTab() {
  // Commission State
  const [globalCommission, setGlobalCommission] = useState(10);
  const [userOverrides, setUserOverrides] = useState<any[]>([]);
  const [newOverride, setNewOverride] = useState({
    userId: '',
    percent: 5,
    reason: '',
    validUntil: '',
  });

  // Broadcast State
  const [broadcast, setBroadcast] = useState({
    title: '',
    content: '',
    type: 'push' as 'push' | 'telegram' | 'in_app',
    audience: 'all' as 'all' | 'executors' | 'customers' | 'city_specific',
    targetCity: '',
    languageFilter: 'all' as 'ru' | 'en' | 'all',
  });
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGeneratedContent, setAiGeneratedContent] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Logs State
  const [broadcastHistory, setBroadcastHistory] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    loadCommission();
    loadBroadcastHistory();
    loadRecentTransactions();
  }, []);

  const loadCommission = async () => {
    const { data } = await supabase
      .from('commission_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    
    if (data) setGlobalCommission(data.global_commission_percent);
  };

  const loadBroadcastHistory = async () => {
    const { data } = await supabase
      .from('broadcast_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (data) setBroadcastHistory(data);
  };

  const loadRecentTransactions = async () => {
    const { data } = await supabase
      .from('financial_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (data) setTransactions(data);
  };

  const handleUpdateCommission = async () => {
    const admin = JSON.parse(localStorage.getItem('user') || '{}');
    
    const { error } = await supabase.rpc('update_global_commission', {
      p_percent: globalCommission,
      p_admin_id: admin.id || 'admin',
    });

    if (error) {
      alert('Failed to update commission: ' + error.message);
    } else {
      alert('✅ Global commission updated to ' + globalCommission + '%');
    }
  };

  const handleAddUserOverride = async () => {
    const admin = JSON.parse(localStorage.getItem('user') || '{}');
    
    const { error } = await supabase.rpc('set_user_commission_override', {
      p_user_id: newOverride.userId,
      p_percent: newOverride.percent,
      p_reason: newOverride.reason,
      p_valid_until: newOverride.validUntil || null,
      p_admin_id: admin.id || 'admin',
    });

    if (error) {
      alert('Failed to add override: ' + error.message);
    } else {
      alert('✅ Individual commission set for user ' + newOverride.userId.slice(0, 8) + '...');
      setNewOverride({ userId: '', percent: 5, reason: '', validUntil: '' });
    }
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    
    try {
      // Mock AI generation (in production, call OpenRouter API)
      const mockVariants = [
        `🎉 ${aiPrompt}! Получите скидку 20% на все заказы в эти выходные! Успейте воспользоваться!`,
        `⚡ ${aiPrompt}! Только 48 часов комиссия 0% для всех исполнителей! Не упустите шанс!`,
        `🔥 ${aiPrompt}! Специальное предложение: приведите друга и получите 5 часов без комиссии!`,
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAiGeneratedContent(mockVariants);
    } catch (error) {
      alert('AI generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcast.title || !broadcast.content) {
      alert('Please fill in title and content');
      return;
    }

    setIsSending(true);
    const admin = JSON.parse(localStorage.getItem('user') || '{}');

    try {
      // Create broadcast
      const { data, error } = await supabase.rpc('create_broadcast', {
        p_title: broadcast.title,
        p_content: broadcast.content,
        p_content_translations: {}, // Auto-translate in production
        p_notification_type: broadcast.type,
        p_target_audience: broadcast.audience,
        p_target_city: broadcast.audience === 'city_specific' ? broadcast.targetCity : null,
        p_language_filter: broadcast.languageFilter,
        p_ai_generated: aiGeneratedContent.length > 0,
        p_ai_prompt: aiPrompt,
        p_admin_id: admin.id || 'admin',
      });

      if (error) throw error;

      // Send broadcast
      const { error: sendError } = await supabase.rpc('send_broadcast', {
        p_broadcast_id: data,
      });

      if (sendError) throw sendError;

      alert('✅ Broadcast sent successfully!');
      setBroadcast({
        title: '',
        content: '',
        type: 'push',
        audience: 'all',
        targetCity: '',
        languageFilter: 'all',
      });
      setAiGeneratedContent([]);
      setAiPrompt('');
      loadBroadcastHistory();
    } catch (error: any) {
      alert('Failed to send broadcast: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleAutoTranslate = async () => {
    // In production, call AI API to translate content
    alert('🔄 Auto-translate feature coming soon! Will translate to EN and UZ.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Monitor size={28} className="text-purple-400" />
          Admin Power Tools
        </h2>
      </div>

      {/* Commission Control */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Global Commission */}
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Percent size={24} className="text-green-400" />
            Global Commission
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Current Commission (%)
              </label>
              <input
                type="number"
                value={globalCommission}
                onChange={(e) => setGlobalCommission(Number(e.target.value))}
                min="0"
                max="50"
                className="w-full px-4 py-3 bg-black/50 border border-green-500/50 rounded-xl
                           text-white text-2xl font-bold text-center focus:outline-none focus:border-green-500"
              />
            </div>
            
            <button
              onClick={handleUpdateCommission}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500
                         text-white font-bold rounded-xl
                         hover:from-green-600 hover:to-emerald-600
                         transition-all"
            >
              Update Global Commission
            </button>
          </div>
        </div>

        {/* Individual Override */}
        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users size={24} className="text-blue-400" />
            Individual Commission Override
          </h3>
          
          <div className="space-y-3">
            <input
              type="text"
              value={newOverride.userId}
              onChange={(e) => setNewOverride({ ...newOverride, userId: e.target.value })}
              placeholder="User ID..."
              className="w-full px-3 py-2 bg-black/50 border border-blue-500/50 rounded-xl
                         text-white text-sm focus:outline-none focus:border-blue-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={newOverride.percent}
                onChange={(e) => setNewOverride({ ...newOverride, percent: Number(e.target.value) })}
                placeholder="Percent"
                min="0"
                max="50"
                className="px-3 py-2 bg-black/50 border border-blue-500/50 rounded-xl
                           text-white text-sm focus:outline-none focus:border-blue-500"
              />
              <input
                type="date"
                value={newOverride.validUntil}
                onChange={(e) => setNewOverride({ ...newOverride, validUntil: e.target.value })}
                className="px-3 py-2 bg-black/50 border border-blue-500/50 rounded-xl
                           text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <input
              type="text"
              value={newOverride.reason}
              onChange={(e) => setNewOverride({ ...newOverride, reason: e.target.value })}
              placeholder="Reason (e.g., Top performer reward)"
              className="w-full px-3 py-2 bg-black/50 border border-blue-500/50 rounded-xl
                         text-white text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleAddUserOverride}
              className="w-full py-2 bg-gradient-to-r from-blue-500 to-cyan-500
                         text-white font-bold rounded-xl
                         hover:from-blue-600 hover:to-cyan-600
                         transition-all"
            >
              Set Individual Commission
            </button>
          </div>
        </div>
      </div>

      {/* Broadcast Center */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Send size={24} className="text-purple-400" />
          Broadcast Center
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message Composer */}
          <div className="lg:col-span-2 space-y-4">
            <input
              type="text"
              value={broadcast.title}
              onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })}
              placeholder="Message Title..."
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/50 rounded-xl
                         text-white focus:outline-none focus:border-purple-500"
            />
            <textarea
              value={broadcast.content}
              onChange={(e) => setBroadcast({ ...broadcast, content: e.target.value })}
              placeholder="Write your message... (Emoji supported ✨)"
              rows={4}
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/50 rounded-xl
                         text-white focus:outline-none focus:border-purple-500 resize-none"
            />
            
            {/* AI Generate */}
            <div className="bg-black/30 rounded-xl p-4">
              <div className="flex gap-3 mb-3">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="AI Topic (e.g., 'Weekend Promotion')"
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl
                             text-white text-sm focus:outline-none focus:border-purple-500/50"
                />
                <button
                  onClick={handleAIGenerate}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl
                             text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed
                             hover:opacity-90 transition-all flex items-center gap-2"
                >
                  <Sparkles size={18} />
                  {isGenerating ? 'Generating...' : 'AI Generate'}
                </button>
              </div>
              
              {aiGeneratedContent.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">Click to select:</p>
                  {aiGeneratedContent.map((variant, idx) => (
                    <button
                      key={idx}
                      onClick={() => setBroadcast({ ...broadcast, content: variant })}
                      className="w-full text-left px-3 py-2 bg-purple-500/20 border border-purple-500/50 rounded-xl
                                 text-sm text-purple-300 hover:bg-purple-500/30 transition-all"
                    >
                      {variant}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAutoTranslate}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl
                           text-white text-sm hover:bg-white/10 transition-all"
              >
                🌐 Auto-Translate (RU→EN/UZ)
              </button>
              <button
                onClick={handleSendBroadcast}
                disabled={isSending || !broadcast.title || !broadcast.content}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl
                           text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed
                           hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Send size={18} />
                {isSending ? 'Sending...' : 'Send Broadcast'}
              </button>
            </div>
          </div>

          {/* Targeting Options */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Bell size={16} />
                Notification Type
              </label>
              <select
                value={broadcast.type}
                onChange={(e) => setBroadcast({ ...broadcast, type: e.target.value as any })}
                className="w-full px-3 py-2 bg-black/50 border border-purple-500/50 rounded-xl
                           text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="push">📱 Push Notification</option>
                <option value="telegram">💬 Telegram Message</option>
                <option value="in_app">🖼️ In-App Banner</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Users size={16} />
                Target Audience
              </label>
              <select
                value={broadcast.audience}
                onChange={(e) => setBroadcast({ ...broadcast, audience: e.target.value as any })}
                className="w-full px-3 py-2 bg-black/50 border border-purple-500/50 rounded-xl
                           text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="all">👥 All Users</option>
                <option value="executors">🔧 Executors Only</option>
                <option value="customers">💼 Customers Only</option>
                <option value="city_specific">🏙️ Specific City</option>
              </select>
            </div>

            {broadcast.audience === 'city_specific' && (
              <input
                type="text"
                value={broadcast.targetCity}
                onChange={(e) => setBroadcast({ ...broadcast, targetCity: e.target.value })}
                placeholder="City name (e.g., Jalal-Abad)"
                className="w-full px-3 py-2 bg-black/50 border border-purple-500/50 rounded-xl
                           text-white text-sm focus:outline-none focus:border-purple-500"
              />
            )}

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Monitor size={16} />
                Language Filter
              </label>
              <select
                value={broadcast.languageFilter}
                onChange={(e) => setBroadcast({ ...broadcast, languageFilter: e.target.value as any })}
                className="w-full px-3 py-2 bg-black/50 border border-purple-500/50 rounded-xl
                           text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="all">🌍 All Languages</option>
                <option value="ru">🇷🇺 Russian Only</option>
                <option value="en">🇬🇧 English Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Logs & Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Broadcast History */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock size={20} className="text-yellow-400" />
            Broadcast History
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {broadcastHistory.map((msg) => (
              <div key={msg.id} className="bg-black/50 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-white">{msg.title}</h4>
                    <p className="text-xs text-gray-500">{new Date(msg.sent_at || msg.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    msg.status === 'sent' ? 'bg-green-500/20 text-green-400' :
                    msg.status === 'sending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {msg.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>📧 {msg.total_recipients} recipients</span>
                  <span>✅ {msg.delivered_count || 0} delivered</span>
                  <span>👁️ {msg.read_count || 0} read</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Transactions */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <DollarSign size={20} className="text-green-400" />
            Recent Transactions
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.map((tx) => (
              <div key={tx.id} className="bg-black/50 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-bold text-white">{tx.transaction_type}</div>
                    <div className="text-xs text-gray-500">{tx.user_id.slice(0, 12)}...</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-400">{tx.amount} {tx.currency}</div>
                    <div className="text-xs text-gray-500">Commission: {tx.commission_amount} ({tx.commission_percent}%)</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    tx.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {tx.status}
                  </span>
                  <span className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
