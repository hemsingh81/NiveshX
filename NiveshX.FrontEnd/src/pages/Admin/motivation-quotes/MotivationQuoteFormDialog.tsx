import React, { useEffect, useState } from "react";
import { DialogContent, Box, FormControlLabel, Checkbox } from "@mui/material";
import FormDialogWrapper from "../../../controls/FormDialogWrapper";
import FormField from "../../../controls/FormField";
import useServerErrors from "../../../hooks/useServerErrors";
import { CustomButton } from "../../../controls"; // kept if other modules import it
import {
  CreateMotivationQuoteRequest,
  UpdateMotivationQuoteRequest,
  MotivationQuoteResponse,
} from "../../../services/motivationQuoteService";

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

  const { fieldErrors, handleServerError, clearErrors, bindRef } = useServerErrors();

  useEffect(() => {
    if (!open) {
      setForm((prev) => ({ ...defaultModel(), isActive: prev.isActive }));
      clearErrors();
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

    clearErrors();
  }, [open, mode, initial, clearErrors]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async () => {
    clearErrors();
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
          label="Quote"
          name="quote"
          value={form.quote}
          onChange={handleChange}
          disabled={submitting}
          error={!!fieldErrors.quote}
          helper={
            fieldErrors.quote ? (
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {fieldErrors.quote.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            ) : undefined
          }
          inputRefFn={bindRef("quote")}
        />
      </Box>

      <Box display="flex" gap={2} mt={2}>
        <FormField
          fullWidth
          label="Author"
          name="author"
          value={form.author}
          onChange={handleChange}
          disabled={submitting}
          error={!!fieldErrors.author}
          helper={
            fieldErrors.author ? (
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {fieldErrors.author.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            ) : undefined
          }
          inputRefFn={bindRef("author")}
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
  );

  return (
    <FormDialogWrapper
      open={open}
      title={mode === "add" ? "Add Quote" : "Edit Quote"}
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

export default MotivationQuoteFormDialog;
