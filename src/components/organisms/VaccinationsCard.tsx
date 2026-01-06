import type { Visit } from "@/types/api";
import { DashboardCard } from "@/components/molecules/DashboardCard";

interface VaccinationsCardProps {
  visits: Visit[];
}

export function VaccinationsCard({ visits }: VaccinationsCardProps) {
  const vaccineVisits = visits
    .filter(visit => visit.visitType === "vaccine")
    .sort((a, b) => new Date(b.visitedOn).getTime() - new Date(a.visitedOn).getTime());

  const upcomingVaccines = visits
    .filter(visit => visit.nextDueOn && visit.visitType === "vaccine")
    .filter(visit => new Date(visit.nextDueOn!) > new Date())
    .sort((a, b) => new Date(a.nextDueOn!).getTime() - new Date(b.nextDueOn!).getTime());

  const completedCount = vaccineVisits.length;

  return (
    <DashboardCard title="ワクチン接種記録">
      <div className="mb-4 p-3 bg-green-50 rounded">
        <p className="text-sm">
          接種済み: <span className="font-bold text-green-700">{completedCount}</span>
        </p>
        {upcomingVaccines.length > 0 && (
          <p className="text-xs text-gray-600 mt-1">
            次回予定: {upcomingVaccines.length}件
          </p>
        )}
      </div>
      {vaccineVisits.length === 0 && upcomingVaccines.length === 0 ? (
        <p className="text-gray-500 text-center py-8">ワクチン情報がありません</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {vaccineVisits.slice(0, 5).map((visit) => (
            <div
              key={visit.id}
              className="p-3 rounded border-2 border-green-500 bg-green-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <p className="text-sm font-semibold">
                    {visit.diagnosis || "ワクチン接種"}
                  </p>
                </div>
                <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                  接種済
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                接種日: {new Date(visit.visitedOn).toLocaleDateString()}
              </p>
              {visit.note && (
                <p className="text-xs text-gray-600 mt-1">{visit.note}</p>
              )}
              {visit.nextDueOn && (
                <p className="text-xs text-blue-600 mt-1">
                  次回予定: {new Date(visit.nextDueOn).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
          {upcomingVaccines.map((visit) => (
            <div
              key={visit.id}
              className="p-3 rounded border-2 border-gray-200 bg-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">○</span>
                  <p className="text-sm font-semibold">
                    {visit.diagnosis || "ワクチン接種予定"}
                  </p>
                </div>
                <span className="text-xs bg-gray-400 text-white px-2 py-1 rounded">
                  予定
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                予定日: {new Date(visit.nextDueOn!).toLocaleDateString()}
              </p>
              {visit.note && (
                <p className="text-xs text-gray-600 mt-1">{visit.note}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
