import type { Visit } from "@/types/api";
import { DashboardCard } from "@/components/molecules/DashboardCard";

interface WeightTrendsCardProps {
  visits: Visit[];
}

export function WeightTrendsCard({ visits }: WeightTrendsCardProps) {
  const weightsData = visits
    .filter(v => v.weight !== undefined && v.weight !== null)
    .sort((a, b) => new Date(a.visitedOn).getTime() - new Date(b.visitedOn).getTime())
    .slice(-6);

  const maxWeight = weightsData.length > 0 
    ? Math.max(...weightsData.map(v => v.weight!)) 
    : 10;
  const minWeight = weightsData.length > 0 
    ? Math.min(...weightsData.map(v => v.weight!)) 
    : 0;

  const range = maxWeight - minWeight || 1;

  return (
    <DashboardCard title="体重推移">
      {weightsData.length === 0 ? (
        <p className="text-gray-500 text-center py-8">体重データがありません</p>
      ) : (
        <div>
          <div className="flex items-end justify-between h-40 space-x-2 mb-2">
            {weightsData.map((visit, index) => {
              const height = ((visit.weight! - minWeight) / range) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="text-xs font-bold text-blue-600 mb-1">
                    {visit.weight}kg
                  </div>
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${Math.max(height, 10)}%` }}
                  ></div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-500 border-t pt-2">
            {weightsData.map((visit, index) => {
              const date = new Date(visit.visitedOn);
              return (
                <div key={index} className="flex-1 text-center">
                  {date.getMonth() + 1}/{date.getDate()}
                </div>
              );
            })}
          </div>
          {weightsData.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
              <p className="font-bold">最新: {weightsData[weightsData.length - 1].weight}kg</p>
              <p className="text-gray-600 text-xs mt-1">
                記録日: {new Date(weightsData[weightsData.length - 1].visitedOn).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      )}
    </DashboardCard>
  );
}
