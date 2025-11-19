//src/pages/admin/exchange/ExchangeFormDialog.tsx
import React, { useEffect, useState } from "react";
import { DialogContent, Box, FormControlLabel, Checkbox, MenuItem } from "@mui/material";
import FormDialogWrapper from "../../../controls/FormDialogWrapper";
import FormField from "../../../controls/FormField";
import useServerErrors from "../../../hooks/useServerErrors";
import {
  CreateExchangeRequest,
  UpdateExchangeRequest,
  ExchangeResponse,
  getAllCountries,
} from "../../../services";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateExchangeRequest | UpdateExchangeRequest) => Promise<void>;
  mode: "add" | "edit";
  exchange?: ExchangeResponse;
}

interface FormModel {
  name: string;
  code: string;
  description?: string;
  countryId?: string;
  isActive: boolean;
}

const defaultModel = (): FormModel => ({
  name: "",
  code: "",
  description: "",
  countryId: undefined,
  isActive: true,
});

const ExchangeFormDialog: React.FC<Props> = ({ open, onClose, onSubmit, mode, exchange }) => {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormModel>(defaultModel());
  const [countries, setCountries] = useState<{ id: string; name: string }[]>([]);

  const { fieldErrors, handleServerError, clearErrors, bindRef } = useServerErrors();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getAllCountries();
        if (!mounted) return;
        setCountries(data.map((c) => ({ id: c.id, name: c.name })));
      } catch {
        // service layer handles errors/toasts
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setForm((prev) => ({ ...defaultModel(), isActive: prev.isActive }));
      clearErrors();
      setSubmitting(false);
      return;
    }

    if (mode === "edit" && exchange) {
      setForm({
        name: exchange.name,
        code: exchange.code,
        description: exchange.description ?? "",
        countryId: exchange.country?.id ?? undefined,
        isActive: exchange.isActive,
      });
    } else {
      setForm(defaultModel());
    }

    clearErrors();
  }, [open, mode, exchange, clearErrors]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async () => {
    clearErrors();
    try {
      setSubmitting(true);
      if (mode === "add") {
        const payload: CreateExchangeRequest = {
          name: form.name,
          code: form.code,
          description: form.description || undefined,
          countryId: form.countryId ?? "",
        };
        await onSubmit(payload);
      } else {
        const payload: UpdateExchangeRequest = {
          name: form.name,
          code: form.code,
          description: form.description || undefined,
          countryId: form.countryId ?? "",
          isActive: form.isActive,
        };
        if (!exchange) throw new Error("Missing exchange id");
        await onSubmit(payload);
      }
      onClose();
    } catch (err: any) {
      handleServerError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderFieldHelper = (key: string) =>
    fieldErrors[key] ? (
      <ul style={{ margin: 0, paddingLeft: 16 }}>
        {fieldErrors[key].map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
    ) : undefined;

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
          helper={renderFieldHelper("name")}
          inputRefFn={bindRef("name")}
        />
      </Box>

      <Box display="flex" gap={2} mt={2}>
        <FormField
          fullWidth
          margin="normal"
          label="Code"
          name="code"
          value={form.code}
          onChange={handleChange}
          disabled={submitting}
          error={!!fieldErrors.code}
          helper={renderFieldHelper("code")}
          inputRefFn={bindRef("code")}
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
          helper={renderFieldHelper("description")}
          inputRefFn={bindRef("description")}
        />
      </Box>

      <Box display="flex" gap={2} mt={2}>
        <FormField
          select
          fullWidth
          label="Country"
          name="countryId"
          value={form.countryId ?? ""}
          onChange={handleChange}
          disabled={submitting}
          error={!!fieldErrors.countryId}
          helper={renderFieldHelper("countryId")}
          inputRefFn={bindRef("countryId")}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {countries.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </FormField>
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
      title={mode === "add" ? "Add Exchange" : "Edit Exchange"}
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

export default ExchangeFormDialog;
