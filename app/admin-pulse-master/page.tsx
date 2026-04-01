"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  TrendingUp,
  Settings,
  LogOut,
  Key,
  Eye,
  EyeOff,
  MessageSquare
} from 'lucide-react';

export default function AdminPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'moderation' | 'support' | 'settings'>('dashboard');
  const [adminId, setAdminId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalCommissions: 0,
    activeTasks: 0,
    totalTasks: 0,
    totalUsers: 0,
  });
  const [reportedTasks, setReportedTasks] = useState<any[]>([]);
  const [supportAlerts, setSupportAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Settings state
  const [newLogin, setNewLogin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    // Get admin ID from token (in production, verify on server)
    const token = document.cookie.split(';').find(c => c.trim().startsWith('admin_token='));
    if (!token) {
      router.push('/admin-pulse-master/login');
      return;
    }
    
    loadData();
  }, [activeTab, router]);

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
    if (!confirm('Ban this task permanently?')) return;

    await supabase
      .from('tasks')
      .update({ is_hidden: true, visibility: false, status: 'cancelled' })
      .eq('id', taskId);

    // Log action
    await supabase.rpc('log_admin_action', {
      p_admin_id: adminId,
      p_action: 'ban_task',
      p_details: { task_id: taskId },
    });

    loadData();
  };

  const handleClearReports = async (taskId: string) => {
    await supabase
      .from('tasks')
      .update({ reports_count: 0, is_hidden: false, visibility: true })
      .eq('id', taskId);

    // Log action
    await supabase.rpc('log_admin_action', {
      p_admin_id: adminId,
      p_action: 'clear_reports',
      p_details: { task_id: taskId },
    });

    loadData();
  };

  const handleResolveSupport = async (chatId: string) => {
    await supabase
      .from('support_chats')
      .update({ needs_admin_help: false, is_resolved: true })
      .eq('id', chatId);

    // Log action
    await supabase.rpc('log_admin_action', {
      p_admin_id: adminId,
      p_action: 'resolve_support',
      p_details: { chat_id: chatId },
    });

    loadData();
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMessage(null);

    if (!newLogin || !newPassword) {
      setSettingsMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    if (newPassword.length < 6) {
      setSettingsMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    try {
      const { data, error } = await supabase.rpc('update_admin_credentials', {
        p_login: newLogin,
        p_password: newPassword,
      });

      if (error) throw error;

      setSettingsMessage({ type: 'success', text: 'Credentials updated! Please login again.' });
      
      // Clear session and redirect
      document.cookie = 'admin_token=; path=/; max-age=0';
      setTimeout(() => {
        router.push('/admin-pulse-master/login');
      }, 2000);
    } catch (err: any) {
      setSettingsMessage({ type: 'error', text: err.message || 'Failed to update credentials' });
    }
  };

  const handleAdminReply = async (chatId: string, userId: string, message: string) => {
    if (!message.trim()) return;

    const adminMsg = { role: 'admin', content: message, timestamp: new Date().toISOString() };
    
    await supabase
      .from('support_chats')
      .update({
        messages: supabase.array(adminMsg),
        needs_admin_help: false,
      })
      .eq('id', chatId);

    // Log action
    await supabase.rpc('log_admin_action', {
      p_admin_id: adminId,
      p_action: 'admin_support_reply',
      p_details: { chat_id: chatId, user_id: userId },
    });

    loadData();
    alert('Reply sent successfully!');
  };

  const handleLogout = () => {
    document.cookie = 'admin_token=; path=/; max-age=0';
    router.push('/admin-pulse-master/login');
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
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-xl
                           hover:bg-red-500/30 transition-all text-red-400"
              >
                <LogOut size={16} />
                <span className="text-sm">Logout</span>
              </button>
              <a
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
              >
                <ExternalLink size={16} />
                <span className="text-sm">Back to App</span>
              </a>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
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
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
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
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === 'support'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <MessageSquareWarning size={18} />
              Support Center
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-gray-500 to-gray-700 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Settings size={18} />
              Settings
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
              <h3 className="text-lg font-bold mb-4">Admin Wallet (BSC BEP20)</h3>
              <div className="bg-black/50 rounded-xl p-4 font-mono text-sm break-all text-cyan-400">
                0xa657fb7e405534d0b9d07b5edf413fddc3922128
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Receives 10% commission from all completed tasks automatically
              </p>
            </div>
          </div>
        )}

        {/* Moderation */}
        {activeTab === 'moderation' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Reported Tasks Moderation</h2>
            
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
                          onClick={() => handleClearReports(task.id)}
                          className="p-3 bg-green-500/20 border border-green-500/50 rounded-xl hover:bg-green-500/30 transition-all"
                          title="Clear Reports & Keep Task"
                        >
                          <CheckCircle size={20} className="text-green-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl hover:bg-red-500/30 transition-all"
                          title="Ban Task"
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

        {/* Support Center */}
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
                  const [adminReply, setAdminReply] = useState('');
                  return (
                    <div key={chat.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                              User: {chat.user_id?.slice(0, 8)}...
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(chat.updated_at).toLocaleString()}
                            </span>
                          </div>
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
                      
                      {/* Chat History */}
                      <div className="bg-black/50 rounded-xl p-4 mb-4 max-h-64 overflow-y-auto space-y-2">
                        {chat.messages?.map((msg: any, idx: number) => (
                          <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[80%] rounded-xl px-4 py-2 ${
                              msg.role === 'user'
                                ? 'bg-cyan-500/20 border border-cyan-500/50'
                                : msg.role === 'admin'
                                ? 'bg-purple-500/20 border border-purple-500/50'
                                : 'bg-white/5 border border-white/10'
                            }`}>
                              <p className="text-sm text-white">{msg.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Admin Reply */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={adminReply}
                          onChange={(e) => setAdminReply(e.target.value)}
                          placeholder="Type admin reply..."
                          className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl
                                     text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                        />
                        <button
                          onClick={() => {
                            handleAdminReply(chat.id, chat.user_id, adminReply);
                            setAdminReply('');
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl
                                     text-white font-medium text-sm
                                     hover:opacity-90 transition-all"
                        >
                          Send Reply
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Admin Access Settings</h2>
            
            <div className="max-w-md">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Key size={24} className="text-purple-400" />
                  <h3 className="text-lg font-bold">Change Admin Credentials</h3>
                </div>
                
                <form onSubmit={handleUpdateCredentials} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      New Username
                    </label>
                    <input
                      type="text"
                      value={newLogin}
                      onChange={(e) => setNewLogin(e.target.value)}
                      placeholder="Enter new username"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                                 text-white placeholder-gray-500
                                 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                                   text-white placeholder-gray-500
                                   focus:outline-none focus:border-purple-500/50 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  {settingsMessage && (
                    <div className={`p-3 rounded-xl text-sm ${
                      settingsMessage.type === 'success'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                        : 'bg-red-500/20 text-red-400 border border-red-500/50'
                    }`}>
                      {settingsMessage.text}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500
                               text-white font-bold rounded-xl
                               hover:from-purple-600 hover:to-pink-600
                               transition-all"
                  >
                    Update Access & Re-login
                  </button>
                </form>
                
                <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-xl">
                  <p className="text-xs text-yellow-400">
                    ⚠️ Warning: After updating credentials, you will be logged out and must login with the new username and password.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
