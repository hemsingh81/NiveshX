// src/utils/toastUtils.ts
import toast from "react-hot-toast";
import showServerErrorsAsSingleToast from "./toastErrors";
import { toasterConfig, OperationType } from "./toasterConfig";

export interface ToastOptions {
  loading?: string;
  success?: string;
  error?: string;
  showGenericError?: boolean;
  forceShowSuccess?: boolean;
  operationType?: OperationType;
}

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

  const showLoading = typeof loading !== "undefined" ? true : !!toasterConfig.loading[operationType];
  const showSuccessGlobally = !!toasterConfig.success[operationType];
  const shouldShowSuccess = forceShowSuccess || (typeof success !== "undefined" ? true : showSuccessGlobally);

  const loadingText = loading ?? toasterConfig.messages[operationType]?.loading ?? "Processing...";
  const successText = success ?? toasterConfig.messages[operationType]?.success ?? "Success";
  const errorText = genericErrorText;

  const toastId = showLoading ? `with-toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` : undefined;
  if (showLoading && toastId) toast.loading(loadingText, { id: toastId });

  try {
    const result = await request();

    if (shouldShowSuccess) {
      if (toastId) {
        toast.success(successText, { id: toastId });
      } else {
        toast.success(successText);
      }
    } else if (toastId) {
      // dismiss loading toast if we don't want a success replacement
      toast.dismiss(toastId);
    }

    return result;
  } catch (err: any) {
    // Replace loading toast with mapped or generic error toast
    try {
      if (toasterConfig.mappedError) {
        // show mapped server errors as a single toast; ensure we replace loading toast by passing id when possible
        if (toastId) {
          // mapped toast implementation may call toast.error internally without id; to ensure replacement,
          // dismiss the loading toast first then show mapped errors
          toast.dismiss(toastId);
        }
        showServerErrorsAsSingleToast(err);
      } else {
        // mapped errors disabled: show generic error
        if (toastId) {
          toast.error(errorText, { id: toastId });
        } else {
          toast.error(errorText);
        }
      }
    } catch {
      // fallback: ensure loading is dismissed and show generic error
      if (toastId) toast.error(errorText, { id: toastId });
      else toast.error(errorText);
    }

    throw err;
  }
};

export default withToast;
