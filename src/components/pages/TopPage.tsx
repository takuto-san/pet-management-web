"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { LayoutTemplate } from "@/components/templates/LayoutTemplate";
import { Header } from "@/components/organisms/Header";
import { TopContent } from "@/components/organisms/TopContent";
import type { RootState } from "@/lib/stores/store";

export function TopPage() {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      if (currentUser.username && currentUser.firstName && currentUser.lastName) {
        router.push(`/${currentUser.username}`);
      } else {
        router.push("/onboarding");
      }
    }
  }, [currentUser, router]);

  return (
    <LayoutTemplate
      header={<Header />}
      main={<TopContent />}
    />
  );
}
