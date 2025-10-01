import * as React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import TextField from "@mui/material/TextField";

const StandardDatePicker = ({
  value,
  onChange,
  label = "Pick a date",
  format = "dd/MM/yyyy",
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
      <DatePicker
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

export default StandardDatePicker;

