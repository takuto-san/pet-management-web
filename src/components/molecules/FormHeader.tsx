import { Typography, Box } from "@mui/material";
import AcUnitIcon from "@mui/icons-material/AcUnit";

interface FormHeaderProps {
  title: string;
  subtitle?: string;
}

export const FormHeader = ({ title, subtitle }: FormHeaderProps) => {
  return (
    <Box sx={{ textAlign: "center", mb: 4 }}>
      <AcUnitIcon sx={{ fontSize: 40, color: '#A21D32', mb: 3 }} />
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold", color: "white" }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};
