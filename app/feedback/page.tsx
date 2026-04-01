"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Lightbulb, MessageSquare, TrendingUp, Award, Clock, CheckCircle, XCircle } from 'lucide-react';
import { FeedbackIdea, getFeedbackIdeas, submitFeedbackIdea, voteOnFeedback } from '@/lib/security-moderation';

export default function FeedbackSection() {
  const [feedbacks, setFeedbacks] = useState<FeedbackIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newFeedback, setNewFeedback] = useState({
    title: '',
    description: '',
    category: 'feature' as 'feature' | 'bug' | 'improvement' | 'other',
  });
  const [userVoted, setUserVoted] = useState<Record<string, string>>({});

  useEffect(() => {
    loadFeedbacks();
    loadUserVotes();
  }, [selectedCategory]);

  const loadFeedbacks = async () => {
    setIsLoading(true);
    const data = await getFeedbackIdeas(
      selectedCategory === 'all' ? undefined : selectedCategory,
      undefined,
      100
    );
    setFeedbacks(data);
    setIsLoading(false);
  };

  const loadUserVotes = async () => {
    // Get current user ID from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;
    
    const voted = await fetch('/api/feedback/votes').then(r => r.json());
    setUserVoted(voted.reduce((acc: any, v: any) => ({ ...acc, [v.feedback_id]: v.vote_type }), {}));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      alert('Please login first');
      return;
    }

    const result = await submitFeedbackIdea(
      user.id,
      newFeedback.title,
      newFeedback.description,
      newFeedback.category
    );

    if (result.success) {
      alert('✅ Feedback submitted! You may receive bonus hours if implemented.');
      setShowSubmitModal(false);
      setNewFeedback({ title: '', description: '', category: 'feature' });
      loadFeedbacks();
    } else {
      alert('Failed to submit feedback');
    }
  };

  const handleVote = async (feedbackId: string, voteType: 'upvote' | 'downvote') => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      alert('Please login first');
      return;
    }

    const result = await voteOnFeedback(feedbackId, user.id, voteType);
    
    if (result.success) {
      loadFeedbacks();
      loadUserVotes();
    }
  };

  const categories = [
    { value: 'all', label: 'All', icon: '📋' },
    { value: 'feature', label: 'Features', icon: '💡' },
    { value: 'bug', label: 'Bugs', icon: '🐛' },
    { value: 'improvement', label: 'Improvements', icon: '📈' },
    { value: 'other', label: 'Other', icon: '💬' },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      reviewing: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      approved: 'bg-green-500/20 text-green-400 border-green-500/50',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/50',
      implemented: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Lightbulb size={28} className="text-yellow-400" />
          Feedback & Ideas
        </h2>
        <button
          onClick={() => setShowSubmitModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl
                     text-white font-bold hover:opacity-90 transition-all"
        >
          <Lightbulb size={18} />
          Suggest Idea
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.value
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-2xl p-4">
          <div className="text-2xl font-bold text-white">{feedbacks.length}</div>
          <div className="text-sm text-gray-400">Total Ideas</div>
        </div>
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-2xl p-4">
          <div className="text-2xl font-bold text-white">
            {feedbacks.filter(f => f.status === 'implemented').length}
          </div>
          <div className="text-sm text-gray-400">Implemented</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-2xl p-4">
          <div className="text-2xl font-bold text-white">
            {feedbacks.filter(f => f.reward_hours > 0).reduce((sum, f) => sum + f.reward_hours, 0)}h
          </div>
          <div className="text-sm text-gray-400">Bonus Hours Awarded</div>
        </div>
      </div>

      {/* Feedback List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((feedback) => (
            <div
              key={feedback.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-yellow-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{feedback.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(feedback.status)}`}>
                      {feedback.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{feedback.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(feedback.created_at).toLocaleDateString()}
                    </div>
                    {feedback.reward_hours > 0 && (
                      <div className="flex items-center gap-1 text-purple-400">
                        <Award size={12} />
                        {feedback.reward_hours}h bonus
                      </div>
                    )}
                    {feedback.admin_response && (
                      <div className="flex items-center gap-1 text-blue-400">
                        <MessageSquare size={12} />
                        Admin response
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Voting */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => handleVote(feedback.id, 'upvote')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    userVoted[feedback.id] === 'upvote'
                      ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-green-500/20'
                  }`}
                >
                  <TrendingUp size={16} />
                  <span className="font-bold">{feedback.upvotes}</span>
                </button>
                <button
                  onClick={() => handleVote(feedback.id, 'downvote')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    userVoted[feedback.id] === 'downvote'
                      ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-red-500/20'
                  }`}
                >
                  <span className="font-bold">👎</span>
                  <span className="font-bold">{feedback.downvotes}</span>
                </button>
                
                {feedback.admin_response && (
                  <div className="flex-1 bg-blue-500/20 border border-blue-500/50 rounded-xl p-3 text-sm text-blue-300">
                    <strong>Admin:</strong> {feedback.admin_response}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[5000] flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl
                          border border-yellow-500/30 rounded-3xl p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Lightbulb size={24} className="text-yellow-400" />
                Suggest an Idea
              </h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <span className="text-white text-xl">×</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Category
                </label>
                <select
                  value={newFeedback.category}
                  onChange={(e) => setNewFeedback({ ...newFeedback, category: e.target.value as any })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                             text-white focus:outline-none focus:border-yellow-500/50"
                >
                  <option value="feature">💡 Feature</option>
                  <option value="bug">🐛 Bug</option>
                  <option value="improvement">📈 Improvement</option>
                  <option value="other">💬 Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newFeedback.title}
                  onChange={(e) => setNewFeedback({ ...newFeedback, title: e.target.value })}
                  placeholder="Brief description of your idea..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                             text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description
                </label>
                <textarea
                  value={newFeedback.description}
                  onChange={(e) => setNewFeedback({ ...newFeedback, description: e.target.value })}
                  placeholder="Explain your idea in detail..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                             text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 resize-none"
                  required
                />
              </div>

              <div className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-purple-400 text-sm">
                  <Award size={16} />
                  <span>If your idea is implemented, you'll receive bonus hours (0% commission)!</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500
                           text-white font-bold rounded-xl
                           hover:from-yellow-600 hover:to-orange-600
                           transition-all"
              >
                Submit Idea
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
