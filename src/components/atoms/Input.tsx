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
        '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: 'white',
        },
        '& .MuiOutlinedInput-root.Mui-error:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: 'white',
        },
        '& .MuiOutlinedInput-root.Mui-error.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: 'white',
        },
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: 'white',
        },
        '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: 'white',
        },
        '& .MuiInputLabel-root': {
          color: 'white',
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: 'white',
        },
        '& .MuiInputLabel-root.MuiFormLabel-filled': {
          color: 'white',
        },
        ...props.sx
      }}
      variant="outlined"
    />
  );
};
