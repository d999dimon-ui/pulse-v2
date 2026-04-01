"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { Clock, Zap, DollarSign, MapPin } from 'lucide-react';
import { FlashTask, getFlashTasks, isFlashTask, getUrgencyBadge } from '@/lib/security-moderation';

interface LiveTaskMapProps {
  userPosition?: [number, number];
  searchRadius?: number; // in km
  selectedCategory?: string;
  minReward?: number;
}

// Custom icon for flash tasks
const createFlashTaskIcon = () => {
  return L.divIcon({
    className: 'flash-task-marker',
    html: `
      <div style="
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        animation: pulse-flash 1.5s infinite;
      ">
        ⚡
      </div>
      <style>
        @keyframes pulse-flash {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      </style>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48],
  });
};

// Regular task icon
const createTaskIcon = (category: string) => {
  const colors: Record<string, string> = {
    delivery: '#f97316',
    cleaning: '#22c55e',
    help: '#3b82f6',
    photo: '#a855f7',
    it: '#06b6d4',
  };
  
  const color = colors[category] || '#3b82f6';
  
  return L.divIcon({
    className: 'task-marker',
    html: `
      <div style="
        background: ${color};
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      ">
        📍
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

export default function LiveTaskMap({
  userPosition = [40.7128, -74.0060],
  searchRadius = 5,
  selectedCategory,
  minReward = 0,
}: LiveTaskMapProps) {
  const [tasks, setTasks] = useState<FlashTask[]>([]);
  const [flashTasks, setFlashTasks] = useState<FlashTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<FlashTask | null>(null);

  useEffect(() => {
    loadTasks();
    loadFlashTasks();
  }, [searchRadius, selectedCategory, minReward]);

  const loadTasks = async () => {
    setIsLoading(true);
    // Load regular tasks from Supabase
    const { data, error } = await fetch('/api/tasks').then(r => r.json());
    
    if (data && !error) {
      let filtered = data.filter((task: any) => {
        if (selectedCategory && task.category !== selectedCategory) return false;
        if (minReward && task.reward < minReward) return false;
        return true;
      });
      setTasks(filtered.filter((t: any) => !t.is_flash_task));
    }
    
    setIsLoading(false);
  };

  const loadFlashTasks = async () => {
    const flash = await getFlashTasks(50);
    setFlashTasks(flash);
  };

  const allTasks = [...tasks, ...flashTasks];

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={userPosition}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User position */}
        <CircleMarker
          center={userPosition}
          radius={searchRadius * 100} // Convert km to meters for visual
          pathOptions={{
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.1,
            weight: 2,
            dashArray: '10, 10',
          }}
        />
        
        {/* Flash tasks (urgent) */}
        {flashTasks.map((task) => {
          const badge = getUrgencyBadge(task);
          return (
            <Marker
              key={task.id}
              position={[task.latitude, task.longitude]}
              icon={createFlashTaskIcon()}
              eventHandlers={{
                click: () => setSelectedTask(task),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[250px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{badge.emoji}</span>
                    <div>
                      <h3 className="font-bold text-gray-900">{task.title}</h3>
                      <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                        FLASH TASK
                      </span>
                  </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1 text-green-600 font-bold">
                      <DollarSign size={14} />
                      {task.reward} USDT
                    </div>
                    <div className="flex items-center gap-1 text-purple-600 font-bold">
                      <Zap size={14} />
                      +{task.flash_xp_bonus}% XP
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-red-600">
                    <Clock size={12} />
                    <span>
                      Urgent until: {new Date(task.urgent_until).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {/* Regular tasks */}
        {tasks.map((task) => (
          <Marker
            key={task.id}
            position={[task.latitude, task.longitude]}
            icon={createTaskIcon(task.category)}
            eventHandlers={{
              click: () => setSelectedTask(task),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-gray-900 mb-1">{task.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-green-600 font-bold">
                    {task.reward} {task.currency || 'USDT'}
                  </span>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded capitalize">
                    {task.category}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Task counter overlay */}
      <div className="absolute top-4 left-4 z-[1000] bg-black/80 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-cyan-400" />
            <span className="text-white">{allTasks.length} tasks nearby</span>
          </div>
          {flashTasks.length > 0 && (
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-yellow-400" />
              <span className="text-yellow-400 font-bold">{flashTasks.length} FLASH</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Selected task detail (mobile) */}
      {selectedTask && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 md:hidden">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-white text-lg">{selectedTask.title}</h3>
            <button
              onClick={() => setSelectedTask(null)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <span className="text-white text-xl">×</span>
            </button>
          </div>
          <p className="text-gray-400 text-sm mb-3">{selectedTask.description}</p>
          <div className="flex items-center justify-between">
            <div className="text-green-400 font-bold">{selectedTask.reward} {selectedTask.currency}</div>
            {selectedTask.is_flash_task && (
              <div className="flex items-center gap-1 text-red-400">
                <Zap size={16} />
                <span className="font-bold">+{selectedTask.flash_xp_bonus}% XP</span>
              </div>
            )}
          </div>
          <button className="w-full mt-3 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl">
            Accept Task
          </button>
        </div>
      )}
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] bg-black/80 backdrop-blur-md border border-white/20 rounded-xl px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-white">Loading tasks...</span>
          </div>
        </div>
      )}
    </div>
  );
}
