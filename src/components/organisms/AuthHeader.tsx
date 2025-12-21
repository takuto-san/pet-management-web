'use client';

import Link from "next/link";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
} from "@mui/material";
import PetsIcon from "@mui/icons-material/Pets";

export default function AuthHeader() {
  return (
    <AppBar position="static" sx={{ mb: 2 }}>
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="home">
          <Link href="/">
            <PetsIcon />
          </Link>
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          ペット管理システム
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
