"use client";

import { useSelector } from "react-redux";
import { Box, CircularProgress } from "@mui/material";
import { LayoutTemplate } from "@/components/templates/LayoutTemplate";
import { Header } from "@/components/organisms/Header";
import { TopContent } from "@/components/organisms/TopContent";
import type { RootState } from "@/lib/stores/store";

export function TopPage() {
  const { currentUser, isLoadingUser } = useSelector((state: RootState) => ({
    currentUser: state.user.currentUser,
    isLoadingUser: state.user.isLoadingUser,
  }));

  const isPageLoading = !currentUser || isLoadingUser;

  if (isPageLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LayoutTemplate
      header={<Header />}
      main={<TopContent />}
    />
  );
}
