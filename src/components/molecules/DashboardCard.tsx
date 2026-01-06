import { ReactNode } from "react";
import { Calendar, Clock, TrendingUp, Heart, Activity, Syringe } from "lucide-react";

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const getIcon = (title: string) => {
  if (title.includes("今日の予定")) return <Clock className="w-5 h-5 text-blue-500" />;
  if (title.includes("スケジュール")) return <Calendar className="w-5 h-5 text-green-500" />;
  if (title.includes("体重")) return <TrendingUp className="w-5 h-5 text-purple-500" />;
  if (title.includes("診察")) return <Heart className="w-5 h-5 text-red-500" />;
  if (title.includes("ワクチン")) return <Syringe className="w-5 h-5 text-orange-500" />;
  if (title.includes("プロフィール")) return <Activity className="w-5 h-5 text-indigo-500" />;
  return null;
};

export function DashboardCard({ title, children, className = "" }: DashboardCardProps) {
  const icon = getIcon(title);

  return (
    <div className={`bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-700 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}
