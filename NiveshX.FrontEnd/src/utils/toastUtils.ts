// src/utils/toastUtils.ts
import toast from "react-hot-toast";
import axiosInstance from "../services/axiosInstance"; // adjust path if needed
import showServerErrorsAsSingleToast from "./toastErrors";

export interface ToastOptions {
  loading?: string;
  success?: string;
  error?: string;
  showGenericError?: boolean;
  suppressGlobalError?: boolean;
}

// counter to support concurrent withToast calls
let _withToastCounter = 0;

export const withToast = async <T>(
  request: () => Promise<T>,
  options: ToastOptions = {}
): Promise<T> => {
  const {
    loading = "Processing...",
    success = "Success",
    error: genericErrorText = "Something went wrong",
    showGenericError = false,
  } = options;

  // mark that a withToast call is in-flight (instruct interceptor to skip toasts)
  _withToastCounter += 1;
  if (_withToastCounter === 1 && axiosInstance) {
    try {
      (axiosInstance.defaults.headers as any).common = {
        ...(axiosInstance.defaults.headers as any).common,
        "x-skip-error-toaster": "true",
      };
    } catch {
      /* ignore */
    }
  }

  const loadingToastId = `with-toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  toast.loading(loading, { id: loadingToastId });

  try {
    const result = await request();

    // replace loading with success (update by id)
    toast.success(success, { id: loadingToastId });
    return result;
  } catch (err: any) {
    // show mapped server error toast once
    try {
      showServerErrorsAsSingleToast(err);
    } catch {
      if (showGenericError) {
        toast.error(genericErrorText, { id: loadingToastId });
      } else {
        // replace loading with a generic error toast if mapping isn't available
        toast.error(genericErrorText, { id: loadingToastId });
      }
    }

    // ensure we return a rejected promise so callers can handle errors
    throw err;
  } finally {
    // cleanup header flag only when no other withToast is running
    _withToastCounter = Math.max(0, _withToastCounter - 1);
    if (_withToastCounter === 0 && axiosInstance) {
      try {
        const common = (axiosInstance.defaults.headers as any).common || {};
        if (common["x-skip-error-toaster"]) {
          const { ["x-skip-error-toaster"]: _, ...rest } = common;
          (axiosInstance.defaults.headers as any).common = rest;
        }
      } catch {
        /* ignore */
      }
    }
  }
};

export default withToast;
