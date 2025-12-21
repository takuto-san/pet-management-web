"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/organisms/Header";
import { TopTemplate } from "@/components/templates/TopTemplate";

export function UserDetailPage() {
  const params = useParams();
  const username = params.username as string;

  return (
    <TopTemplate
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
