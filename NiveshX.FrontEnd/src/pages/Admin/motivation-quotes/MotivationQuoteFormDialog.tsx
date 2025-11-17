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
  CreateMotivationQuoteRequest,
  UpdateMotivationQuoteRequest,
  MotivationQuoteResponse,
} from "../../../services/motivationQuoteService";
import { mapServerErrorsToFieldErrors } from "../../../utils/validationMapper";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMotivationQuoteRequest | UpdateMotivationQuoteRequest) => Promise<void>;
  mode: "add" | "edit";
  initial?: MotivationQuoteResponse;
}

interface FormModel {
  quote: string;
  author: string;
  isActive: boolean;
}

const defaultModel = (): FormModel => ({
  quote: "",
  author: "",
  isActive: true,
});

const MotivationQuoteFormDialog: React.FC<Props> = ({ open, onClose, onSubmit, mode, initial }) => {
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

    if (mode === "edit" && initial) {
      setForm({
        quote: initial.quote,
        author: initial.author,
        isActive: initial.isActive,
      });
    } else {
      setForm(defaultModel());
    }

    setFieldErrors({});
  }, [open, mode, initial]);

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
        const payload: CreateMotivationQuoteRequest = {
          quote: form.quote,
          author: form.author,
        };
        await onSubmit(payload);
      } else {
        const payload: UpdateMotivationQuoteRequest = {
          quote: form.quote,
          author: form.author,
          isActive: form.isActive,
        };
        if (!initial) throw new Error("Missing quote id");
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
      aria-labelledby="motivation-quote-form-dialog"
    >
      <DialogTitle id="motivation-quote-form-dialog" sx={{ pb: 1, px: 3, backgroundColor: (t) => t.palette.grey[100] }}>
        {mode === "add" ? "Add Quote" : "Edit Quote"}
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
              label="Quote"
              name="quote"
              value={form.quote}
              onChange={handleChange}
              disabled={submitting}
              error={!!fieldErrors.quote}
              helperText={renderHelper("quote")}
              inputRef={(el) => (inputRefs.current["quote"] = el)}
            />
          </Box>

          <Box display="flex" gap={2} mt={2}>
            <TextField
              fullWidth
              label="Author"
              name="author"
              value={form.author}
              onChange={handleChange}
              disabled={submitting}
              error={!!fieldErrors.author}
              helperText={renderHelper("author")}
              inputRef={(el) => (inputRefs.current["author"] = el)}
            />
          </Box>

          {mode === "edit" && (
            <Box mt={2}>
              <FormControlLabel
                control={<Checkbox checked={form.isActive} onChange={handleChange} name="isActive" disabled={submitting} />}
                label="Visible"
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

export default MotivationQuoteFormDialog;
