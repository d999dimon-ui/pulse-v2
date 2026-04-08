"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Task } from '@/types/task';

const MapComponentDynamic = dynamic(
  () => import('@/components/MapComponent'),
  { ssr: false, loading: () => <div className="w-full h-full bg-dark-bg flex items-center justify-center text-gray-400">Loading map...</div> }
);

interface LiveTaskMapProps {
  userPosition: [number, number];
  selectedCategory?: string;
  tasks: Task[];
}

export default function LiveTaskMap({ userPosition, selectedCategory, tasks }: LiveTaskMapProps) {
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);

  useEffect(() => {
    if (selectedCategory) {
      setFilteredTasks(tasks.filter(task => task.category === selectedCategory));
    } else {
      setFilteredTasks(tasks);
    }
  }, [tasks, selectedCategory]);

  return (
    <div className="w-full h-full">
      <MapComponentDynamic
        userPosition={userPosition}
        tasks={filteredTasks}
      />
    </div>
  );
}
