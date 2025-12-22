import Link from "next/link";
import { IconButton } from "@mui/material";
import PetsIcon from "@mui/icons-material/Pets";

export const LogoIcon = () => {
  return (
    <IconButton edge="start" color="inherit" aria-label="home">
      <Link href="/">
        <PetsIcon />
      </Link>
    </IconButton>
  );
};
