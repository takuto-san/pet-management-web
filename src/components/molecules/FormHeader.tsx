import { Avatar, Typography, Box } from "@mui/material";
import PetsIcon from "@mui/icons-material/Pets";

interface FormHeaderProps {
  title: string;
  subtitle?: string;
}

export const FormHeader = ({ title, subtitle }: FormHeaderProps) => {
  return (
    <Box sx={{ textAlign: "center", mb: 4 }}>
      <Avatar
        sx={{
          width: 80,
          height: 80,
          bgcolor: "primary.main",
          mx: "auto",
          mb: 3,
          boxShadow: 3,
        }}
      >
        <PetsIcon sx={{ fontSize: 40 }} />
      </Avatar>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold" }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body1" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};
