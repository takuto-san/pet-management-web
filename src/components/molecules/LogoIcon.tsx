import { Box, Typography } from "@mui/material";
import AcUnitIcon from "@mui/icons-material/AcUnit";

export const LogoIcon = () => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <AcUnitIcon sx={{ color: '#A21D32', fontSize: 28 }} />
      <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
        PetManagement
      </Typography>
    </Box>
  );
};
