"use client";

// TaskHub SaaS - Telegram Mini App with Supabase
import { useState, useEffect, useCallback, useRef } from "react";
import nextDynamic from "next/dynamic";
import { Plus, User, ListFilter, Loader2, Map as MapIcon, MessageSquare, Bell } from "lucide-react";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import CreateTaskModal from "@/components/CreateTaskModal";
import TaskFeed from "@/components/TaskFeed";
import UserProfile from "@/components/UserProfile";
import LanguageSelectorModal from "@/components/LanguageSelectorModal";
import OnboardingModal from "@/components/OnboardingModal";
import ChatRoom from "@/components/ChatRoom";
import TabBar from "@/components/TabBar";
import Header from "@/components/Header";
import Splash from "@/components/Splash";
import PulseLogo from "@/components/PulseLogo";
import { Task as TaskType, User as UserType } from "@/types/task";
import { t, initializeLanguage } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

const MapComponent = nextDynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="text-white">Loading map...</div>
    </div>
  ),
});

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

function HomeContent() {
  const { language } = useLanguage();
  const [isClient, setIsClient] = useState(false);
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
  const [showChatRoom, setShowChatRoom] = useState(false);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'feed' | 'map' | 'chats' | 'profile'>('feed');

  // Long press state
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);

  // Client-side check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show splash on first load, then language selector
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      // After splash, check if language is set
      const savedLanguage = localStorage.getItem('language');
      if (!savedLanguage) {
        setShowLanguageSelector(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Пока не смонтировался - показываем черный экран
  if (!isClient) return <div style={{ background: 'black', minHeight: '100vh' }} />;

  if (showSplash) {
    return <Splash onFinish={() => setShowSplash(false)} />;
  }

  // IP-based geolocation
  const getLocationByIP = useCallback(async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        if (data.latitude && data.longitude) {
          setUserPosition([parseFloat(data.latitude), parseFloat(data.longitude)]);
          return;
        }
      }
    } catch (e) {
      console.log('IP geolocation failed, using browser');
    }
    // Fallback to browser geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserPosition([position.coords.latitude, position.coords.longitude]),
        () => console.log('Using default position (New York)')
      );
    }
  }, []);

  // Load tasks from Supabase
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
      // Fallback to localStorage
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) setTasks(JSON.parse(savedTasks));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize app
  useEffect(() => {
    if (typeof window === 'undefined') return;

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
      setUser(JSON.parse(savedUser));
    } else {
      const defaultUser: UserType = {
        id: generateId(),
        username: tg?.initDataUnsafe?.user?.username || tg?.initDataUnsafe?.user?.first_name || 'user_' + Math.random().toString(36).substr(2, 5),
        balance: 0,
        completedTasks: 0,
      };
      setUser(defaultUser);
      localStorage.setItem('user', JSON.stringify(defaultUser));
    }

    // Show onboarding for first-time users
    const savedOnboarding = localStorage.getItem('onboarding_completed');
    if (!savedLanguage && savedOnboarding !== 'true') {
      setTimeout(() => {
        setShowOnboarding(true);
        setIsLoading(false);
      }, 500);
    } else {
      setIsLoading(false);
    }

    // Get user location
    getLocationByIP();

    // Load tasks
    loadTasks();
  }, [loadTasks, getLocationByIP]);

  // Save tasks to localStorage backup
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  // Save user
  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  // Handle long press on map
  const handleMapLongPress = useCallback((e: any) => {
    if (!e?.latlng) return;
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    setSelectedPosition([lat, lng]);
    setIsCreateModalOpen(true);
  }, []);

  // Create task handler
  const handleCreateTask = useCallback(async (taskData: Omit<TaskType, 'id' | 'created_at' | 'status' | 'user_id'>) => {
    if (!user || typeof window === 'undefined') return;

    const newTask: TaskType = {
      ...taskData,
      id: generateId(),
      created_at: Date.now(),
      status: 'open',
      user_id: user.id,
    };

    // Add to Supabase
    try {
      const { error } = await supabase.from('tasks').insert({
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

      if (error) throw error;
    } catch (error) {
      console.error('Error creating task:', error);
    }

    // Update local state
    setTasks(prev => [newTask, ...prev]);

    // Haptic feedback
    const tg = (window as any).Telegram?.WebApp;
    tg?.HapticFeedback?.notificationOccurred('success');
  }, [user]);

  // Claim task handler
  const handleClaimTask = useCallback(async (taskId: string) => {
    if (typeof window === 'undefined') return;

    // Update in Supabase
    try {
      await supabase
        .from('tasks')
        .update({ status: 'in_progress' })
        .eq('id', taskId);
    } catch (error) {
      console.error('Error claiming task:', error);
    }

    // Update local state
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: 'claimed' as const } : task
    ));

    const tg = (window as any).Telegram?.WebApp;
    tg?.HapticFeedback?.impactOccurred('light');
    alert(t(language, 'taskClaimed'));
  }, [language]);

  // Withdraw handler
  const handleWithdraw = useCallback(() => {
    if (!user || typeof window === 'undefined') {
      alert(t(language, 'minimumWithdrawal'));
      return;
    }
    alert(t(language, 'withdrawalSubmitted', { amount: String(user.balance) }) + '\n\n' + t(language, 'withdrawalInfo'));
    setUser(prev => prev ? { ...prev, balance: 0 } : null);
  }, [user, language]);

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

  return (
    <div className="bg-black min-h-screen relative">
      {/* Header */}
      <Header
        activeTab={activeTab}
        unreadCount={0}
        onProfileClick={() => setIsProfileOpen(true)}
        onFeedClick={() => setIsTaskFeedOpen(true)}
        tasksCount={tasks.filter(t => t.status === 'open').length}
      />

      {/* Main Content based on active tab */}
      {activeTab === 'feed' && (
        <div className="relative w-full h-screen">
          <MapComponent onLongPress={handleMapLongPress} tasks={tasks} userPosition={userPosition} />

          {/* Create Task Button */}
          <button onClick={() => { setSelectedPosition(userPosition); setIsCreateModalOpen(true); }} className="absolute bottom-6 right-6 z-[1000] w-14 h-14 rounded-full bg-black border-2 border-cyan-400 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.6)] hover:shadow-[0_0_25px_rgba(34,211,238,0.9)] hover:bg-cyan-400 hover:text-black transition-all duration-300 active:scale-95" aria-label="Create Task">
            <Plus size={28} strokeWidth={2.5} />
          </button>

          {/* Hint */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[999] px-4 py-3 bg-black/80 backdrop-blur-md border border-white/10 rounded-full text-white text-sm text-center max-w-[280px]">
            {t(language, 'longPressHint')}
          </div>
        </div>
      )}

      {activeTab === 'map' && (
        <div className="relative w-full h-screen">
          <MapComponent onLongPress={handleMapLongPress} tasks={tasks} userPosition={userPosition} />
        </div>
      )}

      {activeTab === 'chats' && (
        <ChatRoom userId={user?.id || ''} tasks={tasks} />
      )}

      {activeTab === 'profile' && (
        <div className="pb-24">
          <div className="p-4">
            <UserProfile
              user={user}
              tasks={tasks}
              onWithdraw={handleWithdraw}
            />
          </div>
        </div>
      )}

      {/* TabBar */}
      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreateTask={() => { setSelectedPosition(userPosition); setIsCreateModalOpen(true); }}
        onProfileClick={() => setIsProfileOpen(true)}
        onFeedClick={() => setIsTaskFeedOpen(true)}
        onChatClick={() => setActiveTab('chats')}
        tasksCount={tasks.filter(t => t.status === 'open').length}
        unreadCount={0}
      />

      {/* Modals */}
      <LanguageSelectorModal isOpen={showLanguageSelector} onClose={() => setShowLanguageSelector(false)} />
      <OnboardingModal isOpen={showOnboarding} onComplete={() => setShowOnboarding(false)} />
      <CreateTaskModal isOpen={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); setSelectedPosition(null); }} latitude={selectedPosition?.[0] || userPosition[0]} longitude={selectedPosition?.[1] || userPosition[1]} onSubmit={handleCreateTask} />
      <TaskFeed isOpen={isTaskFeedOpen} onClose={() => setIsTaskFeedOpen(false)} tasks={tasks} userLatitude={userPosition[0]} userLongitude={userPosition[1]} onClaimTask={handleClaimTask} />
    </div>
  );
}

export default function Home() {
  return (<LanguageProvider><HomeContent /></LanguageProvider>);
}
