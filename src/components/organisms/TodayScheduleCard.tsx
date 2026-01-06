import { DashboardCard } from "@/components/molecules/DashboardCard";
import type { Task } from "@/types/dashboard";
import { Clock } from "lucide-react";

interface TodayScheduleCardProps {
  tasks: Task[];
  onToggleTask?: (id: string) => void;
}

export function TodayScheduleCard({ tasks, onToggleTask }: TodayScheduleCardProps) {
  const today = new Date();
  const formattedDate = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

  return (
    <DashboardCard title={`今日の予定 (${formattedDate})`} className="text-sm p-3">
      {tasks.length === 0 ? (
        <p className="text-gray-400 text-center py-2 text-xs">今日の予定はありません</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center space-x-3 p-3 hover:bg-gray-700 rounded-lg border border-gray-600 transition-colors duration-200"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggleTask?.(task.id)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-500 rounded focus:ring-blue-500 focus:ring-2"
                />
                {task.completed && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${task.completed ? "line-through text-gray-500" : "text-white"}`}>
                  {task.name}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {task.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
