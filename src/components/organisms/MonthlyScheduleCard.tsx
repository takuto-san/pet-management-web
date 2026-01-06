import { DashboardCard } from "@/components/molecules/DashboardCard";
import type { MonthlyEvent } from "@/types/dashboard";

interface MonthlyScheduleCardProps {
  events: MonthlyEvent[];
}

export function MonthlyScheduleCard({ events }: MonthlyScheduleCardProps) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const currentDate = today.getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const hasEvent = (day: number | null) => {
    if (!day) return false;
    return events.some(event => event.date === day);
  };

  return (
    <DashboardCard title={`${year}年${month + 1}月のスケジュール`}>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
          <div key={day} className="text-xs font-bold text-gray-600 py-1">
            {day}
          </div>
        ))}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`
              text-xs py-2 rounded
              ${day === null ? "" : "border"}
              ${day === currentDate ? "bg-blue-100 border-blue-500 font-bold" : "border-gray-200"}
              ${hasEvent(day) ? "bg-yellow-50" : ""}
            `}
          >
            {day}
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-1">
        {events.slice(0, 3).map((event, index) => (
          <div key={index} className="text-xs text-gray-600 flex items-center">
            <span className="w-6">{event.date}日:</span>
            <span className="flex-1">{event.title}</span>
          </div>
        ))}
        {events.length > 3 && (
          <p className="text-xs text-gray-500">他 {events.length - 3} 件...</p>
        )}
      </div>
    </DashboardCard>
  );
}
