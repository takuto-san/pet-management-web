import type { Metadata } from "next";
import { TopLayoutWrapper } from "@/components/layouts/top/TopLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "PetManagemnt | ペット管理サイト",
  description: "ペット管理ができるサイト",
};

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <TopLayoutWrapper>{children}</TopLayoutWrapper>;
}