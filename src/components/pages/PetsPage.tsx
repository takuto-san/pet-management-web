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
          <h1 className="text-xl font-bold">統計</h1>
          <p className="text-gray-600 mt-2">ここに統計グラフを表示します。</p>
        </div>
      }
    />
  );
}
