"use client";

import { Header } from "@/components/organisms/Header";
import { Footer } from "@/components/organisms/Footer";
import { LayoutTemplate } from "@/components/templates/LayoutTemplate";

export function PetsPage() {
  return (
    <LayoutTemplate
      header={<Header />}
      footer={<Footer />}
      main={
        <div className="p-4">
          <h1 className="text-xl font-bold">ペット一覧</h1>
          <p className="text-gray-600 mt-2">ここにペット一覧を表示します。</p>
        </div>
      }
    />
  );
}
