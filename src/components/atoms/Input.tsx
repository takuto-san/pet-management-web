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
      sx={{
        mb: 3,
        '& input:-webkit-autofill': {
          WebkitBoxShadow: '0 0 0 1000px #2D2631 inset',
          WebkitTextFillColor: 'white',
          transition: 'background-color 0s',
          backgroundColor: '#2D2631 !important',
        },
        ...props.sx
      }}
      variant="outlined"
    />
  );
};
