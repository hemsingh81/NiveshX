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
  const res = await withToast(
    () => axiosInstance.get<CountryResponse[]>(`${API_URL}`),
    {
      loading: "Loading countries...",
      success: "Countries loaded!",
      error: "Failed to load countries.",
    }
  );
  return res.data;
};

export const createCountry = async (
  payload: CreateCountryRequest
): Promise<CountryResponse> => {
  const res = await withToast(
    () => axiosInstance.post<CountryResponse>(`${API_URL}`, payload),
    {
      loading: "Creating country...",
      success: "Country created!",
      error: "Failed to create country.",
    }
  );
  return res.data;
};

export const updateCountry = async (
  id: string,
  payload: UpdateCountryRequest
): Promise<CountryResponse> => {
  const res = await withToast(
    () => axiosInstance.put<CountryResponse>(`${API_URL}/${id}`, payload),
    {
      loading: "Updating country...",
      success: "Country updated!",
      error: "Failed to update country.",
    }
  );
  return res.data;
};

export const deleteCountry = async (id: string): Promise<void> => {
  await withToast(() => axiosInstance.delete(`${API_URL}/${id}`), {
    loading: "Deleting country...",
    success: "Country deleted!",
    error: "Failed to delete country.",
  });
};
