import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Box,
  Divider,
} from "@mui/material";
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse,
} from "../../../services/userService";
import CustomButton from "../../../controls/CustomButton"; // default import (adjust if your export differs)
import { mapServerErrorsToFieldErrors } from "../../../utils/validationMapper";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  mode: "add" | "edit";
  user?: UserResponse;
}

const roles = ["Master", "Trader", "Viewer"];

interface UserFormModel {
  name: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
  isEmailConfirmed: boolean;
  isPhoneConfirmed: boolean;
  isLockedOut: boolean;
  failedLoginAttempts: number;
}

const defaultModel = (): UserFormModel => ({
  name: "",
  email: "",
  password: "",
  phoneNumber: "",
  role: "Trader",
  isActive: true,
  isEmailConfirmed: false,
  isPhoneConfirmed: false,
  isLockedOut: false,
  failedLoginAttempts: 0,
});

const UserFormDialog: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  mode,
  user,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<UserFormModel>(defaultModel());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Initialize form when dialog opens
  useEffect(() => {
    if (!open) {
      // reset sensitive fields when closed
      setForm((prev) => ({ ...defaultModel(), ...{ role: prev.role } }));
      setFieldErrors({});
      setSubmitting(false);
      return;
    }

    if (mode === "edit" && user) {
      setForm({
        name: user.name,
        email: user.email,
        password: "",
        phoneNumber: user.phoneNumber || "",
        role: user.role,
        isActive: user.isActive,
        isEmailConfirmed: user.isEmailConfirmed,
        isPhoneConfirmed: user.isPhoneConfirmed,
        isLockedOut: user.isLockedOut,
        failedLoginAttempts: user.failedLoginAttempts,
      });
    } else {
      setForm(defaultModel());
    }

    setFieldErrors({});
  }, [open, mode, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "failedLoginAttempts"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async () => {
    // clear previous field errors
    setFieldErrors({});
    const adjustedFailedAttempts = form.isLockedOut
      ? form.failedLoginAttempts
      : 0;

    try {
      setSubmitting(true);

      if (mode === "add") {
        const payload: CreateUserRequest = {
          name: form.name,
          email: form.email,
          password: form.password || "",
          phoneNumber: form.phoneNumber,
          role: form.role as "Master" | "Trader" | "Viewer",
        };
        await onSubmit(payload);
      } else {
        const payload: UpdateUserRequest = {
          name: form.name,
          email: form.email,
          phoneNumber: form.phoneNumber,
          role: form.role as "Master" | "Trader" | "Viewer",
          isActive: form.isActive,
          isEmailConfirmed: form.isEmailConfirmed,
          isPhoneConfirmed: form.isPhoneConfirmed,
          isLockedOut: form.isLockedOut,
          failedLoginAttempts: adjustedFailedAttempts,
        };
        await onSubmit(payload);
      }

      onClose(); // close only on success
    } catch (err: any) {
      const mapped = mapServerErrorsToFieldErrors(err);
      setFieldErrors(mapped);
      // optionally focus the first errored field:
      const firstField = Object.keys(mapped)[0];
      if (firstField && firstField !== "__global") {
        const el = document.querySelector(
          `[name="${firstField}"]`
        ) as HTMLElement | null;
        el?.focus?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        // prevent accidental close while submitting
        if (
          submitting &&
          (reason === "backdropClick" || reason === "escapeKeyDown")
        )
          return;
        onClose();
      }}
      fullWidth
      maxWidth="sm"
      aria-labelledby="user-form-dialog-title"
    >
      <DialogTitle
        id="user-form-dialog-title"
        sx={{
          pb: 1,
          px: 3,
          backgroundColor: (theme) => theme.palette.grey[100], // light surface; use theme.palette.primary.light for brand color
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        {mode === "add" ? "Add New User" : "Edit User"}
      </DialogTitle>

      {/* Divider between Title and Content */}
      <Divider sx={{ borderColor: "divider", my: 0 }} />

      {fieldErrors["__global"] && (
        <Box color="error.main" mb={2} px={3}>
          {fieldErrors["__global"]}
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
              helperText={fieldErrors.name}
            />
          </Box>

          <Box display="flex" gap={2} mt={2}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled={submitting}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
            />
          </Box>

          {mode === "edit" && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.isEmailConfirmed}
                  onChange={handleChange}
                  name="isEmailConfirmed"
                  disabled={submitting}
                />
              }
              label="Email Confirmed"
            />
          )}

          {mode === "add" && (
            <Box display="flex" mt={2}>
              <TextField
                fullWidth
                margin="normal"
                label="Password"
                name="password"
                type="password"
                value={form.password || ""}
                onChange={handleChange}
                disabled={submitting}
                error={!!fieldErrors.password}
                helperText={fieldErrors.password}
              />
            </Box>
          )}

          <Box display="flex" gap={2} mt={2}>
            <TextField
              fullWidth
              label="Phone"
              name="phoneNumber"
              value={form.phoneNumber || ""}
              onChange={handleChange}
              disabled={submitting}
              error={!!fieldErrors.phoneNumber}
              helperText={fieldErrors.phoneNumber}
            />
          </Box>

          {mode === "edit" && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.isPhoneConfirmed}
                  onChange={handleChange}
                  name="isPhoneConfirmed"
                  disabled={submitting}
                />
              }
              label="Phone Confirmed"
            />
          )}

          <Box display="flex" mt={2}>
            <TextField
              select
              fullWidth
              margin="normal"
              label="Role"
              name="role"
              value={form.role}
              onChange={handleChange}
              disabled={submitting}
              error={!!fieldErrors.role}
              helperText={fieldErrors.role}
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {mode === "edit" && (
            <Box display="flex" gap={2} mt={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.isLockedOut}
                    onChange={handleChange}
                    name="isLockedOut"
                    disabled={submitting}
                  />
                }
                label="Is Locked Out"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Failed Login Attempts"
                name="failedLoginAttempts"
                type="number"
                value={form.failedLoginAttempts}
                InputProps={{ readOnly: true }}
                sx={{ flex: 1 }}
              />
            </Box>
          )}

          {mode === "edit" && (
            <Box mt={3}>
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

        {/* Divider between Content and Footer */}
        <Divider sx={{ borderColor: "divider" }} />

        <DialogActions
          sx={{
            p: 2,
            px: 3,
            backgroundColor: (theme) => theme.palette.grey[50], // slightly different tint for footer
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
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
            onClick={undefined}
            color="blue"
          />
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserFormDialog;
