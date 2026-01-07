import { ReactNode } from "react";
import { Calendar, Clock, TrendingUp, Heart, Activity, Syringe } from "lucide-react";

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const getIcon = (title: string) => {
  if (title.includes("今日の予定")) return <Clock className="w-5 h-5 text-red-800" />;
  if (title.includes("スケジュール")) return <Calendar className="w-5 h-5 text-red-800" />;
  if (title.includes("体重")) return <TrendingUp className="w-5 h-5 text-red-800" />;
  if (title.includes("診察")) return <Heart className="w-5 h-5 text-red-800" />;
  if (title.includes("ワクチン")) return <Syringe className="w-5 h-5 text-red-800" />;
  if (title.includes("プロフィール") || title.includes("ペット情報")) return <Activity className="w-5 h-5 text-red-800" />;
  return null;
};

export function DashboardCard({ title, children, className = "" }: DashboardCardProps) {
  const icon = getIcon(title);

  return (
    <div className={`bg-[rgba(255,255,255,0.05)] rounded-lg border border-[rgba(255,255,255,0.1)] p-6 ${className}`} style={{ backdropFilter: 'blur(10px)' }}>
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}
