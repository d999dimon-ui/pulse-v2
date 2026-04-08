"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Plus, Wallet, Bell, Search, TrendingUp, MapPin } from "lucide-react";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import CreateTaskModal from "@/components/CreateTaskModal";
import TaskFeed from "@/components/TaskFeed";
import UserProfile from "@/components/UserProfile";
import TabBar from "@/components/TabBar";
import Splash from "@/components/Splash";
import { Task as TaskType, UserProfile as UserProfileType, CATEGORIES } from "@/types/task";
import { supabase } from "@/lib/supabase";

// Loader Component
const Loader = () => (
  <div className="bg-dark-bg min-h-screen flex items-center justify-center">
    <div className="flex items-center gap-2 text-neon-cyan">
      <div className="w-4 h-4 rounded-full border-2 border-neon-cyan border-t-transparent animate-spin" />
      <span>Loading...</span>
    </div>
  </div>
);

// Dynamic import for LiveTaskMap (client-side only)
const LiveTaskMap = dynamic(
  () => import("@/components/LiveTaskMap"),
  {
    ssr: false,
    loading: () => <Loader />,
  }
);

function HomeContent() {
  const { language } = useLanguage();

  // ========== STATE ==========
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number]>([40.7128, -74.006]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'feed' | 'map' | 'chats' | 'profile'>('home');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // ========== EFFECTS ==========
  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => setShowSplash(false), 2000);
    loadUserProfile();
    loadTasks();
    getUserLocation();
    const unsubscribe = setupRealtimeListeners();
    return () => {
      clearTimeout(timer);
      unsubscribe?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ========== FUNCTIONS ==========
  const getUserLocation = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          fetch('https://ipapi.co/json/')
            .then(r => r.json())
            .then(data => {
              if (data.latitude && data.longitude) {
                setUserPosition([parseFloat(data.latitude), parseFloat(data.longitude)]);
              }
            })
            .catch(() => {});
        }
      );
    }
  }, []);

  const loadUserProfile = useCallback(async () => {
    try {
      const mockUser: UserProfileType = {
        id: 'user-123',
        username: 'TaskMaster',
        display_name: 'John Doe',
        avatar_url: 'https://i.pravatar.cc/150?img=1',
        bio: 'Expert in all tasks',
        balance: 1250.50,
        rating: 4.8,
        total_reviews: 42,
        completed_tasks_as_executor: 156,
        completed_tasks_as_customer: 89,
        is_verified: true,
        is_banned: false,
        vip_status: 'gold',
        language: language,
        country: 'Russia',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUserProfile(mockUser);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }, [language]);

  const loadTasks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('visibility', true)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setTasks(data.map((task: any) => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          reward: Number(task.reward) || 5,
          currency: (task.currency || 'ton') as any,
          category: (task.category || 'it') as any,
          latitude: task.latitude,
          longitude: task.longitude,
          status: (task.status || 'open') as any,
          priority: (task.priority || 'normal') as any,
          customer_id: task.customer_id || '',
          executor_id: task.executor_id,
          created_at: task.created_at,
          street_address: task.street_address,
          is_hidden: task.is_hidden,
          reports_count: task.reports_count,
          visibility: task.visibility,
        })));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setupRealtimeListeners = () => {
    const subscription = supabase
      .channel('tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        loadTasks();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...taskData,
          customer_id: userProfile?.id,
          status: 'open',
          visibility: true,
          is_hidden: false,
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setTasks(prev => [{
          id: data.id,
          title: data.title,
          description: data.description || '',
          reward: Number(data.reward),
          currency: data.currency,
          category: data.category,
          latitude: data.latitude,
          longitude: data.longitude,
          status: 'open',
          priority: data.priority || 'normal',
          customer_id: data.customer_id,
          created_at: data.created_at,
          street_address: data.street_address,
          is_hidden: false,
          reports_count: 0,
          visibility: true,
        }, ...prev]);
      }
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleClaimTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'claimed',
          executor_id: userProfile?.id,
        })
        .eq('id', taskId);

      if (error) throw error;
      loadTasks();
    } catch (error) {
      console.error('Error claiming task:', error);
    }
  };

  // ========== RENDER FUNCTIONS ==========
  if (showSplash) {
    return <Splash onFinish={() => setShowSplash(false)} />;
  }

  if (!isClient) {
    return <Loader />;
  }

  // ========== TABS CONTENT ==========
  return (
    <div className="bg-dark-bg min-h-screen flex flex-col">
      {/* HOME TAB */}
      {activeTab === 'home' && (
        <div className="flex-1 pb-24 overflow-y-auto">
          {/* Header with Balance */}
          <div className="sticky top-0 z-10 bg-gradient-dark border-b border-dark-border p-4">
            <div className="max-w-md mx-auto">
              {/* User Balance Card */}
              <div className="glass rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-neon-cyan" />
                    <span className="text-gray-300 text-sm">Your Balance</span>
                  </div>
                  <Bell className="w-5 h-5 text-neon-cyan cursor-pointer" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {userProfile?.balance?.toFixed(2) || '0.00'} TON
                </div>
                <div className="flex gap-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Rating: {userProfile?.rating || 5}/5 ⭐
                  </span>
                </div>
              </div>

              {/* Search Bar */}
              <div className="glass rounded-xl px-4 py-3 flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  className="bg-transparent text-sm flex-1 outline-none text-white placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="max-w-md mx-auto px-4 py-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white mb-4">Available Services</h2>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((category) => (
                  <div
                    key={category.value}
                    onClick={() => {
                      setSelectedCategory(category.value);
                      setActiveTab('feed');
                    }}
                    className="glass rounded-xl p-4 cursor-pointer transition-all hover:shadow-neon-cyan hover:border-neon-cyan border border-transparent"
                  >
                    <div className="text-3xl mb-2">{category.icon}</div>
                    <div className="text-sm font-semibold text-white">{category.label}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {tasks.filter((t) => t.category === category.value).length} available
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Create Task Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-neon-cyan transition-all"
            >
              <Plus className="w-5 h-5" />
              Create New Task
            </button>

            {/* Recent Tasks Section */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-white mb-3">Recent Tasks</h3>
              <div className="space-y-3">
                {tasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="glass rounded-xl p-4 cursor-pointer hover:border-neon-cyan border border-transparent transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm text-neon-cyan font-semibold">{task.category}</div>
                        <h4 className="text-white font-bold mt-1">{task.title}</h4>
                        <p className="text-gray-400 text-xs mt-1 line-clamp-2">{task.description}</p>
                      </div>
                      <div className="text-right ml-2">
                        <div className="text-lg font-bold text-neon-gold">{task.reward}</div>
                        <div className="text-xs text-gray-400">{task.currency}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-3">
                      <MapPin className="w-3 h-3" />
                      <span>{task.street_address || 'Location TBD'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FEED TAB */}
      {activeTab === 'feed' && (
        <TaskFeed
          isOpen={true}
          onClose={() => setActiveTab('home')}
          tasks={selectedCategory ? tasks.filter((t) => t.category === selectedCategory) : tasks}
          userLatitude={userPosition[0]}
          userLongitude={userPosition[1]}
          onClaimTask={handleClaimTask}
        />
      )}

      {/* MAP TAB */}
      {activeTab === 'map' && (
        <div className="flex-1">
          <LiveTaskMap
            userPosition={userPosition}
            selectedCategory={selectedCategory || undefined}
            tasks={tasks}
          />
        </div>
      )}

      {/* CHATS TAB */}
      {activeTab === 'chats' && (
        <div className="flex-1 pb-24 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-3">💬</div>
            <div className="text-gray-400">Chats & Support</div>
            <div className="text-sm text-gray-500 mt-2">Coming soon...</div>
          </div>
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && userProfile && (
        <UserProfile user={userProfile} onClose={() => setActiveTab('home')} />
      )}

      {/* MODALS */}
      {isCreateModalOpen && (
        <CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateTask={handleCreateTask}
          userPosition={userPosition}
        />
      )}

      {/* TAB BAR */}
      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadCount={unreadCount}
      />
    </div>
  );
}

export default function HomePageWrapper() {
  return (
    <LanguageProvider>
      <HomeContent />
    </LanguageProvider>
  );
}
