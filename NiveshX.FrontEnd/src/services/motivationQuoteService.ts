// src/services/motivationQuoteService.ts
import axiosInstance from "./axiosInstance";
import { withToast } from "../utils/toastUtils";

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/motivationQuote`;

export interface MotivationQuoteResponse {
  id: string;
  quote: string;
  author: string;
  isActive: boolean;
}

export interface CreateMotivationQuoteRequest {
  quote: string;
  author: string;
}

export interface UpdateMotivationQuoteRequest {
  quote: string;
  author: string;
  isActive: boolean;
}

/**
 * Reads should NOT use withToast so callers (or react-query) can manage loading, dedupe and caching.
 */
export const getAllQuotes = async (): Promise<MotivationQuoteResponse[]> => {
  const res = await axiosInstance.get<MotivationQuoteResponse[]>(`${API_URL}`);
  return res.data;
};

export const getAllActivesQuotes = async (): Promise<MotivationQuoteResponse[]> => {
  const res = await axiosInstance.get<MotivationQuoteResponse[]>(`${API_URL}/all-active`);
  return res.data;
};

/**
 * Mutations use withToast. Pass the per-request skip header so the axios interceptor won't
 * also display generic toasts while withToast manages loading/success/error UX.
 */
export const addQuote = async (payload: CreateMotivationQuoteRequest): Promise<MotivationQuoteResponse> => {
  const res = await withToast(
    () =>
      axiosInstance.post<MotivationQuoteResponse>(`${API_URL}`, payload, {
        headers: { "x-skip-error-toaster": "true" },
      }),
    {
      operationType: "create",
      // optional overrides:
      // loading: "Creating quote...",
      // success: "Quote created!",
    }
  );
  return res.data;
};

export const editQuote = async (payload: MotivationQuoteResponse): Promise<MotivationQuoteResponse> => {
  const res = await withToast(
    () =>
      axiosInstance.put<MotivationQuoteResponse>(`${API_URL}/${payload.id}`, payload, {
        headers: { "x-skip-error-toaster": "true" },
      }),
    {
      operationType: "update",
      // optional overrides:
      // loading: "Updating quote...",
      // success: "Quote updated!",
    }
  );
  return res.data;
};

export const deleteQuote = async (id: string): Promise<void> => {
  await withToast(
    () =>
      axiosInstance.delete(`${API_URL}/${id}`, {
        headers: { "x-skip-error-toaster": "true" },
      }),
    {
      operationType: "delete",
      // optional overrides:
      // loading: "Deleting quote...",
      // success: "Quote deleted!",
    }
  );
};
