// src/pages/admin/stockMarket/StockMarketFormDialog.tsx
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
  MenuItem,
} from "@mui/material";
import { CustomButton } from "../../../controls";
import {
  CreateStockMarketRequest,
  UpdateStockMarketRequest,
  StockMarketResponse,
  getAllCountries
} from "../../../services";
import { mapServerErrorsToFieldErrors } from "../../../utils/validationMapper";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateStockMarketRequest | UpdateStockMarketRequest
  ) => Promise<void>;
  mode: "add" | "edit";
  stockMarket?: StockMarketResponse;
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

const StockMarketFormDialog: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  mode,
  stockMarket,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormModel>(defaultModel());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [countries, setCountries] = useState<{ id: string; name: string }[]>(
    []
  );
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getAllCountries();
        if (!mounted) return;
        setCountries(data.map((c) => ({ id: c.id, name: c.name })));
      } catch {
        // withToast shows errors
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setForm((prev) => ({ ...defaultModel(), isActive: prev.isActive }));
      setFieldErrors({});
      setSubmitting(false);
      return;
    }

    if (mode === "edit" && stockMarket) {
      setForm({
        name: stockMarket.name,
        code: stockMarket.code,
        description: stockMarket.description ?? "",
        countryId: stockMarket.country?.id ?? undefined,
        isActive: stockMarket.isActive,
      });
    } else {
      setForm(defaultModel());
    }

    setFieldErrors({});
  }, [open, mode, stockMarket]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as any;
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
        const payload: CreateStockMarketRequest = {
          name: form.name,
          code: form.code,
          description: form.description || undefined,
          countryId: form.countryId ?? "",
        };
        await onSubmit(payload);
      } else {
        const payload: UpdateStockMarketRequest = {
          name: form.name,
          code: form.code,
          description: form.description || undefined,
          countryId: form.countryId ?? "",
          isActive: form.isActive,
        };
        if (!stockMarket) throw new Error("Missing stock market id");
        await onSubmit(payload);
      }
      onClose();
    } catch (err: any) {
      const mapped = mapServerErrorsToFieldErrors(err);
      setFieldErrors(mapped);
      focusFirstError(mapped);
      // do not rethrow — we've handled mapping here
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
      aria-labelledby="stock-market-form-dialog-title"
    >
      <DialogTitle
        id="stock-market-form-dialog-title"
        sx={{ pb: 1, px: 3, backgroundColor: (t) => t.palette.grey[100] }}
      >
        {mode === "add" ? "Add Stock Market" : "Edit Stock Market"}
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
              margin="normal"
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

          <Box display="flex" gap={2} mt={2}>
            <TextField
              select
              fullWidth
              label="Country"
              name="countryId"
              value={form.countryId ?? ""}
              onChange={handleChange}
              disabled={submitting}
              error={!!fieldErrors.countryId}
              helperText={renderHelper("countryId")}
              inputRef={(el) => (inputRefs.current["countryId"] = el)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {countries.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
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
            onClick={() => {
              if (!submitting) onClose();
            }}
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

export default StockMarketFormDialog;
