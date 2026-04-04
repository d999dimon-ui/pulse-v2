// High Demand Heatmap Calculation
// Shows zones with many orders on the map

export interface HeatZone {
  center: [number, number];
  radius: number; // km
  orderCount: number;
  intensity: 'low' | 'medium' | 'high' | 'critical';
  color: string;
}

export function calculateHeatZones(
  tasks: Array<{ latitude: number; longitude: number }>,
  userPosition: [number, number]
): HeatZone[] {
  if (tasks.length === 0) return [];

  // Group tasks into 1km grid cells
  const grid: Record<string, number> = {};
  const GRID_SIZE = 0.01; // ~1km

  tasks.forEach(task => {
    const key = `${Math.round(task.latitude / GRID_SIZE)},${Math.round(task.longitude / GRID_SIZE)}`;
    grid[key] = (grid[key] || 0) + 1;
  });

  // Find high-demand zones (3+ orders in a cell)
  const zones: HeatZone[] = [];
  for (const [key, count] of Object.entries(grid)) {
    if (count < 2) continue;

    const [latStr, lngStr] = key.split(',');
    const center: [number, number] = [
      parseFloat(latStr) * GRID_SIZE,
      parseFloat(lngStr) * GRID_SIZE,
    ];

    let intensity: HeatZone['intensity'] = 'low';
    let color = 'rgba(34, 197, 94, 0.3)'; // Green

    if (count >= 10) {
      intensity = 'critical';
      color = 'rgba(220, 38, 38, 0.5)'; // Red
    } else if (count >= 6) {
      intensity = 'high';
      color = 'rgba(245, 158, 11, 0.4)'; // Orange
    } else if (count >= 3) {
      intensity = 'medium';
      color = 'rgba(234, 179, 8, 0.35)'; // Yellow
    }

    zones.push({
      center,
      radius: 1,
      orderCount: count,
      intensity,
      color,
    });
  }

  return zones.sort((a, b) => b.orderCount - a.orderCount);
}

export function getHeatIntensityText(intensity: string, lang: 'en' | 'ru'): string {
  const texts = {
    ru: {
      low: '🟢 Низкий спрос',
      medium: '🟡 Средний спрос',
      high: '🟠 Высокий спрос',
      critical: '🔴 Критический спрос',
    },
    en: {
      low: '🟢 Low demand',
      medium: '🟡 Medium demand',
      high: '🟠 High demand',
      critical: '🔴 Critical demand',
    },
  };
  return (texts[lang] as any)[intensity] || '';
}
