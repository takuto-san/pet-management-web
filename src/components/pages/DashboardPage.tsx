"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/organisms/Header";
import { LayoutTemplate } from "@/components/templates/LayoutTemplate";

export function DashboardPage() {
  const params = useParams();
  const username = params.username as string;

  return (
    <LayoutTemplate
      header={<Header />}
      main={
        <div className="p-4">
          <h1 className="text-2xl font-bold">{username} さんのダッシュボード</h1>
          <p>ここにユーザー専用の情報を表示します。</p>
        </div>
      }
    />
  );
}
