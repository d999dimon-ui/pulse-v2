"use client";

import { Task, CATEGORIES, CATEGORY_COLORS } from '@/types/task';
import { X, MapPin, Clock, Star, DollarSign } from 'lucide-react';

interface TaskFeedProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  userLatitude: number;
  userLongitude: number;
  onClaimTask: (taskId: string) => void;
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function TaskFeed({ 
  isOpen, 
  onClose, 
  tasks, 
  userLatitude, 
  userLongitude,
  onClaimTask 
}: TaskFeedProps) {
  // Filter tasks within 5km and sort by distance
  const nearbyTasks = tasks
    .filter(task => {
      const distance = calculateDistance(
        userLatitude,
        userLongitude,
        task.latitude,
        task.longitude
      );
      return distance <= 5 && task.status === 'active';
    })
    .map(task => ({
      ...task,
      distance: calculateDistance(
        userLatitude,
        userLongitude,
        task.latitude,
        task.longitude
      )
    }))
    .sort((a, b) => a.distance - b.distance);

  if (!isOpen) return null;

  return (
    <>
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2500]"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[2501] max-h-[70vh] overflow-hidden">
        <div className="bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl 
                        border-t border-cyan-500/30 rounded-t-3xl 
                        shadow-[0_-10px_40px_rgba(34,211,238,0.2)]">
          
          {/* Handle bar */}
          <div className="flex items-center justify-center pt-4 pb-2">
            <div className="w-12 h-1.5 bg-white/20 rounded-full" />
          </div>

          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-b from-gray-900/95 to-transparent">
            <div>
              <h2 className="text-xl font-bold text-white">Nearby Tasks</h2>
              <p className="text-sm text-gray-400">{nearbyTasks.length} tasks within 5km</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={24} className="text-white" />
            </button>
          </div>

          {/* Task List */}
          <div className="overflow-y-auto max-h-[50vh] px-6 py-4 space-y-3">
            {nearbyTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📍</div>
                <p className="text-gray-400">No tasks nearby</p>
                <p className="text-sm text-gray-500 mt-2">Be the first to create a task!</p>
              </div>
            ) : (
              nearbyTasks.map((task) => {
                const category = CATEGORIES.find(c => c.value === task.category);
                return (
                  <div
                    key={task.id}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 
                               hover:border-cyan-500/30 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${CATEGORY_COLORS[task.category]} 
                                        flex items-center justify-center text-2xl`}>
                          {category?.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{task.title}</h3>
                          <p className="text-sm text-gray-400">{category?.label}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-cyan-400 font-bold">
                          {task.currency === 'stars' ? <Star size={16} fill="currentColor" /> : <DollarSign size={16} />}
                          <span>{task.reward}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {task.distance.toFixed(1)} km
                        </div>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{task.description}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={12} />
                          <span>{task.latitude.toFixed(3)}, {task.longitude.toFixed(3)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => onClaimTask(task.id)}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 
                                   text-white font-semibold rounded-xl text-sm
                                   hover:from-cyan-600 hover:to-blue-600
                                   shadow-[0_0_15px_rgba(34,211,238,0.3)]
                                   transition-all duration-300 active:scale-95"
                      >
                        Claim
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom spacing */}
          <div className="h-6" />
        </div>
      </div>
    </>
  );
}
