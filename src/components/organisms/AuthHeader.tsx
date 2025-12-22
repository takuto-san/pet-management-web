'use client';

import { AppBar, Toolbar } from "@mui/material";
import { LogoIcon } from "@/components/molecules/LogoIcon";

export default function AuthHeader() {
  return (
    <AppBar position="static" sx={{ mb: 2 }}>
      <Toolbar>
        <LogoIcon />
      </Toolbar>
    </AppBar>
  );
}
