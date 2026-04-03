"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import nextDynamic from "next/dynamic";
import { Plus, User, ListFilter, Loader2 } from "lucide-react";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import CreateTaskModal from "@/components/CreateTaskModal";
import TaskFeed from "@/components/TaskFeed";
import UserProfile from "@/components/UserProfile";
import LanguageSelectorModal from "@/components/LanguageSelectorModal";
import OnboardingModal from "@/components/OnboardingModal";
import Splash from "@/components/Splash";
import { Task as TaskType, User as UserType } from "@/types/task";
import { t } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

// Dynamic import with SSR disabled and loading fallback
const MapComponent = nextDynamic(
  () => import("@/components/MapComponent").catch((err) => {
    console.error("MapComponent load error:", err);
    return { default: () => <div className="bg-black min-h-screen flex items-center justify-center text-white">Map unavailable</div> };
  }),
  {
    ssr: false,
    loading: () => (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
          <div>Loading map...</div>
        </div>
      </div>
    ),
  }
);

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

function HomeContent() {
  const { language } = useLanguage();

  // === ALL STATE AT TOP ===
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [user, setUser] = useState<UserType | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number]>([40.7128, -74.0060]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTaskFeedOpen, setIsTaskFeedOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);

  // === ALL CALLBACKS AT TOP ===
  const loadTasks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const localTasks: TaskType[] = data.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          reward: Number(task.reward) || 5,
          currency: (task.currency as 'stars' | 'usd') || 'stars',
          category: (task.category as any) || 'help',
          latitude: task.latitude,
          longitude: task.longitude,
          status: (task.status as any) || 'open',
          created_at: new Date(task.created_at).getTime(),
          user_id: task.user_id || '',
          executor_id: task.executor_id,
          exact_address: task.exact_address,
        }));
        setTasks(localTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      try {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) setTasks(JSON.parse(savedTasks));
      } catch { /* ignore */ }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleMapLongPress = useCallback((e: any) => {
    if (!e?.latlng) return;
    setSelectedPosition([e.latlng.lat, e.latlng.lng]);
    setIsCreateModalOpen(true);
  }, []);

  const handleCreateTask = useCallback(async (taskData: Omit<TaskType, 'id' | 'created_at' | 'status' | 'user_id'>) => {
    if (!user) return;
    const newTask: TaskType = {
      ...taskData,
      id: generateId(),
      created_at: Date.now(),
      status: 'open',
      user_id: user.id,
    };
    try {
      await supabase.from('tasks').insert({
        id: newTask.id,
        title: newTask.title,
        description: newTask.description,
        reward: newTask.reward,
        currency: newTask.currency,
        category: newTask.category,
        latitude: newTask.latitude,
        longitude: newTask.longitude,
        status: 'open',
        user_id: user.id,
        created_at: newTask.created_at,
      });
    } catch (error) {
      console.error('Error creating task:', error);
    }
    setTasks(prev => [newTask, ...prev]);
  }, [user]);

  const handleClaimTask = useCallback(async (taskId: string) => {
    try {
      await supabase.from('tasks').update({ status: 'in_progress' }).eq('id', taskId);
    } catch (error) {
      console.error('Error claiming task:', error);
    }
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: 'claimed' as const } : task
    ));
  }, []);

  const handleWithdraw = useCallback(() => {
    if (!user) {
      alert('Minimum withdrawal is 10 Stars');
      return;
    }
    alert(`Withdrawal request for ${user.balance} Stars submitted!`);
    setUser(prev => prev ? { ...prev, balance: 0 } : null);
  }, [user]);

  // === ALL EFFECTS AT TOP ===
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        tg.setHeaderColor('#000000');
        tg.setBackgroundColor('#000000');
      }

      const savedUser = localStorage.getItem('user');
      const savedLanguage = localStorage.getItem('language');

      if (savedUser) {
        try { setUser(JSON.parse(savedUser)); } catch { /* ignore */ }
      } else {
        const defaultUser: UserType = {
          id: generateId(),
          username: tg?.initData?.user?.username || tg?.initData?.user?.first_name || 'user_' + Math.random().toString(36).substr(2, 5),
          balance: 0,
          completedTasks: 0,
        };
        setUser(defaultUser);
        localStorage.setItem('user', JSON.stringify(defaultUser));
      }

      if (!savedLanguage) setShowLanguageSelector(true);

      const savedOnboarding = localStorage.getItem('onboarding_completed');
      if (!savedLanguage && savedOnboarding !== 'true') {
        setTimeout(() => { setShowOnboarding(true); setIsLoading(false); }, 500);
      } else {
        setIsLoading(false);
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => setUserPosition([position.coords.latitude, position.coords.longitude]),
          () => console.log('Using default position')
        );
      }

      loadTasks();
    } catch (error) {
      console.error('Init error:', error);
      setIsLoading(false);
    }
  }, [loadTasks]);

  useEffect(() => {
    try {
      if (tasks.length > 0) localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch { /* ignore */ }
  }, [tasks]);

  useEffect(() => {
    try {
      if (user) localStorage.setItem('user', JSON.stringify(user));
    } catch { /* ignore */ }
  }, [user]);

  // === CONDITIONAL RETURNS AFTER ALL HOOKS ===
  if (showSplash) {
    return <Splash onFinish={() => setShowSplash(false)} />;
  }

  if (isLoading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // === MAIN RENDER ===
  return (
    <div className="bg-black min-h-screen relative">
      <div className="relative w-full h-screen">
        <MapComponent onLongPress={handleMapLongPress} tasks={tasks} userPosition={userPosition} />

        <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between">
          <button onClick={() => setIsProfileOpen(true)} className="w-12 h-12 rounded-full bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center hover:border-purple-500/50 transition-all">
            <User size={20} className="text-white" />
          </button>
          <button onClick={() => setIsTaskFeedOpen(true)} className="px-4 py-3 rounded-full bg-black/80 backdrop-blur-md border border-white/20 flex items-center gap-2 hover:border-cyan-500/50 transition-all">
            <ListFilter size={18} className="text-cyan-400" />
            <span className="text-white font-medium text-sm">{tasks.filter(tk => tk.status === 'active' || tk.status === 'open').length} Tasks</span>
          </button>
        </div>

        <button onClick={() => { setSelectedPosition(userPosition); setIsCreateModalOpen(true); }} className="absolute bottom-6 right-6 z-[1000] w-14 h-14 rounded-full bg-black border-2 border-cyan-400 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.6)] hover:bg-cyan-400 hover:text-black transition-all active:scale-95" aria-label="Create Task">
          <Plus size={28} strokeWidth={2.5} />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[999] px-4 py-3 bg-black/80 backdrop-blur-md border border-white/10 rounded-full text-white text-sm text-center max-w-[280px]">
          {t(language, 'longPressHint') || 'Long press on map to create a task'}
        </div>
      </div>

      <LanguageSelectorModal isOpen={showLanguageSelector} onClose={() => setShowLanguageSelector(false)} />
      <OnboardingModal isOpen={showOnboarding} onComplete={() => setShowOnboarding(false)} />
      <CreateTaskModal isOpen={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); setSelectedPosition(null); }} latitude={selectedPosition?.[0] || userPosition[0]} longitude={selectedPosition?.[1] || userPosition[1]} onSubmit={handleCreateTask} />
      <TaskFeed isOpen={isTaskFeedOpen} onClose={() => setIsTaskFeedOpen(false)} tasks={tasks} userLatitude={userPosition[0]} userLongitude={userPosition[1]} onClaimTask={handleClaimTask} />
      <UserProfile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} tasks={tasks} onWithdraw={handleWithdraw} />
    </div>
  );
}

export default function Home() {
  return <LanguageProvider><HomeContent /></LanguageProvider>;
}
