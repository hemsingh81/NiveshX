import axiosInstance from "./axiosInstance";
import { withToast } from "../utils/toastUtils";

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/motivationQuote`;

export interface MotivationQuoteResponse {
  id: string; // Guid from backend
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

export const getAllQuotes = async (): Promise<MotivationQuoteResponse[]> => {
  const res = await withToast(
    () => axiosInstance.get<MotivationQuoteResponse[]>(`${API_URL}`),
    { loading: "Loading quotes...", success: "Quotes loaded!" }
  );
  return res.data;
};

export const getAllActivesQuotes = async (): Promise<MotivationQuoteResponse[]> => {
  const res = await withToast(
    () => axiosInstance.get<MotivationQuoteResponse[]>(`${API_URL}/all-active`),
    { loading: "Loading quotes...", success: "Quotes loaded!" }
  );
  return res.data;
};

export const addQuote = async (payload: CreateMotivationQuoteRequest): Promise<MotivationQuoteResponse> => {
  const res = await withToast(
    () => axiosInstance.post<MotivationQuoteResponse>(`${API_URL}`, payload),
    { loading: "Creating quote...", success: "Quote created!" }
  );
  return res.data;
};

export const editQuote = async (payload: MotivationQuoteResponse): Promise<MotivationQuoteResponse> => {
  const res = await withToast(
    () => axiosInstance.put<MotivationQuoteResponse>(`${API_URL}/${payload.id}`, payload),
    { loading: "Updating quote...", success: "Quote updated!" }
  );
  return res.data;
};

export const deleteQuote = async (id: string): Promise<void> => {
  await withToast(
    () => axiosInstance.delete(`${API_URL}/${id}`),
    { loading: "Deleting quote...", success: "Quote deleted!" }
  );
};
