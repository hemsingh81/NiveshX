import React, { useEffect, useRef, useState } from "react";
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
import { CustomButton } from "../../../controls";
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse,
} from "../../../services/userService";
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

const UserFormDialog: React.FC<Props> = ({ open, onClose, onSubmit, mode, user }) => {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<UserFormModel>(defaultModel());
  // now store arrays so multiple messages are preserved
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // stable refs map for inputs (MUI TextField input elements)
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!open) {
      setForm((prev) => ({ ...defaultModel(), role: prev.role }));
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
        type === "checkbox" ? checked : name === "failedLoginAttempts" ? Number(value) : value,
    }));
  };

  const focusFirstError = (mapped: Record<string, string[]>) => {
    const firstField = Object.keys(mapped)[0];
    if (!firstField || firstField === "__global") return;
    const ref = inputRefs.current[firstField];
    if (ref && typeof ref.focus === "function") ref.focus();
  };

  const handleSubmit = async () => {
    setFieldErrors({});
    const adjustedFailedAttempts = form.isLockedOut ? form.failedLoginAttempts : 0;

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

      onClose();
    } catch (err: any) {
      // mapper now returns Record<string, string[]>
      const mapped = mapServerErrorsToFieldErrors(err);
      setFieldErrors(mapped);
      // focus first field using refs
      focusFirstError(mapped);
    } finally {
      setSubmitting(false);
    }
  };

  const renderHelper = (key: string | undefined) => {
    const arr = key ? fieldErrors[key] : undefined;
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
      onClose={(event, reason) => {
        if (submitting && (reason === "backdropClick" || reason === "escapeKeyDown")) return;
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
          backgroundColor: (theme) => theme.palette.grey[100],
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        {mode === "add" ? "Add New User" : "Edit User"}
      </DialogTitle>

      <Divider sx={{ borderColor: "divider", my: 0 }} />

      {fieldErrors["__global"] && fieldErrors["__global"].length > 0 && (
        <Box
          role="status"
          aria-live="polite"
          color="error.main"
          mb={2}
          px={3}
          sx={{ whiteSpace: "pre-line" }}
        >
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
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled={submitting}
              error={!!fieldErrors.email}
              helperText={renderHelper("email")}
              inputRef={(el) => (inputRefs.current["email"] = el)}
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
                  inputProps={{ "aria-label": "Email Confirmed" }}
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
                helperText={renderHelper("password")}
                inputRef={(el) => (inputRefs.current["password"] = el)}
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
              helperText={renderHelper("phoneNumber")}
              inputRef={(el) => (inputRefs.current["phoneNumber"] = el)}
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
                  inputProps={{ "aria-label": "Phone Confirmed" }}
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
              helperText={renderHelper("role")}
              inputRef={(el) => (inputRefs.current["role"] = el)}
            >
              {roles.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
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
                    inputProps={{ "aria-label": "Is Locked Out" }}
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
                inputRef={(el) => (inputRefs.current["failedLoginAttempts"] = el)}
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
                    inputProps={{ "aria-label": "Is Active" }}
                  />
                }
                label="Is Active"
              />
            </Box>
          )}
        </DialogContent>

        <Divider sx={{ borderColor: "divider" }} />

        <DialogActions
          sx={{
            p: 2,
            px: 3,
            backgroundColor: (theme) => theme.palette.grey[50],
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          <CustomButton loading={false} label="Cancel" type="button" color="gray" onClick={onClose} className="mr-2" />
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
