// toastUtils.ts
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
  const wrappedRequest = async () => {
    try {
      const result = await request();
      return result;
    } catch (err) {
      throw err;
    }
  };

  return toast.promise(
    wrappedRequest(),
    {
      loading: options.loading || 'Processing...',
      success: options.success || 'Success!',
      error: options.error || 'Something went wrong.',
    }
  );
};
