// src/hooks/useServerErrors.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import mapServerErrorsToFieldErrors, { ServerErrorPayload } from "../utils/validationMapper";

export type FieldErrors = Record<string, string[]>;

// A Focusable can be an HTMLElement (input/select/div), or an object exposing focus()
export type Focusable = HTMLElement | { focus?: () => void } | null;

export default function useServerErrors(options?: {
  preservePath?: boolean;
  autoFocus?: boolean;
  maxMessageLength?: number;
}) {
  const { preservePath = false, autoFocus = true, maxMessageLength = 1000 } = options ?? {};

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const inputRefs = useRef<Record<string, Focusable>>({});
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Generic ref binder: works with HTML elements and custom focusable objects
  const bindRef = useCallback(<T extends Focusable = Focusable>(name: string) => (el: T) => {
    inputRefs.current[name] = el ?? null;
  }, []);

  const focusField = useCallback((name: string) => {
    if (!name) return;
    const target = inputRefs.current[name];
    if (!target) return;
    try {
      // common DOM elements and custom focus method
      if (typeof (target as any).focus === "function") (target as any).focus();
    } catch {
      // ignore focus errors
    }
  }, []);

  // Choose a sensible field to focus: prefer first mapped key that has a bound ref
  const focusFirstError = useCallback((mapped: FieldErrors) => {
    if (!autoFocus) return;
    const keys = Object.keys(mapped);
    if (!keys.length) return;
    // Prefer non-global keys with bound refs
    for (const k of keys) {
      if (k === "__global") continue;
      if (inputRefs.current[k]) {
        focusField(k);
        return;
      }
    }
    // If none bound, try any non-global key
    const firstNonGlobal = keys.find((k) => k !== "__global");
    if (firstNonGlobal) focusField(firstNonGlobal);
  }, [autoFocus, focusField]);

  const truncateMessages = useCallback((m: FieldErrors) => {
    if (!maxMessageLength) return m;
    const out: FieldErrors = {};
    for (const [k, arr] of Object.entries(m)) {
      out[k] = arr.map((s) => (s.length > maxMessageLength ? s.slice(0, maxMessageLength) + "…" : s));
    }
    return out;
  }, [maxMessageLength]);

  // Map server error, set state safely, and focus
  const handleServerError = useCallback((err: any) => {
    // mapServerErrorsToFieldErrors may accept options in your version; pass preservePath if supported
    // If your validationMapper doesn't accept options, remove the second arg
    // @ts-ignore allow optional argument if mapper supports it
    const mapped = (mapServerErrorsToFieldErrors as any)(err, { preservePath }) as FieldErrors;
    const truncated = truncateMessages(mapped);
    if (mounted.current) setFieldErrors(truncated);
    focusFirstError(truncated);
    return truncated;
  }, [focusFirstError, preservePath, truncateMessages]);

  const clearErrors = useCallback(() => {
    if (mounted.current) setFieldErrors({});
  }, []);

  // Adapter: apply mapped errors into react-hook-form's setError or Formik setFieldError
  const applyToForm = useCallback(
    (mapped: FieldErrors, applyFn: (field: string, message: string) => void) => {
      Object.entries(mapped).forEach(([k, msgs]) => {
        if (k === "__global") return;
        applyFn(k, msgs[0] ?? msgs.join("; "));
      });
    },
    []
  );

  return {
    fieldErrors,
    setFieldErrors,
    handleServerError,
    clearErrors,
    bindRef,
    focusField,
    applyToForm,
  } as const;
}
