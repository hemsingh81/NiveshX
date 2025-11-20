// src/utils/toastUtils.ts
import toast from "react-hot-toast";
import showServerErrorsAsSingleToast from "./toastErrors";
import { toasterConfig, OperationType } from "./toasterConfig";

export interface ToastOptions {
  loading?: string;
  success?: string;
  error?: string;
  // whether to show a generic error toast when mapping fails
  showGenericError?: boolean;
  // prefer caller-provided control over global config (if true, override global settings)
  forceShowSuccess?: boolean;
  // operation type used to consult global config
  operationType?: OperationType;
}

/**
 * withToast: wraps an async request-producing function and optionally shows loading/success/error toasts.
 *
 * Important: this function no longer mutates axios defaults. If you want to suppress axios interceptor toasts
 * for a wrapped axios call, pass the header "x-skip-error-toaster": "true" in the request config you call.
 *
 * Example:
 *  withToast(() => axiosInstance.post(url, payload, { headers: { "x-skip-error-toaster": "true" } }), { operationType: "create" })
 */
export const withToast = async <T>(
  request: () => Promise<T>,
  options: ToastOptions = {}
): Promise<T> => {
  const {
    loading,
    success,
    error: genericErrorText = "Something went wrong",
    showGenericError = false,
    forceShowSuccess = false,
    operationType = "other",
  } = options;

  // decide whether to show loading / success toasts using config (caller overrides if provided)
  const showLoading = typeof loading !== "undefined" ? true : !!toasterConfig.loading[operationType];
  const showSuccessGlobally = !!toasterConfig.success[operationType];
  const shouldShowSuccess = forceShowSuccess || (typeof success !== "undefined" ? true : showSuccessGlobally);

  const loadingText = loading ?? toasterConfig.messages[operationType]?.loading ?? "Processing...";
  const successText = success ?? toasterConfig.messages[operationType]?.success ?? "Success";

  const toastId = showLoading ? `with-toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` : undefined;
  if (showLoading && toastId) toast.loading(loadingText, { id: toastId });

  try {
    const result = await request();

    if (shouldShowSuccess && toastId) {
      toast.success(successText, { id: toastId });
    } else if (shouldShowSuccess && !toastId) {
      toast.success(successText);
    } else if (toastId) {
      // if loading shown but we don't want success, simply dismiss the loading toast
      toast.dismiss(toastId);
    }

    return result;
  } catch (err: any) {
    // If mapping enabled globally, try to show mapped errors
    try {
      if (toasterConfig.mappedError) {
        showServerErrorsAsSingleToast(err);
      } else {
        // fallback generic
        if (showGenericError) toast.error(genericErrorText, { id: toastId });
      }
    } catch {
      if (showGenericError) {
        toast.error(genericErrorText, { id: toastId });
      } else if (!toasterConfig.mappedError) {
        // if mapping disabled, ensure at least generic shown
        toast.error(genericErrorText, { id: toastId });
      }
    }

    // rethrow so callers can handle the error
    throw err;
  }
};

export default withToast;
