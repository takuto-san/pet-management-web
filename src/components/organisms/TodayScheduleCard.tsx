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
        <p className="text-muted-foreground text-center py-2 text-xs">今日の予定はありません</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center space-x-3 p-3 hover:bg-muted rounded-lg border border-border transition-colors duration-200"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleTask?.(task.id)}
                className="w-4 h-4 text-accent bg-card border-border rounded focus:ring-accent focus:ring-2"
              />
              <div className="flex-1">
                <p className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {task.name}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
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
