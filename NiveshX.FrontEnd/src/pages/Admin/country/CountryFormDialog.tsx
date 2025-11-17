import React, { useEffect, useState } from "react";
import { Box, DialogContent, FormControlLabel, Checkbox } from "@mui/material";
import FormDialogWrapper from "../../../controls/FormDialogWrapper";
import FormField from "../../../controls/FormField";
import useServerErrors from "../../../hooks/useServerErrors";
import { CustomButton } from "../../../controls"; // kept for compatibility if needed by other imports
import {
  CreateCountryRequest,
  UpdateCountryRequest,
  CountryResponse,
} from "../../../services";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCountryRequest | UpdateCountryRequest) => Promise<void>;
  mode: "add" | "edit";
  country?: CountryResponse;
}

interface FormModel {
  name: string;
  code: string;
  isActive: boolean;
}

const defaultModel = (): FormModel => ({
  name: "",
  code: "",
  isActive: true,
});

const CountryFormDialog: React.FC<Props> = ({ open, onClose, onSubmit, mode, country }) => {
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

    if (mode === "edit" && country) {
      setForm({
        name: country.name,
        code: country.code,
        isActive: country.isActive,
      });
    } else {
      setForm(defaultModel());
    }

    clearErrors();
  }, [open, mode, country, clearErrors]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async () => {
    clearErrors();
    try {
      setSubmitting(true);
      if (mode === "add") {
        const payload: CreateCountryRequest = {
          name: form.name,
          code: form.code,
        };
        await onSubmit(payload);
      } else {
        const payload: UpdateCountryRequest = {
          name: form.name,
          code: form.code,
          isActive: form.isActive,
        };
        if (!country) throw new Error("Missing country id");
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
          label="Code"
          name="code"
          value={form.code}
          onChange={handleChange}
          disabled={submitting}
          error={!!fieldErrors.code}
          helper={
            fieldErrors.code ? (
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {fieldErrors.code.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            ) : undefined
          }
          inputRefFn={bindRef("code")}
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
      title={mode === "add" ? "Add Country" : "Edit Country"}
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

export default CountryFormDialog;
