"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle } from "react-leaflet";
import L from "leaflet";
import { Task } from "@/types/task";
import { calculateHeatZones, getHeatIntensityText } from "@/lib/heatmap";
import {
  calculateDistance,
  countTasksInRadius,
  getSurgeMultiplier,
  getSurgeZoneColor,
  getSurgeStatusText,
  SURGE_RADIUS_KM,
  SURGE_THRESHOLD 
} from "@/lib/surge-pricing";
import ExecutorMarker from "./ExecutorMarker";

// Fix for Leaflet default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom icon for tasks
const createTaskIcon = (category: string) => {
  const colors: Record<string, string> = {
    delivery: '#f97316',
    cleaning: '#22c55e',
    help: '#3b82f6',
    photo: '#a855f7',
  };
  
  const color = colors[category] || '#3b82f6';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      ">📍</div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// User position icon
const createUserIcon = () => {
  return L.divIcon({
    className: 'user-marker',
    html: `
      <div style="position: relative;">
        <div style="
          width: 20px;
          height: 20px;
          background: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3), 0 2px 8px rgba(0,0,0,0.3);
          position: relative;
          z-index: 2;
        "></div>
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          background: rgba(59, 130, 246, 0.2);
          border-radius: 50%;
          animation: pulse-blue 2s ease-in-out infinite;
          z-index: 1;
        "></div>
      </div>
      <style>
        @keyframes pulse-blue {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
      </style>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Component to handle map events
function MapEventHandler({ onLongPress }: { onLongPress: (e: any) => void }) {
  const [pressTimer, setPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const map = useMapEvents({
    contextmenu: (e) => {
      e.originalEvent.preventDefault();
      const timer = setTimeout(() => {
        onLongPress(e);
      }, 500);
      setPressTimer(timer);
    },
    click: () => {
      if (pressTimer) {
        clearTimeout(pressTimer);
        setPressTimer(null);
      }
    },
  });

  return null;
}

interface MapComponentProps {
  onLongPress?: (e: any) => void;
  tasks?: Task[];
  userPosition?: [number, number];
  activeTaskId?: string;
  showHeatmap?: boolean;
  language?: string;
}

export default function MapComponent({ onLongPress, tasks = [], userPosition = [40.7128, -74.0060], activeTaskId, showHeatmap, language = 'ru' }: MapComponentProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [surgeInfo, setSurgeInfo] = useState<{ multiplier: number; count: number; isActive: boolean } | null>(null);

  useEffect(() => { setIsMounted(true); }, []);

  // Calculate surge pricing - pure computation, no side effects
  const surgeData = useMemo(() => {
    if (!isMounted || tasks.length === 0) return { multiplier: 1, count: 0, isActive: false };
    const count = countTasksInRadius(tasks, userPosition[0], userPosition[1], SURGE_RADIUS_KM);
    const multiplier = getSurgeMultiplier(tasks, userPosition[0], userPosition[1]);
    return { multiplier, count, isActive: count > SURGE_THRESHOLD };
  }, [tasks, userPosition, isMounted]);

  // Update surge info state AFTER computation
  useEffect(() => {
    if (isMounted && tasks.length > 0) {
      setSurgeInfo(surgeData);
    }
  }, [surgeData, isMounted, tasks.length]);

  const defaultPosition: [number, number] = userPosition;

  if (!isMounted) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-white">Loading map...</div>
      </div>
    );
  }

  return (
    <MapContainer
      center={defaultPosition}
      zoom={13}
      scrollWheelZoom={true}
      className="w-full h-screen z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Surge Zone Circle */}
      {surgeData.isActive && (
        <Circle center={userPosition} radius={SURGE_RADIUS_KM * 1000}
          pathOptions={{ color: getSurgeZoneColor(surgeData.multiplier).replace(/[\d.]+\)$/g, '1)'), fillColor: getSurgeZoneColor(surgeData.multiplier), fillOpacity: 0.3, weight: 2, dashArray: '10, 10' }} />
      )}

      {/* Heatmap zones for high demand areas */}
      {showHeatmap && calculateHeatZones(tasks, userPosition).map((zone, i) => (
        <Circle key={i} center={zone.center} radius={zone.radius * 1000}
          pathOptions={{ color: zone.color.replace(/[\d.]+\)$/g, '1)'), fillColor: zone.color, fillOpacity: 0.4, weight: 1 }} />
      ))}
      
      {/* Task markers */}
      {tasks.map((task) => (
        <Marker
          key={task.id}
          position={[task.latitude, task.longitude]}
          icon={createTaskIcon(task.category)}
        >
          <Popup>
            <div className="p-2 min-w-[200px]">
              <h3 className="font-bold text-gray-900 mb-1">{task.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-cyan-600 font-bold">
                  {task.currency === 'stars' ? '⭐' : '💵'} {task.reward}
                </span>
                <span className="text-xs px-2 py-1 bg-gray-200 rounded-full capitalize">
                  {task.category}
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      
      {/* User position marker */}
      <Marker position={userPosition} icon={createUserIcon()}>
        <Popup>
          <div className="p-2 text-center">
            <p className="font-bold text-gray-900 text-sm">📍 {language === 'ru' ? 'Вы здесь' : 'You are here'}</p>
          </div>
        </Popup>
      </Marker>

      {/* Executor real-time marker */}
      {activeTaskId && <ExecutorMarker taskId={activeTaskId} userPosition={userPosition} />}

      {/* Handle long press events */}
      {onLongPress && <MapEventHandler onLongPress={onLongPress} />}
    </MapContainer>
  );
}
