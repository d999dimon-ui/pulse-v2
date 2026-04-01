"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Фикс для дефолтных маркеров Leaflet в Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function MapComponent() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
  );
}
