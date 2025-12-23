"use client";

import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/stores/store";
import HomeIcon from "@mui/icons-material/Home";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PetsIcon from "@mui/icons-material/Pets";
import SettingsIcon from "@mui/icons-material/Settings";

export function Footer() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser } = useSelector((state: RootState) => ({
    currentUser: state.user.currentUser,
  }));

  if (!currentUser) return null;

  const navigation = [
    { name: "ホーム", href: `/${currentUser.username}`, icon: HomeIcon },
    { name: "カレンダー", href: `/${currentUser.username}/calendar`, icon: CalendarTodayIcon },
    { name: "ペット一覧", href: `/${currentUser.username}/pets`, icon: PetsIcon },
    { name: "設定", href: `/${currentUser.username}/setting`, icon: SettingsIcon },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50">
      <nav className="flex">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs font-medium transition-colors ${
                isActive
                  ? "text-blue-400 bg-gray-800"
                  : "text-gray-300 hover:text-blue-400 hover:bg-gray-800"
              }`}
            >
              <item.icon className="w-6 h-6 mb-1" sx={{ color: isActive ? "#60a5fa" : "#d1d5db" }} />
              {item.name}
            </button>
          );
        })}
      </nav>
    </footer>
  );
}
