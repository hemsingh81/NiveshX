import React, { useEffect, useState } from "react";
import {
  DialogContent,
  Box,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { FormField, FormDialogWrapper } from "../../../controls";
import useServerErrors from "../../../hooks/useServerErrors";
import {
  CreateClassificationTagRequest,
  UpdateClassificationTagRequest,
  ClassificationTagResponse,
} from "../../../services";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateClassificationTagRequest | UpdateClassificationTagRequest
  ) => Promise<void>;
  mode: "add" | "edit";
  tag?: ClassificationTagResponse;
}

interface FormModel {
  name: string;
  category?: string;
  description?: string;
  isActive: boolean;
}

const defaultModel = (): FormModel => ({
  name: "",
  category: "",
  description: "",
  isActive: true,
});

const ClassificationTagFormDialog: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  mode,
  tag,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormModel>(defaultModel());

  const { fieldErrors, handleServerError, clearErrors, bindRef } =
    useServerErrors();

  useEffect(() => {
    if (!open) {
      setForm((prev) => ({ ...defaultModel(), isActive: prev.isActive }));
      clearErrors();
      setSubmitting(false);
      return;
    }

    if (mode === "edit" && tag) {
      setForm({
        name: tag.name,
        category: tag.category ?? "",
        description: tag.description ?? "",
        isActive: tag.isActive,
      });
    } else {
      setForm(defaultModel());
    }

    clearErrors();
  }, [open, mode, tag, clearErrors]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    clearErrors();
    try {
      setSubmitting(true);
      if (mode === "add") {
        const payload: CreateClassificationTagRequest = {
          name: form.name,
          category: form.category || undefined,
          description: form.description || undefined,
        };
        await onSubmit(payload);
      } else {
        const payload: UpdateClassificationTagRequest = {
          name: form.name,
          category: form.category || undefined,
          description: form.description || undefined,
          isActive: form.isActive,
        };
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
      <Box display="flex" gap={2}>
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
        />
      </Box>

      <Box display="flex" gap={2} mt={2}>
        <FormField
          fullWidth
          label="Category"
          name="category"
          value={form.category}
          onChange={handleChange}
          disabled={submitting}
          error={!!fieldErrors.category}
          helper={
            fieldErrors.category ? (
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {fieldErrors.category.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            ) : undefined
          }
          inputRefFn={bindRef("category")}
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
            control={
              <Checkbox
                checked={form.isActive}
                onChange={handleChange}
                name="isActive"
                disabled={submitting}
              />
            }
            label="Is Active"
          />
        </Box>
      )}
    </DialogContent>
  );

  return (
    <FormDialogWrapper
      open={open}
      title={
        mode === "add" ? "Add Classification Tag" : "Edit Classification Tag"
      }
      submitting={submitting}
      mode={mode}
      onClose={onClose}
      onSubmit={handleSubmit}
      errors={fieldErrors}
      showFieldLevel={false}
      renderBody={renderBody}
    />
  );
};

export default ClassificationTagFormDialog;
