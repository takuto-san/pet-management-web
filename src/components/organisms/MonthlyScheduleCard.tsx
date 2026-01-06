import { DashboardCard } from "@/components/molecules/DashboardCard";
import type { MonthlyEvent } from "@/types/dashboard";
import { Calendar } from "lucide-react";

interface MonthlyScheduleCardProps {
  events: MonthlyEvent[];
}

export function MonthlyScheduleCard({ events }: MonthlyScheduleCardProps) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const upcomingEvents = events
    .map(event => {
      const eventDate = new Date(year, month, event.date);
      const diffTime = eventDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { ...event, daysUntil: diffDays };
    })
    .filter(event => event.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  return (
    <DashboardCard title={`${year}年${month + 1}月のスケジュール`}>
      {upcomingEvents.length === 0 ? (
        <p className="text-gray-400 text-center py-2 text-xs">今月の予定はありません</p>
      ) : (
        <div className="space-y-3">
          {upcomingEvents.slice(0, 5).map((event, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg border border-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white">{event.title}</span>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                event.daysUntil === 0
                  ? 'bg-green-800 text-green-100'
                  : event.daysUntil <= 3
                  ? 'bg-orange-800 text-orange-100'
                  : 'bg-blue-800 text-blue-100'
              }`}>
                {event.daysUntil === 0 ? '今日' : `あと ${event.daysUntil}日`}
              </div>
            </div>
          ))}
          {upcomingEvents.length > 5 && (
            <p className="text-xs text-gray-400 text-center">他 {upcomingEvents.length - 5} 件...</p>
          )}
        </div>
      )}
    </DashboardCard>
  );
}
