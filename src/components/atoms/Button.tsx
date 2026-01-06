import { Button as MuiButton, ButtonProps } from "@mui/material";

interface CustomButtonProps extends ButtonProps {
  // Add custom props if needed
}

export const Button = (props: CustomButtonProps) => {
  return (
    <MuiButton
      {...props}
      variant="contained"
      sx={{
        py: 2,
        borderRadius: 2,
        fontSize: "1.1rem",
        backgroundColor: "var(--primary)",
        color: "var(--primary-foreground)",
        boxShadow: 3,
        "&:hover": {
          backgroundColor: "var(--primary)",
          opacity: 0.8,
          boxShadow: 6
        },
        ...props.sx,
      }}
    />
  );
};
