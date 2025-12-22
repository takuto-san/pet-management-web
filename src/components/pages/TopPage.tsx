"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { Box, CircularProgress, Backdrop } from "@mui/material";
import { LayoutTemplate } from "@/components/templates/LayoutTemplate";
import { Header } from "@/components/organisms/Header";
import { TopContent } from "@/components/organisms/TopContent";
import type { RootState } from "@/lib/stores/store";

export function TopPage() {
  const { currentUser, isLoadingUser } = useSelector((state: RootState) => ({
    currentUser: state.user.currentUser,
    isLoadingUser: state.user.isLoadingUser,
  }));
  const [isNavigating, setIsNavigating] = useState(false);

  if (isLoadingUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <LayoutTemplate
        header={<Header onNavigate={() => setIsNavigating(true)} />}
        main={<TopContent />}
      />
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isNavigating}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}
