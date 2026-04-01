"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  MessageSquareWarning, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  Trash2,
  ExternalLink,
  Users,
  TrendingUp
} from 'lucide-react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'moderation' | 'support'>('dashboard');
  const [stats, setStats] = useState({
    totalCommissions: 0,
    activeTasks: 0,
    totalTasks: 0,
    totalUsers: 0,
  });
  const [reportedTasks, setReportedTasks] = useState<any[]>([]);
  const [supportAlerts, setSupportAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    
    // Load stats
    const { data: statsData } = await supabase
      .from('admin_stats')
      .select('*')
      .single();
    
    if (statsData) {
      setStats({
        totalCommissions: statsData.total_commissions || 0,
        activeTasks: statsData.active_tasks_count || 0,
        totalTasks: statsData.total_tasks_count || 0,
        totalUsers: statsData.total_users_count || 0,
      });
    }

    // Load reported tasks
    if (activeTab === 'moderation') {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .gte('reports_count', 1)
        .order('reports_count', { ascending: false })
        .limit(50);
      
      setReportedTasks(tasks || []);
    }

    // Load support alerts
    if (activeTab === 'support') {
      const { data: chats } = await supabase
        .from('support_chats')
        .select('*')
        .eq('needs_admin_help', true)
        .eq('is_resolved', false)
        .order('updated_at', { ascending: false })
        .limit(50);
      
      setSupportAlerts(chats || []);
    }

    setIsLoading(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Delete this task permanently?')) return;

    await supabase
      .from('tasks')
      .update({ is_hidden: true, visibility: false, status: 'cancelled' })
      .eq('id', taskId);

    loadData();
  };

  const handleKeepTask = async (taskId: string) => {
    await supabase
      .from('tasks')
      .update({ reports_count: 0, is_hidden: false, visibility: true })
      .eq('id', taskId);

    loadData();
  };

  const handleResolveSupport = async (chatId: string) => {
    await supabase
      .from('support_chats')
      .update({ needs_admin_help: false, is_resolved: true })
      .eq('id', chatId);

    loadData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <ShieldAlert size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Pulse Admin Panel</h1>
                <p className="text-xs text-gray-400">Master Control Center</p>
              </div>
            </div>
            
            <a
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
            >
              <ExternalLink size={16} />
              <span className="text-sm">Back to App</span>
            </a>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('moderation')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === 'moderation'
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <ShieldAlert size={18} />
              Moderation
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === 'support'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <MessageSquareWarning size={18} />
              Support Alerts
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign size={32} className="text-green-400" />
                  <TrendingUp size={20} className="text-green-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  ${stats.totalCommissions.toFixed(2)}
                </div>
                <div className="text-sm text-gray-400">Total Commissions (10%)</div>
              </div>

              <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <LayoutDashboard size={32} className="text-cyan-400" />
                  <span className="text-xs text-cyan-400 bg-cyan-500/20 px-2 py-1 rounded-full">Live</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats.activeTasks}
                </div>
                <div className="text-sm text-gray-400">Active Tasks</div>
              </div>

              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle size={32} className="text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats.totalTasks}
                </div>
                <div className="text-sm text-gray-400">Total Tasks</div>
              </div>

              <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users size={32} className="text-orange-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats.totalUsers}
                </div>
                <div className="text-sm text-gray-400">Total Users</div>
              </div>
            </div>

            {/* Admin Wallet */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-8">
              <h3 className="text-lg font-bold mb-4">Admin Wallet (BSC)</h3>
              <div className="bg-black/50 rounded-xl p-4 font-mono text-sm break-all">
                0xa657fb7e405534d0b9d07b5edf413fddc3922128
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Receives 10% commission from all completed tasks
              </p>
            </div>
          </div>
        )}

        {/* Moderation */}
        {activeTab === 'moderation' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Reported Tasks</h2>
            
            {reportedTasks.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-2xl">
                <ShieldAlert size={48} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No reported tasks</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reportedTasks.map((task) => (
                  <div key={task.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-white">{task.title}</h3>
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                            {task.reports_count} reports
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{task.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Reward: {task.reward} {task.currency}</span>
                          <span>Status: {task.status}</span>
                          <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleKeepTask(task.id)}
                          className="p-3 bg-green-500/20 border border-green-500/50 rounded-xl hover:bg-green-500/30 transition-all"
                          title="Keep Task"
                        >
                          <CheckCircle size={20} className="text-green-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl hover:bg-red-500/30 transition-all"
                          title="Delete Task"
                        >
                          <Trash2 size={20} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Support Alerts */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Support Escalations</h2>
            
            {supportAlerts.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-2xl">
                <MessageSquareWarning size={48} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No pending support requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {supportAlerts.map((chat) => {
                  const lastMessage = chat.messages?.[chat.messages.length - 1];
                  return (
                    <div key={chat.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                              User: {chat.user_id?.slice(0, 8)}...
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(chat.updated_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                            {lastMessage?.content || 'No messages'}
                          </p>
                          <div className="text-xs text-gray-500">
                            Messages: {chat.messages?.length || 0}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleResolveSupport(chat.id)}
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl
                                     text-white font-medium text-sm
                                     hover:opacity-90 transition-all"
                        >
                          Mark Resolved
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
