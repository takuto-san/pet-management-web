"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { PawPrint, Heart, Calendar, ClipboardList } from "lucide-react";
import type { RootState } from "@/lib/stores/store";

export const TopContent = () => {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  return (
    <main className="bg-[#0f0b15] min-h-screen w-full">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
              ペット管理システムへようこそ
            </h1>
            <p className="text-lg lg:text-xl text-gray-300">
              あなたの大切なペットの健康管理をサポートします。
            </p>
            
            {currentUser && (
              <div className="space-y-4">
                <p className="text-gray-400">
                  ログイン済みです。ダッシュボードからペットの管理を始めましょう。
                </p>
                <Link href={`/${currentUser.username}`}>
                  <button className="bg-[#e91e63] hover:bg-[#c2185b] text-white font-semibold px-8 py-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl">
                    ダッシュボードへ
                  </button>
                </Link>
              </div>
            )}
            
            {!currentUser && (
              <div className="space-y-4">
                <p className="text-gray-400">
                  アカウントを作成して、ペットの管理を始めましょう。
                </p>
                <div className="flex gap-4">
                  <Link href="/auth/signup">
                    <button className="bg-[#e91e63] hover:bg-[#c2185b] text-white font-semibold px-8 py-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl">
                      今すぐ始める
                    </button>
                  </Link>
                  <Link href="/auth/signin">
                    <button className="bg-transparent border-2 border-gray-600 hover:border-[#e91e63] text-white font-semibold px-8 py-4 rounded-lg transition-colors duration-200">
                      ログイン
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right: Hero Image Placeholder */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-lg h-96 bg-gradient-to-br from-[#e91e63]/20 to-purple-900/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-gray-700">
              <PawPrint className="w-32 h-32 text-[#e91e63] opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-3xl lg:text-4xl font-bold text-white text-center mb-12">
          機能
        </h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Feature Card 1 */}
          <div className="bg-[#1a161f] hover:bg-[#221c2a] p-8 rounded-xl transition-colors duration-200 border border-gray-800">
            <div className="flex items-start space-x-4">
              <div className="bg-[#e91e63]/10 p-3 rounded-lg">
                <PawPrint className="w-8 h-8 text-[#e91e63]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  ペットの登録と管理
                </h3>
                <p className="text-gray-400">
                  複数のペットを簡単に登録・管理できます
                </p>
              </div>
            </div>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-[#1a161f] hover:bg-[#221c2a] p-8 rounded-xl transition-colors duration-200 border border-gray-800">
            <div className="flex items-start space-x-4">
              <div className="bg-[#e91e63]/10 p-3 rounded-lg">
                <Heart className="w-8 h-8 text-[#e91e63]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  健康記録の追跡
                </h3>
                <p className="text-gray-400">
                  体重、体調、症状などを記録して健康管理
                </p>
              </div>
            </div>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-[#1a161f] hover:bg-[#221c2a] p-8 rounded-xl transition-colors duration-200 border border-gray-800">
            <div className="flex items-start space-x-4">
              <div className="bg-[#e91e63]/10 p-3 rounded-lg">
                <ClipboardList className="w-8 h-8 text-[#e91e63]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  処方箋の管理
                </h3>
                <p className="text-gray-400">
                  薬の情報や投与スケジュールを管理
                </p>
              </div>
            </div>
          </div>

          {/* Feature Card 4 */}
          <div className="bg-[#1a161f] hover:bg-[#221c2a] p-8 rounded-xl transition-colors duration-200 border border-gray-800">
            <div className="flex items-start space-x-4">
              <div className="bg-[#e91e63]/10 p-3 rounded-lg">
                <Calendar className="w-8 h-8 text-[#e91e63]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  訪問履歴の確認
                </h3>
                <p className="text-gray-400">
                  動物病院への訪問記録を一元管理
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-[#0a0810] border-t border-gray-800 py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Pet Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
};
