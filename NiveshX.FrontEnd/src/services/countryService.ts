// src/services/countryService.ts
import axiosInstance from "./axiosInstance";
import { withToast } from "../utils/toastUtils";

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/country`;

export interface CountryResponse {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface CreateCountryRequest {
  name: string;
  code: string;
}

export interface UpdateCountryRequest {
  name: string;
  code: string;
  isActive: boolean;
}

export const getAllCountries = async (): Promise<CountryResponse[]> => {
  const res = await axiosInstance.get<CountryResponse[]>(`${API_URL}`);
  return res.data;
};

export const createCountry = async (
  payload: CreateCountryRequest
): Promise<CountryResponse> => {
  const res = await withToast(
    () =>
      axiosInstance.post<CountryResponse>(`${API_URL}`, payload, {
        headers: { "x-skip-error-toaster": "true" },
      }),
    {
      operationType: "create",
      // optional overrides:
      // loading: "Creating country...",
      // success: "Country created!",
    }
  );
  return res.data;
};

export const updateCountry = async (
  id: string,
  payload: UpdateCountryRequest
): Promise<CountryResponse> => {
  const res = await withToast(
    () =>
      axiosInstance.put<CountryResponse>(`${API_URL}/${id}`, payload, {
        headers: { "x-skip-error-toaster": "true" },
      }),
    {
      operationType: "update",
      // optional overrides:
      // loading: "Updating country...",
      // success: "Country updated!",
    }
  );
  return res.data;
};

export const deleteCountry = async (id: string): Promise<void> => {
  await withToast(
    () =>
      axiosInstance.delete(`${API_URL}/${id}`, {
        headers: { "x-skip-error-toaster": "true" },
      }),
    {
      operationType: "delete",
      // optional overrides:
      // loading: "Deleting country...",
      // success: "Country deleted!",
    }
  );
};
