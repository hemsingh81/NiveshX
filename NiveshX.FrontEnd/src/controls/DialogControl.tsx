// src/controls/DialogControl.tsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Box,
} from "@mui/material";

export interface DialogControlProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  onSubmit?: () => void;
  submitting?: boolean;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  titleSx?: any;
  contentSx?: any;
  actionsSx?: any;
  footer?: React.ReactNode;
  preventCloseWhileSubmitting?: boolean;
  ariaLabelledBy?: string;
  children?: React.ReactNode; // <- important: allow children
}

const DialogControl: React.FC<DialogControlProps> = ({
  open,
  title,
  onClose,
  onSubmit,
  submitting = false,
  maxWidth = "sm",
  fullWidth = true,
  titleSx,
  contentSx,
  actionsSx,
  footer,
  preventCloseWhileSubmitting = true,
  ariaLabelledBy = "dialog-title",
  children,
}) => {
  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (
          preventCloseWhileSubmitting &&
          submitting &&
          (reason === "backdropClick" || reason === "escapeKeyDown")
        ) {
          return;
        }
        onClose();
      }}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      aria-labelledby={ariaLabelledBy}
    >
      {title && (
        <>
          <DialogTitle
            id={ariaLabelledBy}
            sx={{
              pb: 1,
              px: 3,
              backgroundColor: (theme) => theme.palette.grey[100],
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              ...titleSx,
            }}
          >
            {title}
          </DialogTitle>
          <Divider sx={{ borderColor: "divider", my: 0 }} />
        </>
      )}

      <DialogContent sx={{ px: 3, py: 2, ...contentSx }}>{children}</DialogContent>

      <Divider sx={{ borderColor: "divider" }} />

      <DialogActions
        sx={{
          p: 2,
          px: 3,
          backgroundColor: (theme) => theme.palette.grey[50],
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          ...actionsSx,
        }}
      >
        {footer ?? (
          <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
            {onSubmit ? (
              <button type="button" onClick={onSubmit} style={{ display: "none" }} aria-hidden />
            ) : null}
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DialogControl;
