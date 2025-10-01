import * as React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import TextField from "@mui/material/TextField";

const StandardDateTimePicker = ({
  value,
  onChange,
  label = "Pick date and time",
  format = "dd/MM/yyyy HH:mm",
  fullWidth = true,
  size = "medium",
  disabled = false,
  error = false,
  helperText = "",
  minDate = null,
  maxDate = null,
  sx = {},
  ...props
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateTimePicker
        label={label}
        value={value}
        onChange={onChange}
        format={format}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        slotProps={{
          textField: { 
            fullWidth,
            size,
            error,
            helperText,
            sx: {
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderWidth: 2,
                },
              },
              ...sx,
            },
            ...props
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default StandardDateTimePicker;

