"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Edit, Trash2, Check, X, MapPin, DollarSign, Clock } from 'lucide-react';

// ADMIN_USER_ID - replace with your Telegram user ID
const ADMIN_USER_ID = 'YOUR_TELEGRAM_USER_ID';

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formReward, setFormReward] = useState('5');
  const [formCurrency, setFormCurrency] = useState<'stars' | 'usd'>('stars');
  const [formCategory, setFormCategory] = useState('help');
  const [formLat, setFormLat] = useState('40.7128');
  const [formLng, setFormLng] = useState('-74.0060');
  const [formAddress, setFormAddress] = useState('');
  const [formStatus, setFormStatus] = useState('open');

  // Check authorization
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tg = (window as any).Telegram?.WebApp;
    const tgUserId = tg?.initDataUnsafe?.user?.id?.toString() || '';
    setAdminId(tgUserId);

    // Allow if ADMIN_USER_ID matches or for local development
    if (ADMIN_USER_ID === 'YOUR_TELEGRAM_USER_ID' || tgUserId === ADMIN_USER_ID || tgUserId === 'd9dimon') {
      setIsAuthorized(true);
    }
  }, []);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTasks(data || []);
    } catch (e) {
      console.error('Admin tasks error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { if (isAuthorized) fetchTasks(); }, [isAuthorized, fetchTasks]);

  const resetForm = () => {
    setFormTitle(''); setFormDesc(''); setFormReward('5');
    setFormCurrency('stars'); setFormCategory('help');
    setFormLat('40.7128'); setFormLng('-74.0060');
    setFormAddress(''); setFormStatus('open');
    setEditingTask(null); setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const taskData = {
      title: formTitle,
      description: formDesc,
      reward: parseFloat(formReward),
      currency: formCurrency,
      category: formCategory,
      latitude: parseFloat(formLat),
      longitude: parseFloat(formLng),
      status: formStatus,
      exact_address: formAddress,
      created_at: new Date().toISOString(),
    };

    try {
      if (editingTask) {
        await supabase.from('tasks').update(taskData).eq('id', editingTask.id);
      } else {
        await supabase.from('tasks').insert({ ...taskData, id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` });
      }
      resetForm();
      fetchTasks();
    } catch (err) {
      console.error('Task save error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    await supabase.from('tasks').delete().eq('id', id);
    fetchTasks();
  };

  const handleEdit = (task: any) => {
    setEditingTask(task);
    setFormTitle(task.title); setFormDesc(task.description || '');
    setFormReward(String(task.reward)); setFormCurrency(task.currency || 'stars');
    setFormCategory(task.category || 'help');
    setFormLat(String(task.latitude)); setFormLng(String(task.longitude));
    setFormAddress(task.exact_address || ''); setFormStatus(task.status || 'open');
    setShowForm(true);
  };

  if (!isAuthorized) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-xl mb-2">🔒 Access Denied</p>
          <p className="text-sm">Admin access required</p>
          <p className="text-xs mt-4 text-gray-600">Your ID: {adminId || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 p-4 bg-black/95 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">🔧 Admin Panel</h1>
          <button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="p-2 bg-cyan-500 rounded-xl hover:bg-cyan-600 transition-colors"
          >
            <Plus size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              {editingTask ? 'Edit Task' : 'New Task'}
            </h2>
            <button onClick={resetForm}><X size={20} className="text-gray-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)}
              placeholder="Task title" required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50"
            />
            <textarea
              value={formDesc} onChange={e => setFormDesc(e.target.value)}
              placeholder="Description" rows={2}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 resize-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" value={formReward} onChange={e => setFormReward(e.target.value)} placeholder="Reward" required
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50" />
              <select value={formCurrency} onChange={e => setFormCurrency(e.target.value as any)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50">
                <option value="stars">⭐ Stars</option>
                <option value="usd">💵 USD</option>
              </select>
            </div>
            <select value={formCategory} onChange={e => setFormCategory(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50">
              {['help', 'delivery', 'cleaning', 'it', 'photo', 'repair', 'tutoring', 'translation', 'marketing'].map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" step="any" value={formLat} onChange={e => setFormLat(e.target.value)} placeholder="Latitude" required
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50" />
              <input type="number" step="any" value={formLng} onChange={e => setFormLng(e.target.value)} placeholder="Longitude" required
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50" />
            </div>
            <input type="text" value={formAddress} onChange={e => setFormAddress(e.target.value)} placeholder="Address"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50" />
            <select value={formStatus} onChange={e => setFormStatus(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50">
              {['open', 'in_progress', 'completed', 'cancelled'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all active:scale-[0.98]">
              {editingTask ? '💾 Update' : '🚀 Create'}
            </button>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 p-4">
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-cyan-400">{tasks.length}</div>
          <div className="text-[10px] text-gray-400">Total</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-green-400">{tasks.filter(t => t.status === 'open').length}</div>
          <div className="text-[10px] text-gray-400">Open</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-purple-400">{tasks.filter(t => t.status === 'completed').length}</div>
          <div className="text-[10px] text-gray-400">Done</div>
        </div>
      </div>

      {/* Task List */}
      <div className="px-4 space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin" /></div>
        ) : tasks.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No tasks yet</p>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-sm">{task.title}</h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">{task.description}</p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <button onClick={() => handleEdit(task)} className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10"><Edit size={14} className="text-gray-400" /></button>
                  <button onClick={() => handleDelete(task.id)} className="p-1.5 bg-white/5 rounded-lg hover:bg-red-500/20"><Trash2 size={14} className="text-gray-400 hover:text-red-400" /></button>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-gray-500">
                <span className="flex items-center gap-1"><DollarSign size={10} />{task.reward} {task.currency}</span>
                <span className="px-2 py-0.5 bg-white/5 rounded-full capitalize">{task.category}</span>
                <span className={`px-2 py-0.5 rounded-full capitalize ${
                  task.status === 'open' ? 'bg-green-500/20 text-green-400' :
                  task.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>{task.status}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
