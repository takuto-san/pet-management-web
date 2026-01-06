import { DashboardCard } from "@/components/molecules/DashboardCard";

interface Task {
  id: string;
  name: string;
  time: string;
  completed: boolean;
}

interface TodayScheduleCardProps {
  tasks: Task[];
  onToggleTask?: (id: string) => void;
}

export function TodayScheduleCard({ tasks, onToggleTask }: TodayScheduleCardProps) {
  const today = new Date();
  const formattedDate = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

  return (
    <DashboardCard title={`今日の予定 (${formattedDate})`}>
      {tasks.length === 0 ? (
        <p className="text-gray-500 text-center py-4">今日の予定はありません</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleTask?.(task.id)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <p className={`text-sm ${task.completed ? "line-through text-gray-400" : ""}`}>
                  {task.name}
                </p>
                <p className="text-xs text-gray-500">{task.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
