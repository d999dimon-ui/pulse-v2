// Surge Pricing Logic - Client-side calculation

export const SURGE_RADIUS_KM = 1; // 1 km radius
export const SURGE_THRESHOLD = 5; // Tasks count to trigger surge
export const SURGE_MULTIPLIER = 1.5; // 1.5x price multiplier

// Calculate distance between two points (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Count tasks within radius
export function countTasksInRadius(
  tasks: Array<{ latitude: number; longitude: number }>,
  userLat: number,
  userLon: number,
  radiusKm: number = SURGE_RADIUS_KM
): number {
  return tasks.filter(task => {
    const distance = calculateDistance(
      userLat,
      userLon,
      task.latitude,
      task.longitude
    );
    return distance <= radiusKm;
  }).length;
}

// Check if surge pricing is active
export function isSurgeActive(
  tasks: Array<{ latitude: number; longitude: number }>,
  userLat: number,
  userLon: number
): boolean {
  const count = countTasksInRadius(tasks, userLat, userLon);
  return count > SURGE_THRESHOLD;
}

// Calculate surge multiplier for a specific location
export function getSurgeMultiplier(
  tasks: Array<{ latitude: number; longitude: number }>,
  userLat: number,
  userLon: number
): number {
  const count = countTasksInRadius(tasks, userLat, userLon);
  
  if (count <= SURGE_THRESHOLD) return 1;
  
  // Progressive multiplier based on task density
  if (count > 10) return 2.0; // 2x for very high demand
  if (count > 7) return 1.75; // 1.75x for high demand
  return SURGE_MULTIPLIER; // 1.5x for moderate surge
}

// Calculate reward with surge pricing
export function calculateRewardWithSurge(
  baseReward: number,
  tasks: Array<{ latitude: number; longitude: number }>,
  locationLat: number,
  locationLon: number
): number {
  const multiplier = getSurgeMultiplier(tasks, locationLat, locationLon);
  return Math.round(baseReward * multiplier * 10) / 10; // Round to 1 decimal
}

// Get surge zone color based on intensity
export function getSurgeZoneColor(multiplier: number): string {
  if (multiplier >= 2.0) return 'rgba(220, 38, 38, 0.4)'; // Red - Extreme
  if (multiplier >= 1.75) return 'rgba(234, 88, 12, 0.35)'; // Orange-Red - High
  if (multiplier >= 1.5) return 'rgba(245, 158, 11, 0.3)'; // Orange - Moderate
  return 'rgba(34, 197, 94, 0.2)'; // Green - Normal
}

// Get surge status text
export function getSurgeStatusText(multiplier: number, language: 'en' | 'ru' | 'uz'): string {
  if (multiplier >= 2.0) {
    return language === 'ru' ? '🔴 Экстремальный спрос' : '🔴 Extreme Demand';
  }
  if (multiplier >= 1.75) {
    return language === 'ru' ? '🟠 Высокий спрос' : '🟠 High Demand';
  }
  if (multiplier >= 1.5) {
    return language === 'ru' ? '🟡 Повышенный спрос' : '🟡 Elevated Demand';
  }
  return language === 'ru' ? '🟢 Нормальный спрос' : '🟢 Normal Demand';
}
