// Real-time executor tracking via Supabase Realtime
// Orderer and recipient can see executor movement on the map

import { supabase } from './supabase';

export interface ExecutorPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  speed?: number;
}

// Start tracking executor position and broadcast to Supabase
export function startTracking(taskId: string, onPositionUpdate: (pos: ExecutorPosition) => void) {
  if (!navigator.geolocation) return null;

  const watchId = navigator.geolocation.watchPosition(
    async (position) => {
      const pos: ExecutorPosition = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: Date.now(),
        speed: position.coords.speed || undefined,
      };

      // Broadcast to Supabase
      try {
        await supabase
          .from('task_tracking')
          .upsert({
            task_id: taskId,
            latitude: pos.latitude,
            longitude: pos.longitude,
            accuracy: pos.accuracy,
            speed: pos.speed,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'task_id' });
      } catch { /* ignore */ }

      onPositionUpdate(pos);
    },
    (error) => console.error('Tracking error:', error),
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
  );

  return watchId;
}

// Stop tracking
export function stopTracking(watchId: number | null) {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }
}

// Subscribe to executor position updates (for orderer/recipient)
export function subscribeToExecutorTracking(
  taskId: string,
  onPositionUpdate: (pos: ExecutorPosition) => void
) {
  const channel = supabase
    .channel(`task-tracking-${taskId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'task_tracking', filter: `task_id=eq.${taskId}` },
      (payload) => {
        const data = payload.new as any;
        onPositionUpdate({
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: data.accuracy || 0,
          timestamp: new Date(data.updated_at).getTime(),
          speed: data.speed,
        });
      }
    )
    .subscribe();

  return channel;
}

// Get current executor position
export async function getExecutorPosition(taskId: string): Promise<ExecutorPosition | null> {
  try {
    const { data, error } = await supabase
      .from('task_tracking')
      .select('*')
      .eq('task_id', taskId)
      .single();

    if (error || !data) return null;

    return {
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: data.accuracy || 0,
      timestamp: new Date(data.updated_at).getTime(),
      speed: data.speed,
    };
  } catch {
    return null;
  }
}

// Get position history for route visualization
export async function getTrackingHistory(taskId: string, limit: number = 50) {
  try {
    const { data } = await supabase
      .from('task_tracking_history')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return data || [];
  } catch {
    return [];
  }
}
