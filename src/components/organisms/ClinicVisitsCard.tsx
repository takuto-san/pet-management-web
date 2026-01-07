import type { Visit } from "@/types/api";
import { DashboardCard } from "@/components/molecules/DashboardCard";

// ユーティリティ関数：visitTypeの日本語化
const getVisitTypeDisplayName = (visitType: string | undefined): string => {
  switch (visitType) {
    case "general":
      return "定期検診";
    case "checkup":
      return "通院";
    case "vaccine":
      return "ワクチン";
    case "heartworm":
      return "フィラリア";
    case "flea_tick":
      return "ノミダニ";
    default:
      return visitType || "";
  }
};

// ユーティリティ関数：理由の日本語化と整形
const getReasonDisplayName = (reason: string | undefined): string => {
  if (!reason) return "";

  let display = reason;

  // カテゴリの日本語化
  display = display.replace(/^hospital/, "通院");
  display = display.replace(/^supplies/, "備品");
  display = display.replace(/^general/, "定期検診");

  // undefined の除去（値が存在しない場合の区切り文字も除去）
  display = display.replace(/ - undefined/g, "");
  display = display.replace(/^undefined/, "");
  display = display.replace(/undefined$/, "");
  display = display.replace(/undefined - /g, "");

  // 空の区切り文字の除去
  display = display.replace(/^ - /, "");
  display = display.replace(/ - $/, "");

  return display.trim();
};

// ユーティリティ関数：タイトルの整形
const formatTitle = (reason: string | undefined): string => {
  if (!reason) return "診察";

  const displayReason = getReasonDisplayName(reason);

  // 日本語化された理由をタイトルとして使用
  if (displayReason) {
    return displayReason;
  }

  return "定期検診";
};

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
        <p className="text-muted-foreground text-center py-8">診療履歴がありません</p>
      ) : (
        <div className="space-y-3">
          {sortedVisits.map((visit) => {
            const date = new Date(visit.visitedOn);
            return (
              <div key={visit.id} className="border-l-4 border-red-800 pl-3 py-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-foreground">
                    {date.getFullYear()}/{date.getMonth() + 1}/{date.getDate()}
                  </p>
                  {visit.visitType && (
                    <span className="text-xs bg-red-800 text-white px-2 py-1 rounded">
                      {getVisitTypeDisplayName(visit.visitType)}
                    </span>
                  )}
                </div>
                {visit.diagnosis && (
                  <p className="text-sm text-muted-foreground mb-1">
                    <span className="font-semibold">診断:</span> {visit.diagnosis}
                  </p>
                )}
                {visit.treatment && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">処置:</span> {visit.treatment}
                  </p>
                )}
                {visit.reason && (
                  <p className="text-xs text-muted-foreground mt-1">
                    理由: {formatTitle(visit.reason)}
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
