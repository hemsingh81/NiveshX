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
import { CustomButton, ErrorDisplay } from "../../../controls";
import {
  CreateCountryRequest,
  UpdateCountryRequest,
  CountryResponse,
} from "../../../services";
import { mapServerErrorsToFieldErrors } from "../../../utils/validationMapper";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateCountryRequest | UpdateCountryRequest
  ) => Promise<void>;
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

const CountryFormDialog: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  mode,
  country,
}) => {
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

    if (mode === "edit" && country) {
      setForm({
        name: country.name,
        code: country.code,
        isActive: country.isActive,
      });
    } else {
      setForm(defaultModel());
    }

    setFieldErrors({});
  }, [open, mode, country]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
        if (
          submitting &&
          (reason === "backdropClick" || reason === "escapeKeyDown")
        )
          return;
        onClose();
      }}
      fullWidth
      maxWidth="sm"
      aria-labelledby="country-form-dialog-title"
    >
      <DialogTitle
        id="country-form-dialog-title"
        sx={{ pb: 1, px: 3, backgroundColor: (t) => t.palette.grey[100] }}
      >
        {mode === "add" ? "Add Country" : "Edit Country"}
      </DialogTitle>

      <Divider sx={{ borderColor: "divider", my: 0 }} />

      <ErrorDisplay errors={fieldErrors} showFieldLevel={false} sx={{ my: 2, px: 3 }} />

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
              label="Code"
              name="code"
              value={form.code}
              onChange={handleChange}
              disabled={submitting}
              error={!!fieldErrors.code}
              helperText={renderHelper("code")}
              inputRef={(el) => (inputRefs.current["code"] = el)}
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

        <Divider sx={{ borderColor: "divider" }} />

        <DialogActions
          sx={{ p: 2, px: 3, backgroundColor: (t) => t.palette.grey[50] }}
        >
          <CustomButton
            loading={false}
            label="Cancel"
            type="button"
            color="gray"
            onClick={onClose}
            className="mr-2"
          />
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

export default CountryFormDialog;
