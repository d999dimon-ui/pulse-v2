"use client";

import { useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { subscribeToExecutorTracking, getExecutorPosition, type ExecutorPosition } from '@/lib/realtime-tracking';

interface LiveExecutorMarkerProps {
  taskId: string;
  userPosition: [number, number];
}

// Animated marker for executor
const createExecutorIcon = () => L.divIcon({
  className: 'executor-marker',
  html: `
    <div style="
      background: linear-gradient(135deg, #22c55e 0%, #10b981 100%);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 15px rgba(34, 197, 94, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      position: relative;
    ">
      🏃
      <div style="
        position: absolute;
        inset: -6px;
        border-radius: 50%;
        border: 2px solid rgba(34, 197, 94, 0.4);
        animation: pulse 2s ease-in-out infinite;
      "></div>
    </div>
    <style>
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.3); opacity: 0; }
      }
    </style>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -22],
});

export default function LiveExecutorMarker({ taskId, userPosition }: LiveExecutorMarkerProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);

  useEffect(() => {
    // Get initial position
    getExecutorPosition(taskId).then((pos) => {
      if (pos) {
        setPosition([pos.latitude, pos.longitude]);
        setLastUpdate(pos.timestamp);
      }
    });

    // Subscribe to real-time updates
    const channel = subscribeToExecutorTracking(taskId, (pos: ExecutorPosition) => {
      setPosition([pos.latitude, pos.longitude]);
      setLastUpdate(pos.timestamp);
    });

    return () => {
      channel.unsubscribe();
    };
  }, [taskId]);

  // Calculate distance from user
  const distance = position
    ? Math.sqrt(
        Math.pow(position[0] - userPosition[0], 2) +
        Math.pow(position[1] - userPosition[1], 2)
      ) * 111 // Rough km conversion
    : 0;

  const minutesAgo = lastUpdate ? Math.floor((Date.now() - lastUpdate) / 60000) : 0;

  if (!position) return null;

  return (
    <Marker position={position} icon={createExecutorIcon()}>
      <Popup>
        <div className="p-2 text-center">
          <div className="font-bold text-green-600 mb-1">🏃 Исполнитель в пути</div>
          <div className="text-xs text-gray-600">
            📍 {distance.toFixed(1)} км от вас
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {minutesAgo === 0 ? '🟢 Онлайн' : `🕐 ${minutesAgo} мин назад`}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
