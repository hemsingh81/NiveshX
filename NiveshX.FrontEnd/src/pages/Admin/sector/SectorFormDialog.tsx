import React, { useEffect, useState } from "react";
import { Box, DialogContent, FormControlLabel, Checkbox } from "@mui/material";
import FormDialogWrapper from "../../../controls/FormDialogWrapper";
import FormField from "../../../controls/FormField";
import useServerErrors from "../../../hooks/useServerErrors";
import {
  CreateSectorRequest,
  UpdateSectorRequest,
  SectorResponse,
} from "../../../services";

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

  const { fieldErrors, handleServerError, clearErrors, bindRef } = useServerErrors();

  useEffect(() => {
    if (!open) {
      setForm((prev) => ({ ...defaultModel(), isActive: prev.isActive }));
      clearErrors();
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

    clearErrors();
  }, [open, mode, sector, clearErrors]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async () => {
    clearErrors();
    try {
      setSubmitting(true);
      if (mode === "add") {
        const payload: CreateSectorRequest = {
          name: form.name,
          description: form.description || undefined,
        };
        await onSubmit(payload);
      } else {
        const payload: UpdateSectorRequest = {
          name: form.name,
          description: form.description || undefined,
          isActive: form.isActive,
        };
        if (!sector) throw new Error("Missing sector id");
        await onSubmit(payload);
      }
      onClose();
    } catch (err: any) {
      handleServerError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderBody = () => (
    <DialogContent>
      <Box display="flex" gap={0}>
        <FormField
          autoFocus
          fullWidth
          margin="normal"
          label="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          disabled={submitting}
          error={!!fieldErrors.name}
          helper={
            fieldErrors.name ? (
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {fieldErrors.name.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            ) : undefined
          }
          inputRefFn={bindRef("name")}
          highlightLeft
        />
      </Box>

      <Box display="flex" gap={2} mt={2}>
        <FormField
          fullWidth
          multiline
          minRows={3}
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          disabled={submitting}
          error={!!fieldErrors.description}
          helper={
            fieldErrors.description ? (
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {fieldErrors.description.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            ) : undefined
          }
          inputRefFn={bindRef("description")}
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
  );

  return (
    <FormDialogWrapper
      open={open}
      title={mode === "add" ? "Add Sector" : "Edit Sector"}
      submitting={submitting}
      mode={mode}
      onClose={onClose}
      onSubmit={handleSubmit}
      errors={fieldErrors}
      showFieldLevel={false}
      submitLabels={{ add: "Create", edit: "Update" }}
      renderBody={renderBody}
    />
  );
};

export default SectorFormDialog;
