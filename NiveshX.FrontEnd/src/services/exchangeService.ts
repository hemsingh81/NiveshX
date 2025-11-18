// src/services/exchangeService.ts
import axiosInstance from "./axiosInstance";
import { withToast } from "../utils/toastUtils";
import { CountryResponse } from "./countryService";

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/exchange`;

export interface ExchangeResponse {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  country?: CountryResponse | null;
}

export interface CreateExchangeRequest {
  name: string;
  code: string;
  description?: string | null;
  countryId: string;
}

export interface UpdateExchangeRequest {
  name: string;
  code: string;
  description?: string | null;
  countryId: string;
  isActive: boolean;
}

export const getAllExchanges = async (): Promise<ExchangeResponse[]> => {
  const res = await withToast(() => axiosInstance.get<ExchangeResponse[]>(`${API_URL}`), {
    loading: "Loading exchanges..",
    success: "Exchanges loaded!",
  });
  return res.data;
};

export const getExchange = async (id: string): Promise<ExchangeResponse> => {
  const res = await withToast(() => axiosInstance.get<ExchangeResponse>(`${API_URL}/${id}`), {
    loading: "Loading...",
  });
  return res.data;
};

export const createExchange = async (payload: CreateExchangeRequest): Promise<ExchangeResponse> => {
  const res = await withToast(() => axiosInstance.post<ExchangeResponse>(`${API_URL}`, payload), {
    loading: "Creating Exchange...",
    success: "Exchange created!",
    collapseServerErrors: true,
  });
  return res.data;
};

export const updateExchange = async (id: string, payload: UpdateExchangeRequest): Promise<ExchangeResponse> => {
  const res = await withToast(() => axiosInstance.put<ExchangeResponse>(`${API_URL}/${id}`, payload), {
    loading: "Updating exchange...",
    success: "Exchange updated!",
    collapseServerErrors: true,
  });
  return res.data;
};

export const deleteExchange = async (id: string): Promise<void> => {
  await withToast(() => axiosInstance.delete(`${API_URL}/${id}`), {
    loading: "Deleting exchange...",
    success: "Exchange deleted!",
  });
};
