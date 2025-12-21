import type { Metadata } from "next";
import { geistSans, geistMono } from "@/utils/font";
import { QueryProvider } from "@/lib/stores/QueryProvider";
import { StoreProvider } from "@/lib/stores/StoreProvider";
import { AuthProvider } from "@/lib/stores/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "PetManagemnt | ペット管理サイト",
  description: "ペット管理ができるサイト",
};

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <QueryProvider>
          <StoreProvider>
            <AuthProvider>{children}</AuthProvider>
          </StoreProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
