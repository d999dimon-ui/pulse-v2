"use client";

import { useEffect, useState } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '@/lib/supabase';

interface ExecutorMarkerProps {
  taskId: string;
  userPosition: [number, number];
}

// Smooth animated marker for executor
const createExecutorIcon = () => {
  return L.divIcon({
    className: 'executor-marker',
    html: `
      <div style="
        background: linear-gradient(135deg, #22c55e 0%, #10b981 100%);
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        animation: pulse 2s infinite;
      ">
        🚗
      </div>
      <style>
        @keyframes pulse {
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

export default function ExecutorMarker({ taskId, userPosition }: ExecutorMarkerProps) {
  const map = useMap();
  const [executorPosition, setExecutorPosition] = useState<[number, number] | null>(null);
  const [executorAddress, setExecutorAddress] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to real-time location updates
    const channel = supabase
      .channel(`task-${taskId}-locations`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'locations',
          filter: `task_id=eq.${taskId}`,
        },
        (payload) => {
          const { latitude, longitude, user_id } = payload.new as any;
          setExecutorPosition([latitude, longitude]);
          setExecutorAddress(user_id);
        }
      )
      .subscribe();

    // Load last known position
    const loadLastPosition = async () => {
      const { data } = await supabase
        .from('locations')
        .select('latitude, longitude, user_id')
        .eq('task_id', taskId)
        .order('timestamp', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setExecutorPosition([data[0].latitude, data[0].longitude]);
        setExecutorAddress(data[0].user_id);
      }
    };

    loadLastPosition();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId]);

  // Smoothly animate marker position
  useEffect(() => {
    if (executorPosition) {
      // Map will automatically animate with CSS transitions
      // For smoother animation, you can use Leaflet's built-in interpolation
    }
  }, [executorPosition]);

  if (!executorPosition) return null;

  return (
    <Marker position={executorPosition} icon={createExecutorIcon()}>
      <Popup>
        <div className="p-2 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🚗</span>
            <div>
              <div className="font-bold text-gray-900">Executor</div>
              <div className="text-xs text-green-600 font-semibold">● On the way</div>
            </div>
          </div>
          {executorAddress && (
            <div className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-1 inline-block">
              Wallet: {executorAddress.slice(0, 6)}...{executorAddress.slice(-4)}
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
