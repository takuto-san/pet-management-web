"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/stores/store";
import HomeIcon from "@mui/icons-material/Home";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DescriptionIcon from "@mui/icons-material/Description";
import SettingsIcon from "@mui/icons-material/Settings";

export function Footer() {
  const pathname = usePathname();
  const { currentUser } = useSelector((state: RootState) => ({
    currentUser: state.user.currentUser,
  }));

  if (!currentUser) return null;

  const navigation = [
    { name: "ホーム", href: `/${currentUser.username}`, icon: HomeIcon },
    { name: "カレンダー", href: `/${currentUser.username}/calendar`, icon: CalendarTodayIcon },
    { name: "ノート", href: `/${currentUser.username}/note`, icon: DescriptionIcon },
    { name: "設定", href: `/${currentUser.username}/setting`, icon: SettingsIcon },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <nav className="flex">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className="flex-1">
              <button
                className={`w-full flex flex-col items-center justify-center py-2 px-1 text-xs font-medium transition-colors ${
                  isActive
                    ? "text-foreground bg-primary/20"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/20"
                }`}
              >
                <item.icon className="w-6 h-6 mb-1" />
                {item.name}
              </button>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}
