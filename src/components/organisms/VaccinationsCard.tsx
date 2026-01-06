import type { UserItem, Item } from "@/types/api";
import { DashboardCard } from "@/components/molecules/DashboardCard";

interface VaccinationsCardProps {
  userItems: UserItem[];
  items: Item[];
}

export function VaccinationsCard({ userItems, items }: VaccinationsCardProps) {
  const vaccineItems = items.filter(item => 
    item.category === "VACCINE" || item.category === "VACCINATION"
  );

  const vaccineRecords = vaccineItems.map(vaccine => {
    const userItem = userItems.find(ui => ui.itemId === vaccine.id);
    return {
      id: vaccine.id,
      name: vaccine.name,
      completed: !!userItem,
      recordedAt: userItem?.recordedAt,
      note: userItem?.note || vaccine.note,
    };
  });

  const completedCount = vaccineRecords.filter(v => v.completed).length;

  return (
    <DashboardCard title="ワクチン接種記録">
      <div className="mb-4 p-3 bg-green-50 rounded">
        <p className="text-sm">
          接種済み: <span className="font-bold text-green-700">{completedCount}</span> / {vaccineRecords.length}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all"
            style={{ width: `${vaccineRecords.length > 0 ? (completedCount / vaccineRecords.length) * 100 : 0}%` }}
          ></div>
        </div>
      </div>
      {vaccineRecords.length === 0 ? (
        <p className="text-gray-500 text-center py-8">ワクチン情報がありません</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {vaccineRecords.map((vaccine) => (
            <div
              key={vaccine.id}
              className={`p-3 rounded border-2 ${
                vaccine.completed
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {vaccine.completed ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span className="text-gray-400">○</span>
                  )}
                  <p className="text-sm font-semibold">{vaccine.name}</p>
                </div>
                {vaccine.completed && (
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                    接種済
                  </span>
                )}
              </div>
              {vaccine.recordedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  接種日: {new Date(vaccine.recordedAt).toLocaleDateString()}
                </p>
              )}
              {vaccine.note && (
                <p className="text-xs text-gray-600 mt-1">{vaccine.note}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
