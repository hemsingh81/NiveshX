import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Divider,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { CustomButton } from "../../../controls";
import {
  CreateSectorRequest,
  UpdateSectorRequest,
  SectorResponse,
} from "../../../services/sectorService";
import { mapServerErrorsToFieldErrors } from "../../../utils/validationMapper";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSectorRequest | UpdateSectorRequest) => Promise<void>;
  mode: "add" | "edit";
  sector?: SectorResponse;
}

interface FormModel {
  name: string;
  description?: string;
  isActive: boolean;
}

const defaultModel = (): FormModel => ({
  name: "",
  description: "",
  isActive: true,
});

const SectorFormDialog: React.FC<Props> = ({ open, onClose, onSubmit, mode, sector }) => {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormModel>(defaultModel());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!open) {
      setForm((prev) => ({ ...defaultModel(), isActive: prev.isActive }));
      setFieldErrors({});
      setSubmitting(false);
      return;
    }

    if (mode === "edit" && sector) {
      setForm({
        name: sector.name,
        description: sector.description ?? "",
        isActive: sector.isActive,
      });
    } else {
      setForm(defaultModel());
    }

    setFieldErrors({});
  }, [open, mode, sector]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const focusFirstError = (mapped: Record<string, string[]>) => {
    const firstField = Object.keys(mapped)[0];
    if (!firstField || firstField === "__global") return;
    inputRefs.current[firstField]?.focus?.();
  };

  const handleSubmit = async () => {
    setFieldErrors({});
    try {
      setSubmitting(true);
      if (mode === "add") {
        const payload: CreateSectorRequest = { name: form.name, description: form.description || undefined };
        await onSubmit(payload);
      } else {
        const payload: UpdateSectorRequest = { name: form.name, description: form.description || undefined, isActive: form.isActive };
        if (!sector) throw new Error("Missing sector id");
        await onSubmit(payload);
      }
      onClose();
    } catch (err: any) {
      const mapped = mapServerErrorsToFieldErrors(err);
      setFieldErrors(mapped);
      focusFirstError(mapped);
    } finally {
      setSubmitting(false);
    }
  };

  const renderHelper = (key: string) => {
    const arr = fieldErrors[key];
    if (!arr || arr.length === 0) return undefined;
    return (
      <ul style={{ margin: 0, paddingLeft: 16 }}>
        {arr.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={(e, reason) => {
        if (submitting && (reason === "backdropClick" || reason === "escapeKeyDown")) return;
        onClose();
      }}
      fullWidth
      maxWidth="sm"
      aria-labelledby="sector-form-dialog-title"
    >
      <DialogTitle id="sector-form-dialog-title" sx={{ pb: 1, px: 3, backgroundColor: (t) => t.palette.grey[100] }}>
        {mode === "add" ? "Add Sector" : "Edit Sector"}
      </DialogTitle>

      <Divider sx={{ borderColor: "divider", my: 0 }} />

      {fieldErrors["__global"] && fieldErrors["__global"].length > 0 && (
        <Box role="status" aria-live="polite" color="error.main" mb={2} px={3}>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {fieldErrors["__global"].map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </Box>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <DialogContent>
          <Box display="flex" gap={2}>
            <TextField
              autoFocus
              fullWidth
              margin="normal"
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={submitting}
              error={!!fieldErrors.name}
              helperText={renderHelper("name")}
              inputRef={(el) => (inputRefs.current["name"] = el)}
            />
          </Box>

          <Box display="flex" gap={2} mt={2}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              disabled={submitting}
              error={!!fieldErrors.description}
              helperText={renderHelper("description")}
              inputRef={(el) => (inputRefs.current["description"] = el)}
            />
          </Box>

          {mode === "edit" && (
            <Box mt={2}>
              <FormControlLabel
                control={<Checkbox checked={form.isActive} onChange={handleChange} name="isActive" disabled={submitting} />}
                label="Is Active"
              />
            </Box>
          )}
        </DialogContent>

        <Divider sx={{ borderColor: "divider" }} />

        <DialogActions sx={{ p: 2, px: 3, backgroundColor: (t) => t.palette.grey[50] }}>
          <CustomButton loading={false} label="Cancel" type="button" color="gray" onClick={onClose} className="mr-2" />
          <CustomButton
            loading={submitting}
            label={mode === "add" ? "Create" : "Update"}
            loadingLabel={mode === "add" ? "Creating..." : "Updating..."}
            type="submit"
            color="blue"
          />
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SectorFormDialog;
