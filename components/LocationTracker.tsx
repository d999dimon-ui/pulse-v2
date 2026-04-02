"use client";

import { useEffect, useState, useCallback } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface LocationTrackerProps {
  taskId: string;
  isActive: boolean;
  onLocationUpdate?: (lat: number, lng: number) => void;
}

export default function LocationTracker({ taskId, isActive, onLocationUpdate }: LocationTrackerProps) {
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get address from localStorage (без wagmi)
  useEffect(() => {
    if (isClient) {
      // Пытаемся получить адрес из localStorage или оставляем undefined
      setAddress(undefined);
    }
  }, [isClient]);
  const startTracking = useCallback(() => {
    if (!isActive || !navigator.geolocation) return;

    setIsTracking(true);
    setError(null);

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        // Update UI
        if (onLocationUpdate) {
          onLocationUpdate(latitude, longitude);
        }

        // Send to Supabase Realtime
        try {
          const { error } = await supabase.from('locations').insert({
            task_id: taskId,
            user_id: address || 'anonymous',
            latitude,
            longitude,
            accuracy: accuracy || null,
          });

          if (error) throw error;
        } catch (err: any) {
          console.error('Location update error:', err);
          setError('Failed to send location');
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Location access denied');
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isActive, taskId, address, onLocationUpdate]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    setIsTracking(false);
  }, []);

  useEffect(() => {
    if (isActive && !isTracking) {
      startTracking();
    } else if (!isActive && isTracking) {
      stopTracking();
    }

    return () => {
      if (isTracking) stopTracking();
    };
  }, [isActive, isTracking, startTracking, stopTracking]);

  if (!isActive) return null;

  return (
    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Navigation size={20} className="text-green-400 animate-pulse" />
          <span className="text-white font-semibold">Live Tracking Active</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
          <span className="text-xs text-green-400">Live</span>
        </div>
      </div>
      
      {error && (
        <div className="text-red-400 text-sm mb-3">{error}</div>
      )}
      
      <div className="text-xs text-gray-400">
        Your location is being shared with the task creator in real-time.
        This helps them track your progress and estimate arrival time.
      </div>
    </div>
  );
}
