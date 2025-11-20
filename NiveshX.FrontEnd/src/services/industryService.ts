// src/services/industryService.ts
import axiosInstance from "./axiosInstance";
import { withToast } from "../utils/toastUtils";

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/industry`;

export interface IndustryResponse {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface CreateIndustryRequest {
  name: string;
  description?: string | null;
}

export interface UpdateIndustryRequest {
  name: string;
  description?: string | null;
  isActive: boolean;
}

/**
 * Reads should NOT use withToast so react-query (or callers) can manage loading, dedupe and caching.
 */
export const getAllIndustries = async (): Promise<IndustryResponse[]> => {
  const res = await axiosInstance.get<IndustryResponse[]>(`${API_URL}`);
  return res.data;
};

/**
 * Mutations use withToast. Pass the per-request skip header so the axios interceptor won't
 * also display generic toasts while withToast manages loading/success/error UX.
 */
export const createIndustry = async (
  payload: CreateIndustryRequest
): Promise<IndustryResponse> => {
  const res = await withToast(
    () =>
      axiosInstance.post<IndustryResponse>(`${API_URL}`, payload, {
        headers: { "x-skip-error-toaster": "true" },
      }),
    {
      operationType: "create",
      // optional overrides:
      // loading: "Creating industry...",
      // success: "Industry created!",
    }
  );
  return res.data;
};

export const updateIndustry = async (
  id: string,
  payload: UpdateIndustryRequest
): Promise<IndustryResponse> => {
  const res = await withToast(
    () =>
      axiosInstance.put<IndustryResponse>(`${API_URL}/${id}`, payload, {
        headers: { "x-skip-error-toaster": "true" },
      }),
    {
      operationType: "update",
      // optional overrides:
      // loading: "Updating industry...",
      // success: "Industry updated!",
    }
  );
  return res.data;
};

export const deleteIndustry = async (id: string): Promise<void> => {
  await withToast(
    () =>
      axiosInstance.delete(`${API_URL}/${id}`, {
        headers: { "x-skip-error-toaster": "true" },
      }),
    {
      operationType: "delete",
      // optional overrides:
      // loading: "Deleting industry...",
      // success: "Industry deleted!",
    }
  );
};
