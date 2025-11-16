// src/utils/toastUtils.ts
import toast from "react-hot-toast";
import showServerErrorsAsSingleToast from "./toastErrors";

export interface ToastOptions {
  loading?: string;
  success?: string;
  error?: string; // legacy generic text
  showGenericError?: boolean; // if true, show a simple generic error toast in addition (rare)
  collapseServerErrors?: boolean; // not used here; we use single multiline toast by default
  suppressGlobalError?:boolean;
}

export const withToast = async <T>(
  request: () => Promise<T>,
  options: ToastOptions = {}
): Promise<T> => {
  const { loading, success, error: genericErrorText, showGenericError } = options;
  const shouldShowGeneric = !!showGenericError;

  const wrappedRequest = async () => {
    try {
      return await request();
    } catch (err: any) {
      // Respect per-request header to skip toast if present
      try {
        const reqConfig = (err?.config ?? {}) as Record<string, any>;
        const skipHeader = reqConfig?.headers?.["x-skip-error-toaster"] ?? reqConfig?.headers?.["X-Skip-Error-Toaster"];
        if (skipHeader === "true" || skipHeader === true) {
          throw err; // do nothing, rethrow
        }
      } catch {
        // ignore and continue
      }

      // Remove any existing error toasts to avoid duplicates
      try {
        toast.dismiss(); // dismiss all toasts (or use a custom id strategy if you prefer)
      } catch {
        // swallow
      }

      // Show the single multiline server error toast (this is the only toast you will see)
      try {
        showServerErrorsAsSingleToast(err);
      } catch {
        // fallback: show a simple generic toast if mapping fails or something else goes wrong
        if (shouldShowGeneric) toast.error(genericErrorText ?? "Something went wrong.");
        else toast.error("Something went wrong.");
      }

      // Optionally show an extra generic toast if explicitly asked (rare)
      if (shouldShowGeneric) {
        toast.error(genericErrorText ?? "Something went wrong.");
      }

      throw err;
    }
  };

  // Ensure toast.promise does not produce its own error toast — pass empty string when we don't want it.
  return toast.promise(wrappedRequest(), {
    loading: loading ?? "Processing...",
    success: success ?? "Success!",
    error: "", // crucial: suppress toast.promise's error toast (we show server toast manually)
  }) as Promise<T>;
};
