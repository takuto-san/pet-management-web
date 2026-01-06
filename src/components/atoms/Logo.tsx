import { Typography } from "@mui/material";
import AcUnitIcon from "@mui/icons-material/AcUnit";

interface LogoProps {
  title?: string;
}

export const Logo = ({ title = "ペット管理システム" }: LogoProps) => {
  return (
    <>
      <AcUnitIcon sx={{ fontSize: 40, color: '#C0392B' }} />
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        {title}
      </Typography>
    </>
  );
};
