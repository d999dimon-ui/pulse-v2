"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Gift, Clock, Users, Plus, X, Check, Trash2, Copy } from 'lucide-react';

export default function PromoCodesTab() {
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCode, setNewCode] = useState({
    code: '',
    bonusDurationHours: 6,
    maxUses: 1,
    validUntil: '',
    targetUserId: '',
  });
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error loading promo codes:', error);
    else setPromoCodes(data || []);
    
    setIsLoading(false);
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.from('promo_codes').insert({
        code: newCode.code.toUpperCase(),
        bonus_duration_hours: newCode.bonusDurationHours,
        max_uses: newCode.maxUses,
        valid_until: newCode.validUntil || null,
        target_user_id: newCode.targetUserId || null,
        created_by: 'admin',
      });
      
      if (error) throw error;
      
      alert('Promo code created successfully!');
      setShowCreateModal(false);
      setNewCode({
        code: '',
        bonusDurationHours: 6,
        maxUses: 1,
        validUntil: '',
        targetUserId: '',
      });
      loadPromoCodes();
    } catch (err: any) {
      alert('Failed to create: ' + err.message);
    }
  };

  const handleDeleteCode = async (id: string) => {
    if (!confirm('Delete this promo code?')) return;
    
    try {
      await supabase.from('promo_codes').update({ is_active: false }).eq('id', id);
      alert('Promo code deleted');
      loadPromoCodes();
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopySuccess(code);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Promo Codes Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl
                     text-white font-medium hover:opacity-90 transition-all"
        >
          <Plus size={18} />
          Create Promo Code
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Gift size={24} className="text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{promoCodes.filter(c => c.is_active).length}</div>
          <div className="text-sm text-gray-400">Active Codes</div>
        </div>
        
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Users size={24} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {promoCodes.reduce((sum, c) => sum + (c.used_count || 0), 0)}
          </div>
          <div className="text-sm text-gray-400">Total Uses</div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock size={24} className="text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {promoCodes.reduce((sum, c) => sum + (c.bonus_duration_hours || 0), 0)}h
          </div>
          <div className="text-sm text-gray-400">Total Bonus Hours</div>
        </div>
      </div>

      {/* Promo Codes Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Code</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Duration</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Uses</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Valid Until</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Target</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {promoCodes.map((code) => (
                <tr key={code.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-purple-500/20 border border-purple-500/50 rounded text-purple-400 text-sm">
                        {code.code}
                      </code>
                      <button
                        onClick={() => handleCopyCode(code.code)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        title="Copy code"
                      >
                        {copySuccess === code.code ? (
                          <Check size={14} className="text-green-400" />
                        ) : (
                          <Copy size={14} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-medium">{code.bonus_duration_hours}h</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300">
                      {code.used_count || 0} / {code.max_uses || '∞'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {code.valid_until ? (
                      <span className="text-gray-300">
                        {new Date(code.valid_until).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-gray-500">Never</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {code.target_user_id ? (
                      <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                        {code.target_user_id.slice(0, 8)}...
                      </span>
                    ) : (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                        General
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {code.is_active ? (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteCode(code.id)}
                      className="p-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 hover:bg-red-500/30 transition-all"
                      title="Delete code"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[5000] flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl
                          border border-purple-500/30 rounded-3xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Create Promo Code</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            <form onSubmit={handleCreateCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Promo Code
                </label>
                <input
                  type="text"
                  value={newCode.code}
                  onChange={(e) => setNewCode({ ...newCode, code: e.target.value })}
                  placeholder="SUMMER2024"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                             text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Bonus Duration (hours)
                </label>
                <input
                  type="number"
                  value={newCode.bonusDurationHours}
                  onChange={(e) => setNewCode({ ...newCode, bonusDurationHours: Number(e.target.value) })}
                  min="0.5"
                  max="168"
                  step="0.5"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                             text-white focus:outline-none focus:border-purple-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Max Uses
                </label>
                <input
                  type="number"
                  value={newCode.maxUses}
                  onChange={(e) => setNewCode({ ...newCode, maxUses: Number(e.target.value) })}
                  min="1"
                  max="1000"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                             text-white focus:outline-none focus:border-purple-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Valid Until (optional)
                </label>
                <input
                  type="datetime-local"
                  value={newCode.validUntil}
                  onChange={(e) => setNewCode({ ...newCode, validUntil: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                             text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Target User ID (optional, leave empty for general use)
                </label>
                <input
                  type="text"
                  value={newCode.targetUserId}
                  onChange={(e) => setNewCode({ ...newCode, targetUserId: e.target.value })}
                  placeholder="Leave empty for general use"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                             text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500
                           text-white font-bold rounded-xl
                           hover:from-purple-600 hover:to-pink-600
                           transition-all"
              >
                Create Promo Code
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
