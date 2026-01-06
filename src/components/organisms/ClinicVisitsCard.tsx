import type { Visit } from "@/types/api";
import { DashboardCard } from "@/components/molecules/DashboardCard";

interface ClinicVisitsCardProps {
  visits: Visit[];
}

export function ClinicVisitsCard({ visits }: ClinicVisitsCardProps) {
  const sortedVisits = [...visits]
    .sort((a, b) => new Date(b.visitedOn).getTime() - new Date(a.visitedOn).getTime())
    .slice(0, 5);

  return (
    <DashboardCard title="診療履歴">
      {sortedVisits.length === 0 ? (
        <p className="text-gray-500 text-center py-8">診療履歴がありません</p>
      ) : (
        <div className="space-y-3">
          {sortedVisits.map((visit) => {
            const date = new Date(visit.visitedOn);
            return (
              <div key={visit.id} className="border-l-4 border-blue-500 pl-3 py-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold">
                    {date.getFullYear()}/{date.getMonth() + 1}/{date.getDate()}
                  </p>
                  {visit.visitType && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {visit.visitType}
                    </span>
                  )}
                </div>
                {visit.diagnosis && (
                  <p className="text-sm text-gray-700 mb-1">
                    <span className="font-semibold">診断:</span> {visit.diagnosis}
                  </p>
                )}
                {visit.treatment && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">処置:</span> {visit.treatment}
                  </p>
                )}
                {visit.reason && (
                  <p className="text-xs text-gray-500 mt-1">
                    理由: {visit.reason}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardCard>
  );
}
