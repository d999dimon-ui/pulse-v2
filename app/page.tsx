"use client";

// TaskHub SaaS - Telegram Mini App for task management
import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Plus, User, ListFilter } from "lucide-react";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import CreateTaskModal from "@/components/CreateTaskModal";
import TaskFeed from "@/components/TaskFeed";
import UserProfile from "@/components/UserProfile";
import LanguageSelectorModal from "@/components/LanguageSelectorModal";
import { Task, User as UserType } from "@/types/task";
import { t } from "@/utils/translations";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<UserType | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number]>([40.7128, -74.0060]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTaskFeedOpen, setIsTaskFeedOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedTasks = localStorage.getItem('tasks');
    const savedUser = localStorage.getItem('user');
    const savedLanguage = localStorage.getItem('language');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      const tg = (window as any).Telegram?.WebApp;
      const defaultUser: UserType = {
        id: generateId(),
        username: tg?.initData?.user?.username || 'user_' + Math.random().toString(36).substr(2, 5),
        balance: 0,
        completedTasks: 0,
      };
      setUser(defaultUser);
      localStorage.setItem('user', JSON.stringify(defaultUser));
    }
    if (!savedLanguage) setShowLanguageSelector(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserPosition([position.coords.latitude, position.coords.longitude]),
        () => console.log('Using default position (New York)')
      );
    }
  }, []);

  useEffect(() => {
    if (tasks.length > 0) localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  const handleMapLongPress = useCallback((e: any) => {
    if (!e?.latlng) return;
    setSelectedPosition([e.latlng.lat, e.latlng.lng]);
    setIsCreateModalOpen(true);
  }, []);

  const handleCreateTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'status' | 'userId'>) => {
    if (!user || typeof window === 'undefined') return;
    const newTask: Task = { ...taskData, id: generateId(), createdAt: Date.now(), status: 'active', userId: user.id };
    setTasks(prev => [newTask, ...prev]);
    const tg = (window as any).Telegram?.WebApp;
    tg?.HapticFeedback?.notificationOccurred('success');
  }, [user]);

  const handleClaimTask = useCallback((taskId: string) => {
    if (typeof window === 'undefined') return;
    setTasks(prev => prev.map(task => task.id === taskId ? { ...task, status: 'claimed' as const } : task));
    const tg = (window as any).Telegram?.WebApp;
    tg?.HapticFeedback?.impactOccurred('light');
    alert(t(language, 'taskClaimed'));
  }, [language]);

  const handleWithdraw = useCallback(() => {
    if (!user || typeof window === 'undefined') {
      alert(t(language, 'minimumWithdrawal'));
      return;
    }
    alert(t(language, 'withdrawalSubmitted', { amount: user.balance }) + '\n\n' + t(language, 'withdrawalInfo'));
    setUser(prev => prev ? { ...prev, balance: 0 } : null);
  }, [user, language]);

  return (
    <div className="bg-black min-h-screen relative">
      <div className="relative w-full h-screen">
        <MapComponent onLongPress={handleMapLongPress} />
        <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between">
          <button onClick={() => setIsProfileOpen(true)} className="w-12 h-12 rounded-full bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center hover:border-purple-500/50 transition-all duration-300">
            <User size={20} className="text-white" />
          </button>
          <button onClick={() => setIsTaskFeedOpen(true)} className="px-4 py-3 rounded-full bg-black/80 backdrop-blur-md border border-white/20 flex items-center gap-2 hover:border-cyan-500/50 transition-all duration-300">
            <ListFilter size={18} className="text-cyan-400" />
            <span className="text-white font-medium text-sm">{tasks.filter(t => t.status === 'active').length} Tasks</span>
          </button>
        </div>
        <button onClick={() => { setSelectedPosition(userPosition); setIsCreateModalOpen(true); }} className="absolute bottom-6 right-6 z-[1000] w-14 h-14 rounded-full bg-black border-2 border-cyan-400 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.6)] hover:shadow-[0_0_25px_rgba(34,211,238,0.9)] hover:bg-cyan-400 hover:text-black transition-all duration-300 active:scale-95" aria-label="Create Task">
          <Plus size={28} strokeWidth={2.5} />
        </button>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[999] px-4 py-3 bg-black/80 backdrop-blur-md border border-white/10 rounded-full text-white text-sm text-center max-w-[280px]">
          {t(language, 'longPressHint')}
        </div>
      </div>
      <LanguageSelectorModal isOpen={showLanguageSelector} onClose={() => setShowLanguageSelector(false)} />
      <CreateTaskModal isOpen={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); setSelectedPosition(null); }} latitude={selectedPosition?.[0] || userPosition[0]} longitude={selectedPosition?.[1] || userPosition[1]} onSubmit={handleCreateTask} />
      <TaskFeed isOpen={isTaskFeedOpen} onClose={() => setIsTaskFeedOpen(false)} tasks={tasks} userLatitude={userPosition[0]} userLongitude={userPosition[1]} onClaimTask={handleClaimTask} />
      <UserProfile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} tasks={tasks} onWithdraw={handleWithdraw} />
    </div>
  );
}

export default function Home() {
  return (<LanguageProvider><HomeContent /></LanguageProvider>);
}
