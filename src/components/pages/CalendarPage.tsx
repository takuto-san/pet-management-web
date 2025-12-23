"use client";

import { Header } from "@/components/organisms/Header";
import { Footer } from "@/components/organisms/Footer";
import { LayoutTemplate } from "@/components/templates/LayoutTemplate";

export function CalendarPage() {
  return (
    <LayoutTemplate
      header={<Header />}
      footer={<Footer />}
      main={
        <div className="p-4">
          <h1 className="text-xl font-bold">カレンダー</h1>
          <p className="text-gray-600 mt-2">ここにカレンダーを表示します。</p>
        </div>
      }
    />
  );
}
