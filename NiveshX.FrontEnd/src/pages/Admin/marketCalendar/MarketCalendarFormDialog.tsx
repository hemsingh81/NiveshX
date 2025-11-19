// src/pages/admin/marketCalendar/MarketCalendarFormDialog.tsx
import React, { useEffect } from "react";
import {
  DialogContent,
  Box,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import FormDialogWrapper from "../../../controls/FormDialogWrapper";
import FormField from "../../../controls/FormField";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useServerErrors from "../../../hooks/useServerErrors";
import type {
  CreateMarketCalendarRequest,
  UpdateMarketCalendarRequest,
  MarketCalendarEntry,
} from "../../../services/marketCalendarService";

/*
  Validation notes:
  - Accepts time strings in HH:mm or HH:mm:ss
  - RowVersion is base64 string; required for update (server enforces)
*/
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

const schema = z.object({
  exchangeId: z.string().min(1, "Exchange is required"),
  regularOpenTime: z
    .string()
    .regex(timeRegex, "Time must be HH:mm or HH:mm:ss")
    .optional()
    .nullable(),
  regularCloseTime: z
    .string()
    .regex(timeRegex, "Time must be HH:mm or HH:mm:ss")
    .optional()
    .nullable(),
  preMarketOpen: z
    .string()
    .regex(timeRegex, "Time must be HH:mm or HH:mm:ss")
    .optional()
    .nullable(),
  preMarketClose: z
    .string()
    .regex(timeRegex, "Time must be HH:mm or HH:mm:ss")
    .optional()
    .nullable(),
  postMarketOpen: z
    .string()
    .regex(timeRegex, "Time must be HH:mm or HH:mm:ss")
    .optional()
    .nullable(),
  postMarketClose: z
    .string()
    .regex(timeRegex, "Time must be HH:mm or HH:mm:ss")
    .optional()
    .nullable(),
  holidayDatesJson: z.string().optional().nullable(),
  sessionRulesJson: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  rowVersion: z.string().optional().nullable(),
});

type FormModel = z.infer<typeof schema>;

const defaultValues = (): FormModel => ({
  exchangeId: "",
  regularOpenTime: undefined,
  regularCloseTime: undefined,
  preMarketOpen: undefined,
  preMarketClose: undefined,
  postMarketOpen: undefined,
  postMarketClose: undefined,
  holidayDatesJson: "[]",
  sessionRulesJson: "{}",
  isActive: true,
  rowVersion: undefined,
});

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

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState,
    getValues,
    clearErrors: clearRHFErrors,
  } = useForm<FormModel>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues(),
    mode: "onBlur",
  });

  useEffect(() => {
    if (!open) {
      clearErrors();
      reset(defaultValues());
      return;
    }

    if (mode === "edit" && item) {
      reset({
        exchangeId: item.exchangeId,
        regularOpenTime: item.regularOpenTime ?? undefined,
        regularCloseTime: item.regularCloseTime ?? undefined,
        preMarketOpen: item.preMarketOpen ?? undefined,
        preMarketClose: item.preMarketClose ?? undefined,
        postMarketOpen: item.postMarketOpen ?? undefined,
        postMarketClose: item.postMarketClose ?? undefined,
        holidayDatesJson: item.holidayDatesJson ?? "[]",
        sessionRulesJson: item.sessionRulesJson ?? "{}",
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

  const normalizeTimes = (s?: string | null | undefined) => {
    if (!s) return null;
    // accept "HH:mm" -> "HH:mm:00", keep "HH:mm:ss"
    if (/^\d{2}:\d{2}$/.test(s)) return `${s}:00`;
    if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s;
    return null; // invalid -> send null so server doesn't try to parse empty/garbage
  };

  const ensureJsonString = (s?: string | null | undefined, fallback = "[]") => {
    if (!s) return fallback;
    try {
      // ensure it's valid JSON or keep original string if server expects free text
      JSON.parse(s);
      return s;
    } catch {
      // if server expects a JSON string, fallback; otherwise send original
      return fallback;
    }
  };

  const onSubmitInternal = async (values: FormModel) => {
    clearErrors();
    try {
      const normalized = {
        exchangeId: values.exchangeId,
        regularOpenTime: normalizeTimes(values.regularOpenTime),
        regularCloseTime: normalizeTimes(values.regularCloseTime),
        preMarketOpen: normalizeTimes(values.preMarketOpen),
        preMarketClose: normalizeTimes(values.preMarketClose),
        postMarketOpen: normalizeTimes(values.postMarketOpen),
        postMarketClose: normalizeTimes(values.postMarketClose),
        holidayDatesJson: ensureJsonString(values.holidayDatesJson, "[]"),
        sessionRulesJson: ensureJsonString(values.sessionRulesJson, "{}"),
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
          // server requires RowVersion on update — surface a clear error
          setError("rowVersion" as any, {
            type: "manual",
            message: "Missing rowVersion; reload the entry before updating.",
          });
          return;
        }

        const payload: UpdateMarketCalendarRequest = {
          rowVersion: normalized.rowVersion as string, // required
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
      <Box display="flex" gap={2} flexDirection="column">
        {/* hidden RHF field for rowVersion */}
        <Controller name="rowVersion" control={control} render={() => <></>} />

        <Controller
          name="exchangeId"
          control={control}
          render={({ field, fieldState }) => (
            <FormField
              select
              fullWidth
              label="Exchange"
              {...field}
              value={field.value ?? ""}
              onChange={(e) =>
                field.onChange((e.target as HTMLInputElement).value)
              }
              error={!!fieldState.error}
              helper={
                fieldState.error?.message ?? renderFieldHelper("exchangeId")
              }
              inputRefFn={bindRef("exchangeId")}
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

        <Controller
          name="regularOpenTime"
          control={control}
          render={({ field, fieldState }) => (
            <FormField
              fullWidth
              label="Regular Open Time (HH:mm or HH:mm:ss)"
              {...field}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value || undefined)}
              error={!!fieldState.error}
              helper={
                fieldState.error?.message ??
                renderFieldHelper("regularOpenTime")
              }
              inputRefFn={bindRef("regularOpenTime")}
            />
          )}
        />

        <Controller
          name="regularCloseTime"
          control={control}
          render={({ field, fieldState }) => (
            <FormField
              fullWidth
              label="Regular Close Time (HH:mm or HH:mm:ss)"
              {...field}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value || undefined)}
              error={!!fieldState.error}
              helper={
                fieldState.error?.message ??
                renderFieldHelper("regularCloseTime")
              }
              inputRefFn={bindRef("regularCloseTime")}
            />
          )}
        />

        <Controller
          name="preMarketOpen"
          control={control}
          render={({ field, fieldState }) => (
            <FormField
              fullWidth
              label="Pre Market Open (HH:mm or HH:mm:ss)"
              {...field}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value || undefined)}
              error={!!fieldState.error}
              helper={
                fieldState.error?.message ?? renderFieldHelper("preMarketOpen")
              }
              inputRefFn={bindRef("preMarketOpen")}
            />
          )}
        />

        <Controller
          name="preMarketClose"
          control={control}
          render={({ field, fieldState }) => (
            <FormField
              fullWidth
              label="Pre Market Close (HH:mm or HH:mm:ss)"
              {...field}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value || undefined)}
              error={!!fieldState.error}
              helper={
                fieldState.error?.message ?? renderFieldHelper("preMarketClose")
              }
              inputRefFn={bindRef("preMarketClose")}
            />
          )}
        />

        <Controller
          name="postMarketOpen"
          control={control}
          render={({ field, fieldState }) => (
            <FormField
              fullWidth
              label="Post Market Open (HH:mm or HH:mm:ss)"
              {...field}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value || undefined)}
              error={!!fieldState.error}
              helper={
                fieldState.error?.message ?? renderFieldHelper("postMarketOpen")
              }
              inputRefFn={bindRef("postMarketOpen")}
            />
          )}
        />

        <Controller
          name="postMarketClose"
          control={control}
          render={({ field, fieldState }) => (
            <FormField
              fullWidth
              label="Post Market Close (HH:mm or HH:mm:ss)"
              {...field}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value || undefined)}
              error={!!fieldState.error}
              helper={
                fieldState.error?.message ??
                renderFieldHelper("postMarketClose")
              }
              inputRefFn={bindRef("postMarketClose")}
            />
          )}
        />

        <Controller
          name="holidayDatesJson"
          control={control}
          render={({ field, fieldState }) => (
            <FormField
              fullWidth
              multiline
              minRows={2}
              label="Holiday Dates JSON"
              {...field}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
              error={!!fieldState.error}
              helper={
                fieldState.error?.message ??
                renderFieldHelper("holidayDatesJson")
              }
              inputRefFn={bindRef("holidayDatesJson")}
            />
          )}
        />

        <Controller
          name="sessionRulesJson"
          control={control}
          render={({ field, fieldState }) => (
            <FormField
              fullWidth
              multiline
              minRows={2}
              label="Session Rules JSON"
              {...field}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
              error={!!fieldState.error}
              helper={
                fieldState.error?.message ??
                renderFieldHelper("sessionRulesJson")
              }
              inputRefFn={bindRef("sessionRulesJson")}
            />
          )}
        />

        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  name="isActive"
                />
              }
              label="Is Active"
            />
          )}
        />
      </Box>
    </DialogContent>
  );

  return (
    <FormDialogWrapper
      open={open}
      title={mode === "add" ? "Add Calendar Entry" : "Edit Calendar Entry"}
      submitting={formState.isSubmitting}
      mode={mode}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmitInternal)}
      errors={fieldErrors}
      showFieldLevel={false}
      submitLabels={{ add: "Create", edit: "Update" }}
      renderBody={renderBody}
    />
  );
};

export default MarketCalendarFormDialog;
