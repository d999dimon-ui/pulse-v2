"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Loader2 } from "lucide-react";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import TabBar from "@/components/TabBar";
import HomeScreen from "@/components/screens/HomeScreen";
import MapScreen from "@/components/screens/MapScreen";
import TasksScreen from "@/components/screens/TasksScreen";
import ProfileScreen from "@/components/screens/ProfileScreen";
import CreateTaskModal from "@/components/CreateTaskModal";
import LanguageSelectorModal from "@/components/LanguageSelectorModal";
import OnboardingModal from "@/components/OnboardingModal";
import Splash from "@/components/Splash";
import { Task as TaskType, User as UserType } from "@/types/task";
import { t } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

type TabType = 'home' | 'map' | 'tasks' | 'profile';

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

function AppContent() {
  const { language } = useLanguage();

  // === STATE ===
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [user, setUser] = useState<UserType | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number]>([40.7128, -74.0060]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);

  // === CALLBACKS ===
  const loadTasks = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        setTasks(data.map(task => ({
          id: task.id, title: task.title, description: task.description || '',
          reward: Number(task.reward) || 5, currency: (task.currency as 'stars' | 'usd') || 'stars',
          category: (task.category as any) || 'help', latitude: task.latitude, longitude: task.longitude,
          status: (task.status as any) || 'open', created_at: new Date(task.created_at).getTime(),
          user_id: task.user_id || '', executor_id: task.executor_id, exact_address: task.exact_address,
        })));
      }
    } catch (error) {
      console.error('Load tasks error:', error);
      try {
        const saved = localStorage.getItem('tasks');
        if (saved) setTasks(JSON.parse(saved));
      } catch {}
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreateTask = useCallback(async (taskData: Omit<TaskType, 'id' | 'created_at' | 'status' | 'user_id'>) => {
    if (!user) return;
    const newTask: TaskType = { ...taskData, id: generateId(), created_at: Date.now(), status: 'open', user_id: user.id };
    try {
      await supabase.from('tasks').insert({
        id: newTask.id, title: newTask.title, description: newTask.description,
        reward: newTask.reward, currency: newTask.currency, category: newTask.category,
        latitude: newTask.latitude, longitude: newTask.longitude, status: 'open',
        user_id: user.id, created_at: newTask.created_at,
      });
    } catch (e) { console.error('Create error:', e); }
    setTasks(prev => [newTask, ...prev]);
  }, [user]);

  const handleClaimTask = useCallback(async (taskId: string) => {
    try { await supabase.from('tasks').update({ status: 'in_progress' }).eq('id', taskId); } catch {}
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'claimed' as const } : t));
  }, []);

  const handleWithdraw = useCallback(() => {
    if (!user) { alert('Minimum withdrawal is 10 Stars'); return; }
    alert(`Withdrawal request for ${user.balance} Stars submitted!`);
    setUser(prev => prev ? { ...prev, balance: 0 } : null);
  }, [user]);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setActiveTab('tasks');
  };

  const handleTaskClick = (task: TaskType) => {
    setSelectedTask(task);
    setIsCreateModalOpen(false);
  };

  // === EFFECTS ===
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) { tg.ready(); tg.expand(); tg.setHeaderColor('#000000'); tg.setBackgroundColor('#000000'); }

      const savedUser = localStorage.getItem('user');
      const savedLang = localStorage.getItem('language');
      if (savedUser) { try { setUser(JSON.parse(savedUser)); } catch {} }
      else {
        const def: UserType = { id: generateId(), username: tg?.initDataUnsafe?.user?.username || tg?.initDataUnsafe?.user?.first_name || 'user_' + Math.random().toString(36).substr(2, 5), balance: 0, completedTasks: 0 };
        setUser(def);
        localStorage.setItem('user', JSON.stringify(def));
      }
      if (!savedLang) setShowLanguageSelector(true);
      const onboarded = localStorage.getItem('onboarding_completed');
      if (!savedLang && onboarded !== 'true') setTimeout(() => { setShowOnboarding(true); setIsLoading(false); }, 500);
      else setIsLoading(false);

      if (navigator.geolocation) navigator.geolocation.getCurrentPosition(p => setUserPosition([p.coords.latitude, p.coords.longitude]), () => {});
      loadTasks();
    } catch (e) { console.error('Init error:', e); setIsLoading(false); }
  }, [loadTasks]);

  useEffect(() => { try { if (tasks.length > 0) localStorage.setItem('tasks', JSON.stringify(tasks)); } catch {} }, [tasks]);
  useEffect(() => { try { if (user) localStorage.setItem('user', JSON.stringify(user)); } catch {} }, [user]);

  // === RENDER ===
  if (showSplash) return <Splash onFinish={() => setShowSplash(false)} />;

  if (isLoading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-white">{t(language, 'common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      {/* Screens */}
      {activeTab === 'home' && <HomeScreen onCategorySelect={handleCategorySelect} />}
      {activeTab === 'map' && <MapScreen onTaskClick={handleTaskClick} />}
      {activeTab === 'tasks' && <TasksScreen initialCategory={selectedCategory} onTaskClick={handleTaskClick} />}
      {activeTab === 'profile' && <ProfileScreen user={user} tasks={tasks} onWithdraw={handleWithdraw} onClose={() => setActiveTab('home')} onUpdateUser={setUser} />}

      {/* TabBar */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Create Task FAB (visible on home and map) */}
      {(activeTab === 'home' || activeTab === 'map') && (
        <button
          onClick={() => { setSelectedPosition(userPosition); setIsCreateModalOpen(true); }}
          className="fixed bottom-20 right-4 z-[2001] w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500
                     text-white flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.5)]
                     hover:shadow-[0_0_30px_rgba(34,211,238,0.8)] transition-all active:scale-90"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      )}

      {/* Modals */}
      <LanguageSelectorModal isOpen={showLanguageSelector} onClose={() => setShowLanguageSelector(false)} />
      <OnboardingModal isOpen={showOnboarding} onComplete={() => setShowOnboarding(false)} />
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); setSelectedPosition(null); }}
        latitude={selectedPosition?.[0] || userPosition[0]}
        longitude={selectedPosition?.[1] || userPosition[1]}
        onSubmit={handleCreateTask}
      />
    </div>
  );
}

export default function Home() {
  return <LanguageProvider><AppContent /></LanguageProvider>;
}
