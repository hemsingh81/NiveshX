// src/utils/theme.ts
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  components: {
    // Applies to all TextField roots when highlightLeft={true}
    MuiTextField: {
      styleOverrides: {
        // use a loose any for props to avoid touching MUI's types
        root: (props: any) => {
          const { ownerState, theme } = props;
          return {
            ...(ownerState?.highlightLeft && {
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
          };
        },
      },
    },

    // Also handle direct OutlinedInput usage (including select under the hood)
    MuiOutlinedInput: {
      styleOverrides: {
        root: (props: any) => {
          const { ownerState, theme } = props;
          return {
            ...(ownerState?.highlightLeft && {
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
          };
        },
      },
    },
  },
});

export default theme;
