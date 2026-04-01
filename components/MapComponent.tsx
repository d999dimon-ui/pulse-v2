"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Task } from "@/types/task";

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
}

export default function MapComponent({ onLongPress, tasks = [] }: MapComponentProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const defaultPosition: [number, number] = [40.7128, -74.0060];

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
      
      {/* Handle long press events */}
      {onLongPress && <MapEventHandler onLongPress={onLongPress} />}
    </MapContainer>
  );
}
