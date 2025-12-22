import { Button as MuiButton, ButtonProps } from "@mui/material";

interface CustomButtonProps extends ButtonProps {
  // Add custom props if needed
}

export const Button = (props: CustomButtonProps) => {
  return (
    <MuiButton
      {...props}
      sx={{
        py: 2,
        borderRadius: 2,
        fontSize: "1.1rem",
        boxShadow: 3,
        "&:hover": { boxShadow: 6 },
        ...props.sx,
      }}
    />
  );
};
