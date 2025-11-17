// src/controls/ErrorDisplay.tsx
import React from "react";
import {
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  Box,
  Typography,
} from "@mui/material";
import { humanizeFieldKey } from "../utils/stringUtils";

export type FieldErrors = Record<string, string[]>;

type Props = {
  errors?: FieldErrors | null;
  showFieldLevel?: boolean;
  sx?: any;
};

const ErrorDisplay: React.FC<Props> = ({ errors, showFieldLevel = true, sx }) => {
  if (!errors || Object.keys(errors).length === 0) return null;

  const global = errors["__global"] ?? [];
  const fieldKeys = Object.keys(errors).filter((k) => k && k !== "__global");

  return (
    <Box role="status" aria-live="polite" sx={sx}>
      {global.length > 0 && (
        <Alert
          severity="error"
          sx={{
            mb: fieldKeys.length ? 2 : 0,
            px: 2,
            py: 1,
            borderRadius: 1.5,
            boxShadow: 1,
          }}
        >
          <AlertTitle sx={{ fontWeight: 700 }}>Error</AlertTitle>
          <List dense disablePadding>
            {global.map((m, i) => (
              <ListItem key={i} sx={{ display: "list-item", pl: 0 }}>
                <ListItemText
                  primary={m}
                  primaryTypographyProps={{ variant: "body2", color: "error.dark" }}
                />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      {showFieldLevel &&
        fieldKeys.map((key) => (
          <Box key={key} mb={1}>
            <Typography
              component="div"
              variant="body2"
              sx={{ fontWeight: 600, mb: 0.5 }}
            >
              {humanizeFieldKey(key)}
            </Typography>
            <List dense disablePadding>
              {(errors[key] ?? []).map((m, i) => (
                <ListItem key={i} sx={{ display: "list-item", pl: 0 }}>
                  <ListItemText
                    primary={m}
                    primaryTypographyProps={{ variant: "body2", color: "error.main" }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
    </Box>
  );
};

export default ErrorDisplay;
