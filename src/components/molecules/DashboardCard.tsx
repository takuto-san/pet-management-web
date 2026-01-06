import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function DashboardCard({ title, children, className = "" }: DashboardCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-4 border ${className}`}>
      <h2 className="text-lg font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
}
