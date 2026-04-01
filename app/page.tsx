"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Plus } from "lucide-react";
import L from "leaflet";
import SubscriptionModal from "@/components/SubscriptionModal";

// Фикс для дефолтных маркеров Leaflet в Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Кастомный хук для инициализации карты (избегаем ошибок SSR)
function useMapInitialized() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}

export default function Home() {
  const isMounted = useMapInitialized();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Координаты по умолчанию (Москва)
  const defaultPosition: [number, number] = [55.751244, 37.618423];

  if (!isMounted) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-white">Загрузка карты...</div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen relative">
      {/* Интерактивная карта на весь экран */}
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
        <Marker position={defaultPosition}>
          <Popup>
            Москва
            <br />
            Добро пожаловать!
          </Popup>
        </Marker>
      </MapContainer>

      {/* Плавающая кнопка [+] (Bottom Right, Neon Blue) */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-[1000] w-14 h-14 rounded-full 
                   bg-black border-2 border-cyan-400 text-cyan-400
                   flex items-center justify-center
                   shadow-[0_0_15px_rgba(34,211,238,0.6)]
                   hover:shadow-[0_0_25px_rgba(34,211,238,0.9)]
                   hover:bg-cyan-400 hover:text-black
                   transition-all duration-300
                   active:scale-95"
        aria-label="Добавить"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* Модальное окно с тарифами */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
