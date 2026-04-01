"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import SubscriptionModal from "@/components/SubscriptionModal";

// Динамический импорт карты с отключенным SSR (исправляет ошибку window is not defined)
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="text-white">Загрузка карты...</div>
    </div>
  ),
});

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-black min-h-screen relative">
      {/* Интерактивная карта на весь экран (рендерится только на клиенте) */}
      <MapComponent />

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
