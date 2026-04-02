"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Navigation } from 'lucide-react';

interface LocationTrackerProps {
  taskId: string;
  isActive: boolean;
  onLocationUpdate?: (lat: number, lng: number) => void;
}

export default function LocationTracker({ taskId, isActive, onLocationUpdate }: LocationTrackerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Start tracking executor location
  const startTracking = useCallback(() => {
    if (!isActive || !navigator.geolocation || !isClient) return;

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
            user_id: 'anonymous',
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
  }, [isActive, taskId, isClient, onLocationUpdate]);

  useEffect(() => {
    if (isActive && !isTracking && isClient) {
      startTracking();
    } else if (!isActive && isTracking) {
      setIsTracking(false);
    }

    return () => {
      if (isTracking) setIsTracking(false);
    };
  }, [isActive, isTracking, startTracking, isClient]);

  if (!isActive || !isClient) return null;

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
