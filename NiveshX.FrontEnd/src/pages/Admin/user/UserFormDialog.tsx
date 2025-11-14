import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Box,
} from "@mui/material";
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse,
} from "../../../services/userService";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => void;
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

const UserFormDialog: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  mode,
  user,
}) => {
  const [form, setForm] = useState<UserFormModel>({
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

  useEffect(() => {
    if (mode === "edit" && user) {
      setForm({
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || "",
        role: user.role,
        isActive: user.isActive,
        isEmailConfirmed: user.isEmailConfirmed,
        isPhoneConfirmed: user.isPhoneConfirmed,
        isLockedOut: user.isLockedOut,
        failedLoginAttempts: user.failedLoginAttempts,
      });
    } else {
      setForm({
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
    }
  }, [mode, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    const adjustedFailedAttempts = form.isLockedOut
      ? form.failedLoginAttempts
      : 0;

    if (mode === "add") {
      const payload: CreateUserRequest = {
        name: form.name,
        email: form.email,
        password: form.password || "",
        phoneNumber: form.phoneNumber,
        role: form.role as "Master" | "Trader" | "Viewer",
      };
      onSubmit(payload);
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
      onSubmit(payload);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === "add" ? "Add New User" : "Edit User"}</DialogTitle>
      <DialogContent>
        <Box display="flex" gap={2} mt={2}>
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
        </Box>

        <Box display="flex" gap={2} mt={2}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </Box>
        {mode === "edit" && (
          <FormControlLabel
            control={
              <Checkbox
                checked={form.isEmailConfirmed}
                onChange={handleChange}
                name="isEmailConfirmed"
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
          />
        </Box>
        {mode === "edit" && (
          <FormControlLabel
            control={
              <Checkbox
                checked={form.isPhoneConfirmed}
                onChange={handleChange}
                name="isPhoneConfirmed"
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
                />
              }
              label="Is Active"
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {mode === "add" ? "Create" : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserFormDialog;
