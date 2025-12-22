import { Typography } from "@mui/material";
import PetsIcon from "@mui/icons-material/Pets";

interface LogoProps {
  title?: string;
}

export const Logo = ({ title = "ペット管理システム" }: LogoProps) => {
  return (
    <>
      <PetsIcon sx={{ fontSize: 40 }} />
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        {title}
      </Typography>
    </>
  );
};
