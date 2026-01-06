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
      <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
        {text}{" "}
        <Link
          href={href}
          style={{
            color: "white",
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
