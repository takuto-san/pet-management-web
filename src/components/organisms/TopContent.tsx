"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { Button } from "@mui/material";
import type { RootState } from "@/lib/stores/store";

export const TopContent = () => {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  return (
    <main style={{ padding: "2rem" }}>
      <h1>ペット管理システムへようこそ</h1>
      <p>あなたの大切なペットの健康管理をサポートします。</p>
      <section>
        <h2>機能</h2>
        <ul>
          <li>ペットの登録と管理</li>
          <li>健康記録の追跡</li>
          <li>処方箋の管理</li>
          <li>訪問履歴の確認</li>
        </ul>
      </section>
      {currentUser ? (
        <section>
          <h2>ダッシュボードへ</h2>
          <p>ログイン済みです。ダッシュボードからペットの管理を始めましょう。</p>
          <Link href={`/${currentUser.username}`}>
            <Button variant="contained">ダッシュボードへ</Button>
          </Link>
        </section>
      ) : (
        <section>
          <h2>今すぐ始める</h2>
          <p>アカウントを作成して、ペットの管理を始めましょう。</p>
        </section>
      )}
    </main>
  );
};
