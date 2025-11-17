import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Box,
} from "@mui/material";
import { CustomButton } from ".";
import ErrorDisplay, { FieldErrors } from "./ErrorDisplay";

type Props = {
  open: boolean;
  title: string;
  submitting: boolean;
  mode: "add" | "edit";
  onClose: () => void;
  onSubmit: () => Promise<void>;
  errors?: FieldErrors;
  showFieldLevel?: boolean;
  submitLabels?: { add?: string; edit?: string };
  renderBody: () => React.ReactNode;
};

const FormDialogWrapper: React.FC<Props> = ({
  open,
  title,
  submitting,
  mode,
  onClose,
  onSubmit,
  errors,
  showFieldLevel = false,
  submitLabels,
  renderBody,
}) => {
  const addLabel = submitLabels?.add ?? "Create";
  const editLabel = submitLabels?.edit ?? "Update";

  return (
    <Dialog
      open={open}
      onClose={(e, reason) => {
        if (submitting && (reason === "backdropClick" || reason === "escapeKeyDown")) return;
        onClose();
      }}
      fullWidth
      maxWidth="sm"
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title" sx={{ pb: 1, px: 3, backgroundColor: (t) => t.palette.grey[100] }}>
        {title}
      </DialogTitle>

      <Divider sx={{ borderColor: "divider", my: 0 }} />

      <Box sx={{ px: 3, py: 2 }}>
        <ErrorDisplay errors={errors ?? {}} showFieldLevel={showFieldLevel} />
      </Box>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await onSubmit();
        }}
      >
        <DialogContent>{renderBody()}</DialogContent>

        <Divider sx={{ borderColor: "divider" }} />

        <DialogActions sx={{ p: 2, px: 3, backgroundColor: (t) => t.palette.grey[50] }}>
          <CustomButton loading={false} label="Cancel" type="button" color="gray" onClick={onClose} />
          <CustomButton
            loading={submitting}
            label={mode === "add" ? addLabel : editLabel}
            loadingLabel={mode === "add" ? `${addLabel}...` : `${editLabel}...`}
            type="submit"
            color="blue"
          />
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default FormDialogWrapper;
