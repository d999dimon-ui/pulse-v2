"use client";

import { useState, useEffect, useCallback } from 'react';
import nextDynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/utils/translations';
import { Task as TaskType } from '@/types/task';
import { supabase } from '@/lib/supabase';

const MapComponent = nextDynamic(
  () => import("@/components/MapComponent").catch(() => ({
    default: () => <div className="bg-black min-h-screen flex items-center justify-center text-white">Map unavailable</div>
  })),
  { ssr: false, loading: () => <div className="bg-black min-h-screen flex items-center justify-center text-white"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin" /></div> }
);

interface MapScreenProps {
  onTaskClick: (task: TaskType) => void;
}

export default function MapScreen({ onTaskClick }: MapScreenProps) {
  const { language } = useLanguage();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [userPosition, setUserPosition] = useState<[number, number]>([40.7128, -74.0060]);
  const [isLoading, setIsLoading] = useState(true);

  // Get location from Telegram WebApp or browser
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tg = (window as any).Telegram?.WebApp;

    // Try Telegram WebApp location first
    if (tg?.initDataUnsafe?.user) {
      // Telegram WebApp can provide location via requestLocation
      try {
        tg.requestLocation?.(() => {});
      } catch {}
    }

    // Fallback to browser geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
        () => console.log('Using default position')
      );
    }
  }, []);

  // Fetch tasks from Supabase
  const fetchTasks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mapped: TaskType[] = data.map(task => ({
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
        setTasks(mapped);
      }
    } catch (e) {
      console.error('Map tasks error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleLongPress = useCallback((e: any) => {
    // Could open create task modal here
    console.log('Long press at:', e?.latlng);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-white">{t(language, 'map.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <MapComponent
        onLongPress={handleLongPress}
        tasks={tasks}
        userPosition={userPosition}
      />
      {/* Task count overlay */}
      <div className="absolute top-4 left-4 z-[1001] px-4 py-2 bg-black/80 backdrop-blur-md border border-white/20 rounded-full text-white text-sm">
        {tasks.length} {t(language, 'tasks.status.open').toLowerCase()}
      </div>
    </div>
  );
}
