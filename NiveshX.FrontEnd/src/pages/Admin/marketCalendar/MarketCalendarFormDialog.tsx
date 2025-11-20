// src/pages/admin/marketCalendar/MarketCalendarFormDialog.tsx
import React, { useEffect, useState } from "react";
import {
  DialogContent,
  Box,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  IconButton,
  Stack,
  Tooltip,
  TextField,
} from "@mui/material";
import FormDialogWrapper from "../../../controls/FormDialogWrapper";
import FormField from "../../../controls/FormField";
import {
  useForm,
  Controller,
  useFieldArray,
  SubmitHandler,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useServerErrors from "../../../hooks/useServerErrors";
import { MdAdd, MdDelete } from "react-icons/md";
import type {
  CreateMarketCalendarRequest,
  UpdateMarketCalendarRequest,
  MarketCalendarEntry,
} from "../../../services/marketCalendarService";

// ------------------ Types ------------------
type FormModel = {
  exchangeId: string;
  regularOpenTime?: string | null;
  regularCloseTime?: string | null;
  preMarketOpen?: string | null;
  preMarketClose?: string | null;
  postMarketOpen?: string | null;
  postMarketClose?: string | null;
  holidays?: { date: string; reason: string }[];
  sessionRules?: { key: string; value: string }[];
  isActive?: boolean;
  rowVersion?: string | null;
};

// ------------------ Validation Schema & Helpers ------------------

const toHHmm = (s: string): string | null => {
  const m = s.match(/^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);
  if (!m) return null;
  const hh = m[1];
  const mm = m[2];
  return `${hh}:${mm}`;
};

const timeField: z.ZodType<string | null | undefined> = z
  .preprocess((val) => {
    if (val == null) return undefined;
    const s = String(val).trim();
    if (s === "") return undefined;
    const hhmm = toHHmm(s);
    return hhmm ?? s;
  }, z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be HH:mm"))
  .optional()
  .nullable();

const holidaySchema = z.object({
  date: z.string().min(1, "Date is required"),
  reason: z.string().min(1, "Reason is required"),
});

const sessionRuleSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
});

const schema: z.ZodType<FormModel> = z.object({
  exchangeId: z.string().min(1, "Exchange is required"),
  regularOpenTime: timeField,
  regularCloseTime: timeField,
  preMarketOpen: timeField,
  preMarketClose: timeField,
  postMarketOpen: timeField,
  postMarketClose: timeField,
  holidays: z.array(holidaySchema).optional(),
  sessionRules: z.array(sessionRuleSchema).optional(),
  isActive: z.boolean().optional(),
  rowVersion: z.string().optional().nullable(),
});

const defaultValues = (): FormModel => ({
  exchangeId: "",
  regularOpenTime: undefined,
  regularCloseTime: undefined,
  preMarketOpen: undefined,
  preMarketClose: undefined,
  postMarketOpen: undefined,
  postMarketClose: undefined,
  holidays: [],
  sessionRules: [],
  isActive: true,
  rowVersion: undefined,
});

const toMinutes = (t?: string | null): number | null => {
  if (!t) return null;
  const [hh, mm] = t.split(":").map(Number);
  return Number.isNaN(hh) || Number.isNaN(mm) ? null : hh * 60 + mm;
};

const normalizeTimes = (s?: string | null) => {
  if (!s) return null;
  const hhmm = toHHmm(s.trim());
  return hhmm ?? null;
};

const parseJsonArrayOrObject = <T extends { [k: string]: any }>(
  s: string | null | undefined,
  mapFn: (k: string, v: any) => T
): T[] => {
  if (!s) return [];
  try {
    const parsed = JSON.parse(s);
    if (Array.isArray(parsed)) {
      return parsed.map((p: any) =>
        mapFn(p.key ?? p.date, p.value ?? p.reason)
      );
    }
    if (typeof parsed === "object" && parsed !== null) {
      return Object.entries(parsed).map(([k, v]) => mapFn(k, v));
    }
  } catch {}
  return [];
};

const validateTimeRange = (
  open: string | null | undefined,
  close: string | null | undefined,
  setError: (name: any, err: { type: string; message: string }) => void,
  fieldNames: [string, string],
  label: string
): string | null => {
  const openMin = toMinutes(open);
  const closeMin = toMinutes(close);
  if (openMin != null && closeMin != null && openMin > closeMin) {
    setError(fieldNames[0], {
      type: "manual",
      message: `${label} Open must be earlier than Close.`,
    });
    setError(fieldNames[1], {
      type: "manual",
      message: `${label} Close must be later than Open.`,
    });
    return `${label} times are inconsistent.`;
  }
  return null;
};

// ------------------ Subcomponents ------------------

const TimeField: React.FC<{
  name: keyof FormModel;
  label: string;
  control: any;
  bindRef: (key: string) => any;
  errorHelper: (key: string) => string | undefined;
  clearCrossField: () => void;
  clearFieldError: (name: string) => void;
}> = ({
  name,
  label,
  control,
  bindRef,
  errorHelper,
  clearCrossField,
  clearFieldError,
}) => (
  <Controller
    name={name as any}
    control={control}
    render={({ field, fieldState }) => (
      <TextField
        {...field}
        fullWidth
        label={label}
        type="time"
        inputProps={{ step: 60 }}
        value={field.value ?? ""}
        onChange={(e) => {
          clearCrossField();
          clearFieldError(name as string);
          field.onChange(e.target.value || undefined);
        }}
        error={!!fieldState.error}
        helperText={errorHelper(name)}
        inputRef={bindRef(name)}
        size="small"
        margin="dense"
      />
    )}
  />
);

const RowActionDelete: React.FC<{ onClick: () => void; ariaLabel: string }> = ({
  onClick,
  ariaLabel,
}) => (
  <IconButton
    aria-label={ariaLabel}
    size="small"
    onClick={onClick}
    sx={{ p: 0.25, minWidth: 28 }}
  >
    <MdDelete />
  </IconButton>
);

const HolidayRow: React.FC<{
  index: number;
  control: any;
  remove: (i: number) => void;
}> = ({ index, control, remove }) => (
  <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 0.25 }}>
    <Controller
      name={`holidays.${index}.date`}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150, flex: "0 0 40%" }}
          margin="dense"
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
        />
      )}
    />
    <Controller
      name={`holidays.${index}.reason`}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          placeholder="Reason"
          size="small"
          sx={{ minWidth: 200, flex: "1 1 60%" }}
          margin="dense"
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
        />
      )}
    />
    <RowActionDelete onClick={() => remove(index)} ariaLabel="remove-holiday" />
  </Box>
);

const SessionRow: React.FC<{
  index: number;
  control: any;
  remove: (i: number) => void;
}> = ({ index, control, remove }) => (
  <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 0.25 }}>
    <Controller
      name={`sessionRules.${index}.key`}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          placeholder="Key"
          size="small"
          sx={{ minWidth: 120, flex: "0 0 38%" }}
          margin="dense"
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
        />
      )}
    />
    <Controller
      name={`sessionRules.${index}.value`}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          placeholder="Value"
          size="small"
          sx={{ minWidth: 140, flex: "1 1 58%" }}
          margin="dense"
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
        />
      )}
    />
    <RowActionDelete onClick={() => remove(index)} ariaLabel="remove-session" />
  </Box>
);

// ------------------ Main Component ------------------

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateMarketCalendarRequest | UpdateMarketCalendarRequest
  ) => Promise<void>;
  mode: "add" | "edit";
  item?: MarketCalendarEntry;
  exchangeOptions: { id: string; name: string }[];
}

const MarketCalendarFormDialog: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  mode,
  item,
  exchangeOptions,
}) => {
  const { fieldErrors, handleServerError, clearErrors, bindRef } =
    useServerErrors({ preservePath: false, autoFocus: true });

  // Fix: cast schema to any when creating resolver to avoid Zod/RHF generic mismatch
  const resolver = zodResolver(schema as any);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState,
    clearErrors: clearRHFErrors,
  } = useForm<FormModel>({
    resolver,
    defaultValues: defaultValues(),
    mode: "onChange",
    reValidateMode: "onBlur",
  });

  const [crossFieldMessage, setCrossFieldMessage] = useState<string | null>(
    null
  );

  const {
    fields: holidayFields,
    append: appendHoliday,
    remove: removeHoliday,
  } = useFieldArray({ control, name: "holidays" });

  const {
    fields: sessionFields,
    append: appendSession,
    remove: removeSession,
  } = useFieldArray({ control, name: "sessionRules" });

  useEffect(() => {
    if (!open) {
      clearErrors();
      reset(defaultValues());
      setCrossFieldMessage(null);
      return;
    }

    if (mode === "edit" && item) {
      const parsedHolidays = parseJsonArrayOrObject(
        item.holidayDatesJson ?? "[]",
        (k, v) => ({
          date: String(k ?? ""),
          reason: typeof v === "string" ? v : JSON.stringify(v ?? ""),
        })
      ).filter((h) => h.date || h.reason);

      const parsedSessions = parseJsonArrayOrObject(
        item.sessionRulesJson ?? "{}",
        (k, v) => ({
          key: String(k ?? ""),
          value: typeof v === "string" ? v : JSON.stringify(v ?? ""),
        })
      ).filter((s) => s.key && s.value);

      reset({
        exchangeId: item.exchangeId,
        regularOpenTime: item.regularOpenTime ?? undefined,
        regularCloseTime: item.regularCloseTime ?? undefined,
        preMarketOpen: item.preMarketOpen ?? undefined,
        preMarketClose: item.preMarketClose ?? undefined,
        postMarketOpen: item.postMarketOpen ?? undefined,
        postMarketClose: item.postMarketClose ?? undefined,
        holidays: parsedHolidays,
        sessionRules: parsedSessions,
        isActive: item.isActive ?? true,
        rowVersion: item.rowVersion ?? undefined,
      });
    } else {
      reset(defaultValues());
    }

    clearErrors();
    try {
      clearRHFErrors();
    } catch {}
    setCrossFieldMessage(null);
  }, [open, mode, item, reset, clearErrors, clearRHFErrors]);

  useEffect(() => {
    try {
      clearRHFErrors();
    } catch {}
    Object.entries(fieldErrors).forEach(([key, msgs]) => {
      if (key === "__global") return;
      setError(key as any, {
        type: "server",
        message: msgs[0] ?? msgs.join("; "),
      });
    });
  }, [fieldErrors, setError, clearRHFErrors]);

  const getFieldErrorString = (key: string): string | undefined => {
    const err = (formState.errors as any)[key];
    if (err?.message) return String(err.message);
    const serverMsgs = fieldErrors?.[key];
    if (serverMsgs && serverMsgs.length > 0) return serverMsgs[0];
    return undefined;
  };

  const onSubmitInternal: SubmitHandler<FormModel> = async (values) => {
    clearErrors();
    setCrossFieldMessage(null);
    try {
      try {
        clearRHFErrors();
      } catch {}

      const messages: (string | null)[] = [
        validateTimeRange(
          values.preMarketOpen,
          values.preMarketClose,
          setError,
          ["preMarketOpen", "preMarketClose"],
          "Pre"
        ),
        validateTimeRange(
          values.regularOpenTime,
          values.regularCloseTime,
          setError,
          ["regularOpenTime", "regularCloseTime"],
          "Regular"
        ),
        validateTimeRange(
          values.postMarketOpen,
          values.postMarketClose,
          setError,
          ["postMarketOpen", "postMarketClose"],
          "Post"
        ),
      ];
      const firstMessage = messages.find((m) => !!m);
      if (firstMessage) {
        setCrossFieldMessage(firstMessage);
        return;
      }

      const holidaysObject = values.holidays?.reduce<Record<string, string>>(
        (acc, cur) => {
          if (cur?.date) acc[cur.date] = cur.reason;
          return acc;
        },
        {}
      );
      const sessionObject = values.sessionRules?.reduce<Record<string, string>>(
        (acc, cur) => {
          if (cur?.key) acc[cur.key] = cur.value;
          return acc;
        },
        {}
      );

      const normalized = {
        exchangeId: values.exchangeId,
        regularOpenTime: normalizeTimes(values.regularOpenTime),
        regularCloseTime: normalizeTimes(values.regularCloseTime),
        preMarketOpen: normalizeTimes(values.preMarketOpen),
        preMarketClose: normalizeTimes(values.preMarketClose),
        postMarketOpen: normalizeTimes(values.postMarketOpen),
        postMarketClose: normalizeTimes(values.postMarketClose),
        holidayDatesJson:
          holidaysObject && Object.keys(holidaysObject).length > 0
            ? JSON.stringify(holidaysObject)
            : "[]",
        sessionRulesJson:
          sessionObject && Object.keys(sessionObject).length > 0
            ? JSON.stringify(sessionObject)
            : "{}",
        isActive: values.isActive ?? true,
        rowVersion: values.rowVersion ?? undefined,
      };

      if (mode === "add") {
        const payload: CreateMarketCalendarRequest = {
          exchangeId: normalized.exchangeId,
          regularOpenTime: normalized.regularOpenTime,
          regularCloseTime: normalized.regularCloseTime,
          preMarketOpen: normalized.preMarketOpen,
          preMarketClose: normalized.preMarketClose,
          postMarketOpen: normalized.postMarketOpen,
          postMarketClose: normalized.postMarketClose,
          holidayDatesJson: normalized.holidayDatesJson,
          sessionRulesJson: normalized.sessionRulesJson,
          isActive: normalized.isActive,
        };
        await onSubmit(payload);
      } else {
        if (!values.rowVersion) {
          setError("rowVersion" as any, {
            type: "manual",
            message: "Missing rowVersion; reload the entry before updating.",
          });
          return;
        }
        const payload: UpdateMarketCalendarRequest = {
          rowVersion: normalized.rowVersion as string,
          exchangeId: normalized.exchangeId,
          regularOpenTime: normalized.regularOpenTime,
          regularCloseTime: normalized.regularCloseTime,
          preMarketOpen: normalized.preMarketOpen,
          preMarketClose: normalized.preMarketClose,
          postMarketOpen: normalized.postMarketOpen,
          postMarketClose: normalized.postMarketClose,
          holidayDatesJson: normalized.holidayDatesJson,
          sessionRulesJson: normalized.sessionRulesJson,
          isActive: normalized.isActive,
        };
        await onSubmit(payload);
      }

      onClose();
    } catch (err: any) {
      handleServerError(err);
    }
  };

  // layout
  const gap = 2;
  const colMin = 150;
  const colFlex = "1 1 180px";

  // typed submit handler wrapper
  const submitHandler = handleSubmit(onSubmitInternal as any);

  return (
    <FormDialogWrapper
      open={open}
      title={mode === "add" ? "Add Calendar Entry" : "Edit Calendar Entry"}
      submitting={formState.isSubmitting}
      mode={mode}
      onClose={onClose}
      onSubmit={submitHandler}
      errors={fieldErrors}
      showFieldLevel={false}
      submitLabels={{ add: "Create", edit: "Update" }}
      renderBody={() => (
        <DialogContent sx={{ py: 0.5 }}>
          <Stack spacing={1}>
            <Box sx={{ display: "flex", gap, flexWrap: "wrap" }}>
              <Controller
                name="rowVersion"
                control={control}
                render={() => <></>}
              />

              <Box sx={{ flex: colFlex, minWidth: colMin }}>
                <Controller
                  name="exchangeId"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormField
                      select
                      fullWidth
                      required
                      label="Exchange"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange((e.target as HTMLInputElement).value)
                      }
                      error={!!fieldState.error}
                      helper={getFieldErrorString("exchangeId")}
                      helperText={getFieldErrorString("exchangeId")}
                      inputRefFn={bindRef("exchangeId")}
                      size="small"
                      margin="dense"
                    >
                      <MenuItem value="">
                        <em>Select exchange</em>
                      </MenuItem>
                      {exchangeOptions.map((ex) => (
                        <MenuItem key={ex.id} value={ex.id}>
                          {ex.name}
                        </MenuItem>
                      ))}
                    </FormField>
                  )}
                />
              </Box>

              {crossFieldMessage ? (
                <Box sx={{ width: "100%" }}>
                  <Typography color="error" variant="caption" sx={{ mb: 0.5 }}>
                    {crossFieldMessage}
                  </Typography>
                </Box>
              ) : null}

              {/* times - Pre -> Regular -> Post */}
              <Box
                sx={{
                  display: "flex",
                  gap: gap - 1,
                  flexWrap: "wrap",
                  width: "100%",
                }}
              >
                {[
                  { name: "preMarketOpen", label: "Pre Open" },
                  { name: "preMarketClose", label: "Pre Close" },
                  { name: "regularOpenTime", label: "Regular Open" },
                  { name: "regularCloseTime", label: "Regular Close" },
                  { name: "postMarketOpen", label: "Post Open" },
                  { name: "postMarketClose", label: "Post Close" },
                ].map((f) => (
                  <Box key={f.name} sx={{ flex: colFlex, minWidth: colMin }}>
                    <TimeField
                      name={f.name as keyof FormModel}
                      label={f.label}
                      control={control}
                      bindRef={bindRef}
                      errorHelper={getFieldErrorString}
                      clearCrossField={() =>
                        crossFieldMessage && setCrossFieldMessage(null)
                      }
                      clearFieldError={(n) => clearRHFErrors(n as any)}
                    />
                  </Box>
                ))}
              </Box>

              {/* Holidays & Session Rules */}
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  gap,
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                }}
              >
                <Box sx={{ flex: "1 1 420px", minWidth: 220 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={0.25}
                  >
                    <Typography variant="subtitle2" sx={{ lineHeight: 1.1 }}>
                      Holidays (Date & Reason)
                    </Typography>
                    <Box>
                      <Tooltip title="Add holiday">
                        <IconButton
                          size="small"
                          onClick={() =>
                            appendHoliday({ date: "", reason: "" } as any)
                          }
                          sx={{ p: 0.25, minWidth: 36 }}
                        >
                          <MdAdd />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {holidayFields.length === 0 ? (
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ mt: 0.25 }}
                    >
                      No holidays. Click + to add.
                    </Typography>
                  ) : (
                    holidayFields.map((_, i) => (
                      <HolidayRow
                        key={holidayFields[i].id}
                        index={i}
                        control={control}
                        remove={removeHoliday}
                      />
                    ))
                  )}
                </Box>

                <Box sx={{ flex: "1 1 420px", minWidth: 220 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={0.25}
                  >
                    <Typography variant="subtitle2" sx={{ lineHeight: 1.1 }}>
                      Session Rules
                    </Typography>
                    <Box>
                      <Tooltip title="Add session rule">
                        <IconButton
                          size="small"
                          onClick={() =>
                            appendSession({ key: "", value: "" } as any)
                          }
                          sx={{ p: 0.25, minWidth: 36 }}
                        >
                          <MdAdd />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {sessionFields.length === 0 ? (
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ mt: 0.25 }}
                    >
                      No session rules. Click + to add.
                    </Typography>
                  ) : (
                    sessionFields.map((_, i) => (
                      <SessionRow
                        key={sessionFields[i].id}
                        index={i}
                        control={control}
                        remove={removeSession}
                      />
                    ))
                  )}
                </Box>
              </Box>

              <Box
                sx={{ flex: colFlex, display: "flex", alignItems: "center" }}
              >
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          size="small"
                        />
                      }
                      label="Active"
                      sx={{ ml: 0 }}
                    />
                  )}
                />
              </Box>
            </Box>
          </Stack>
        </DialogContent>
      )}
    />
  );
};

export default MarketCalendarFormDialog;
