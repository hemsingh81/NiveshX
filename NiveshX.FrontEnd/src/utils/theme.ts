// src/utils/theme.ts
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  components: {
    // Applies to all TextField roots when required={true}
    MuiTextField: {
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          ...(ownerState.required && {
            "& .MuiOutlinedInput-root": {
              borderLeft: `3px solid ${theme.palette.error.main}`,
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              "&:hover": {
                borderLeftColor: theme.palette.error.dark,
              },
              "&.Mui-focused": {
                borderLeftColor: theme.palette.error.dark,
              },
            },
          }),
        }),
      },
    },

    // Also handle direct OutlinedInput usage (including select under the hood)
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          ...(ownerState.required && {
            borderLeft: `3px solid ${theme.palette.error.main}`,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            "&:hover": {
              borderLeftColor: theme.palette.error.dark,
            },
            "&.Mui-focused": {
              borderLeftColor: theme.palette.error.dark,
            },
          }),
        }),
      },
    },
  },
});
