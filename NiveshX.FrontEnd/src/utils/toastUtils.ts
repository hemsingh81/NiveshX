import toast from 'react-hot-toast';

interface ToastOptions {
  loading?: string;
  success?: string;
  error?: string;
  suppressGlobalError?: boolean;
}

export const withToast = async <T>(
  request: () => Promise<T>,
  options: ToastOptions
): Promise<T> => {
  return toast.promise(
    request(),
    {
      loading: options.loading || 'Processing...',
      success: options.success || 'Success!',
      error: options.error || 'Something went wrong.',
    }
  );
};
