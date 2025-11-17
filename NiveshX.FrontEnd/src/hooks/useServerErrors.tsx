import { useCallback, useRef, useState } from "react";
import mapServerErrorsToFieldErrors from "../utils/validationMapper";

export type FieldErrors = Record<string, string[]>;

export default function useServerErrors() {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const bindRef = useCallback((name: string) => (el: HTMLInputElement | null) => {
    inputRefs.current[name] = el;
  }, []);

  const focusFirstError = useCallback((mapped: FieldErrors) => {
    const firstField = Object.keys(mapped)[0];
    if (!firstField || firstField === "__global") return;
    inputRefs.current[firstField]?.focus?.();
  }, []);

  const handleServerError = useCallback((err: any) => {
    const mapped = mapServerErrorsToFieldErrors(err);
    setFieldErrors(mapped);
    focusFirstError(mapped);
    return mapped;
  }, [focusFirstError]);

  const clearErrors = useCallback(() => setFieldErrors({}), []);

  return {
    fieldErrors,
    setFieldErrors,
    handleServerError,
    clearErrors,
    bindRef,
  } as const;
}
