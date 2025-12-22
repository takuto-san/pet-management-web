import { TextField, TextFieldProps } from "@mui/material";

interface CustomInputProps extends Omit<TextFieldProps, 'error'> {
  error?: string;
  id?: string;
}

export const Input = ({ error, ...props }: CustomInputProps) => {
  return (
    <TextField
      {...props}
      error={!!error}
      helperText={error || props.helperText}
      sx={{ mb: 3, ...props.sx }}
      variant="outlined"
    />
  );
};
