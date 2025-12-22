import { useState } from "react";
import { IconButton, InputAdornment } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Input } from "@/components/atoms/Input";

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  helperText?: string;
  disabled?: boolean;
}

export const PasswordInput = ({
  label,
  value,
  onChange,
  error,
  required,
  helperText,
  disabled,
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <Input
      fullWidth
      label={label}
      type={showPassword ? "text" : "password"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      required={required}
      helperText={helperText}
      disabled={disabled}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};
