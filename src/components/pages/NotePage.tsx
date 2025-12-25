"use client";

import { Header } from "@/components/organisms/Header";
import { Footer } from "@/components/organisms/Footer";
import { LayoutTemplate } from "@/components/templates/LayoutTemplate";

export function NotePage() {
  return (
    <LayoutTemplate
      header={<Header />}
      footer={<Footer />}
      main={
        <div className="p-4">
          <h1 className="text-xl font-bold">ノート</h1>
          <p className="text-gray-600 mt-2">ここにノートを表示します。</p>
        </div>
      }
    />
  );
}
