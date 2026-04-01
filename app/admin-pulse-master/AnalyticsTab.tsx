"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Activity, 
  Award, 
  Search,
  Filter,
  ExternalLink,
  MessageSquare,
  Star,
  Shield,
  MapPin
} from 'lucide-react';

export default function AnalyticsTab() {
  const [globalMetrics, setGlobalMetrics] = useState({
    gmvTotal: 0,
    gmv7d: 0,
    gmv30d: 0,
    commissionsTotal: 0,
    commissions7d: 0,
    totalUsers: 0,
    activeUsers7d: 0,
    totalTasks: 0,
    tasksCompleted7d: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
    loadUsers();
  }, []);

  const loadAnalytics = async () => {
    const { data } = await supabase
      .from('admin_analytics')
      .select('*')
      .order('metric_date', { ascending: false })
      .limit(1)
      .single();
    
    if (data) {
      setGlobalMetrics({
        gmvTotal: data.gmv_total || 0,
        gmv7d: data.gmv_7d || 0,
        gmv30d: data.gmv_30d || 0,
        commissionsTotal: data.commissions_total || 0,
        commissions7d: data.commissions_7d || 0,
        totalUsers: data.total_users || 0,
        activeUsers7d: data.active_users_7d || 0,
        totalTasks: data.total_tasks || 0,
        tasksCompleted7d: data.tasks_completed_7d || 0,
      });
    }
  };

  const loadUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('rating', { ascending: false })
      .limit(100);
    
    if (error) console.error('Error loading users:', error);
    else setUsers(data || []);
    
    setIsLoading(false);
  };

  const handleAiQuery = async () => {
    if (!aiQuery.trim()) return;
    
    setAiResponse('🤖 AI is analyzing...');
    
    try {
      // This would call an AI API in production
      // For now, mock response
      const mockResponse = `📊 AI Analytics Report:

🏆 Top Performer: User ${users[0]?.user_id.slice(0, 8)}...
   - ${users[0]?.total_reviews || 0} tasks completed
   - Rating: ${users[0]?.rating || 5.0} ⭐
   - Recommended bonus: 12 hours commission-free

📈 Growth Insight: 
   - GMV increased ${(globalMetrics.gmv7d / globalMetrics.gmvTotal * 100).toFixed(1)}% this week
   - ${globalMetrics.activeUsers7d} active users

💡 Recommendation:
   Consider activating Lucky Chance for ${globalMetrics.totalUsers - globalMetrics.activeUsers7d} inactive users.`;
      
      setTimeout(() => {
        setAiResponse(mockResponse);
      }, 1500);
    } catch (error) {
      setAiResponse('Error: Failed to get AI response');
    }
  };

  const filteredUsers = users.filter(user => {
    if (searchQuery && !user.user_id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterCity && user.city !== filterCity) return false;
    if (filterRating && user.rating < filterRating) return false;
    return true;
  });

  const cities = [...new Set(users.map(u => u.city).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Global Analytics Dashboard</h2>
        <a
          href="/"
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
        >
          <ExternalLink size={16} />
          <span className="text-sm">Back to App</span>
        </a>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign size={32} className="text-green-400" />
            <TrendingUp size={20} className="text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            ${globalMetrics.gmvTotal.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">Total GMV</div>
          <div className="text-xs text-green-400 mt-2">
            +${globalMetrics.gmv7d.toFixed(2)} (7d)
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Award size={32} className="text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            ${globalMetrics.commissionsTotal.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">Your Profit (10%)</div>
          <div className="text-xs text-cyan-400 mt-2">
            +${globalMetrics.commissions7d.toFixed(2)} (7d)
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Users size={32} className="text-purple-400" />
            <Activity size={20} className="text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {globalMetrics.totalUsers}
          </div>
          <div className="text-sm text-gray-400">Total Users</div>
          <div className="text-xs text-purple-400 mt-2">
            {globalMetrics.activeUsers7d} active (7d)
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Star size={32} className="text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {globalMetrics.tasksCompleted7d}
          </div>
          <div className="text-sm text-gray-400">Tasks (7d)</div>
          <div className="text-xs text-yellow-400 mt-2">
            {globalMetrics.totalTasks} total
          </div>
        </div>
      </div>

      {/* AI Analytics */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MessageSquare size={24} className="text-purple-400" />
          AI Analytics Assistant
        </h3>
        
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder="Ask AI: 'Who is the best worker this month?'"
            className="flex-1 px-4 py-3 bg-black/50 border border-white/10 rounded-xl
                       text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
            onKeyPress={(e) => e.key === 'Enter' && handleAiQuery()}
          />
          <button
            onClick={handleAiQuery}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl
                       text-white font-bold hover:opacity-90 transition-all"
          >
            Ask AI
          </button>
        </div>
        
        {aiResponse && (
          <div className="bg-black/50 rounded-xl p-4 whitespace-pre-wrap text-sm text-gray-300">
            {aiResponse}
          </div>
        )}
      </div>

      {/* User Management */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Users size={24} className="text-cyan-400" />
            User Management
          </h3>
          
          <div className="flex gap-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by User ID..."
                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl
                           text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 text-sm"
              />
            </div>
            
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl
                         text-white focus:outline-none focus:border-cyan-500/50 text-sm"
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            
            <select
              value={filterRating || ''}
              onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : null)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl
                         text-white focus:outline-none focus:border-cyan-500/50 text-sm"
            >
              <option value="">All Ratings</option>
              <option value="4.5">4.5+ ⭐</option>
              <option value="4.0">4.0+ ⭐</option>
              <option value="3.5">3.5+ ⭐</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/50 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Phone</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">City</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Rating</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Tasks</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Badges</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-white font-medium">{user.username || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{user.user_id.slice(0, 12)}...</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.phone_verified ? (
                          <Shield size={14} className="text-green-400" />
                        ) : (
                          <Shield size={14} className="text-gray-600" />
                        )}
                        <span className="text-gray-300">{user.phone || 'Not verified'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="text-gray-300">{user.city || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-white font-bold">{user.rating?.toFixed(1) || '5.0'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{user.total_reviews || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {user.badges?.map((badge: string, idx: number) => (
                          <span key={idx} className="text-lg" title={badge}>
                            {badge === 'pro' ? '⭐' : badge === 'newbie' ? '🌱' : '✓'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_blocked ? (
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                          Blocked
                        </span>
                      ) : (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 text-xs hover:bg-cyan-500/30 transition-all"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[5000] flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl
                          border border-cyan-500/30 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">User Profile</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <ExternalLink size={20} className="text-white" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">User ID</div>
                  <div className="text-white font-mono text-sm">{selectedUser.user_id}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Username</div>
                  <div className="text-white">{selectedUser.username || 'N/A'}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Phone</div>
                  <div className="text-white flex items-center gap-2">
                    {selectedUser.phone_verified && <Shield size={14} className="text-green-400" />}
                    {selectedUser.phone || 'Not verified'}
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Telegram</div>
                  <div className="text-white">@{selectedUser.telegram_username || 'N/A'}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Rating</div>
                  <div className="text-white flex items-center gap-1">
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    {selectedUser.rating?.toFixed(2) || '5.00'}
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">City</div>
                  <div className="text-white flex items-center gap-1">
                    <MapPin size={16} className="text-gray-400" />
                    {selectedUser.city || 'N/A'}
                  </div>
                </div>
              </div>
              
              {selectedUser.bio && (
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">About</div>
                  <div className="text-white">{selectedUser.bio}</div>
                </div>
              )}
              
              {selectedUser.badges?.length > 0 && (
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-2">Badges</div>
                  <div className="flex gap-2">
                    {selectedUser.badges.map((badge: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-full text-purple-400 text-sm">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
