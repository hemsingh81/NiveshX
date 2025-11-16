// src/services/stockMarketService.ts
import axiosInstance from "./axiosInstance";
import { withToast } from "../utils/toastUtils";
import { CountryResponse } from "./countryService";

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/stockmarket`;

export interface StockMarketResponse {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  country?: CountryResponse | null;
}

export interface CreateStockMarketRequest {
  name: string;
  code: string;
  description?: string | null;
  countryId: string;
}

export interface UpdateStockMarketRequest {
  name: string;
  code: string;
  description?: string | null;
  countryId: string;
  isActive: boolean;
}

export const getAllStockMarkets = async (): Promise<StockMarketResponse[]> => {
  const res = await withToast(() => axiosInstance.get<StockMarketResponse[]>(`${API_URL}`), {
    loading: "Loading stock markets...",
    success: "Stock markets loaded!",
    error: "Failed to load stock markets.",
  });
  return res.data;
};

export const getStockMarket = async (id: string): Promise<StockMarketResponse> => {
  const res = await withToast(() => axiosInstance.get<StockMarketResponse>(`${API_URL}/${id}`), {
    loading: "Loading...",
    error: "Failed to load stock market.",
  });
  return res.data;
};

export const createStockMarket = async (payload: CreateStockMarketRequest): Promise<StockMarketResponse> => {
  const res = await withToast(() => axiosInstance.post<StockMarketResponse>(`${API_URL}`, payload), {
    loading: "Creating stock market...",
    success: "Stock market created!",
    error: "Failed to create stock market.",
  });
  return res.data;
};

export const updateStockMarket = async (id: string, payload: UpdateStockMarketRequest): Promise<StockMarketResponse> => {
  const res = await withToast(() => axiosInstance.put<StockMarketResponse>(`${API_URL}/${id}`, payload), {
    loading: "Updating stock market...",
    success: "Stock market updated!",
    error: "Failed to update stock market.",
  });
  return res.data;
};

export const deleteStockMarket = async (id: string): Promise<void> => {
  await withToast(() => axiosInstance.delete(`${API_URL}/${id}`), {
    loading: "Deleting stock market...",
    success: "Stock market deleted!",
    error: "Failed to delete stock market.",
  });
};
