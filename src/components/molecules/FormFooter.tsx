import Link from "next/link";
import { Typography, Box } from "@mui/material";

interface FormFooterProps {
  text: string;
  linkText: string;
  href: string;
}

export const FormFooter = ({ text, linkText, href }: FormFooterProps) => {
  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography variant="body2" color="text.secondary">
        {text}{" "}
        <Link
          href={href}
          style={{
            color: "#1976d2",
            textDecoration: "none",
            fontWeight: "medium",
          }}
        >
          {linkText}
        </Link>
      </Typography>
    </Box>
  );
};
