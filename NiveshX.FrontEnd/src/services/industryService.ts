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

export const getAllIndustries = async (): Promise<IndustryResponse[]> => {
  console.log("----------- Industry");
  const res = await withToast(
    () => axiosInstance.get<IndustryResponse[]>(`${API_URL}`),
    {
      loading: "Loading industries...",
      success: "Industries loaded!",
    }
  );
  return res.data;
};

export const createIndustry = async (
  payload: CreateIndustryRequest
): Promise<IndustryResponse> => {
  const res = await withToast(
    () => axiosInstance.post<IndustryResponse>(`${API_URL}`, payload),
    {
      loading: "Creating industry...",
      success: "Industry created!",
    }
  );
  return res.data;
};

export const updateIndustry = async (
  id: string,
  payload: UpdateIndustryRequest
): Promise<IndustryResponse> => {
  const res = await withToast(
    () => axiosInstance.put<IndustryResponse>(`${API_URL}/${id}`, payload),
    {
      loading: "Updating industry...",
      success: "Industry updated!",
    }
  );
  return res.data;
};

export const deleteIndustry = async (id: string): Promise<void> => {
  await withToast(() => axiosInstance.delete(`${API_URL}/${id}`), {
    loading: "Deleting industry...",
    success: "Industry deleted!",
  });
};
