import axiosInstance from "./axiosInstance";
import { withToast } from "../utils/toastUtils";

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/sector`;

export interface SectorResponse {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface CreateSectorRequest {
  name: string;
  description?: string | null;
}

export interface UpdateSectorRequest {
  name: string;
  description?: string | null;
  isActive: boolean;
}

export const getAllSectors = async (): Promise<SectorResponse[]> => {
  const res = await withToast(() => axiosInstance.get<SectorResponse[]>(`${API_URL}`), {
    loading: "Loading sectors...",
    success: "Sectors loaded!",
  });
  return res.data;
};

export const createSector = async (payload: CreateSectorRequest): Promise<SectorResponse> => {
  const res = await withToast(() => axiosInstance.post<SectorResponse>(`${API_URL}`, payload), {
    loading: "Creating sector...",
    success: "Sector created!",
  });
  return res.data;
};

export const updateSector = async (id: string, payload: UpdateSectorRequest): Promise<SectorResponse> => {
  const res = await withToast(() => axiosInstance.put<SectorResponse>(`${API_URL}/${id}`, payload), {
    loading: "Updating sector...",
    success: "Sector updated!",
  });
  return res.data;
};

export const deleteSector = async (id: string): Promise<void> => {
  await withToast(() => axiosInstance.delete(`${API_URL}/${id}`), {
    loading: "Deleting sector...",
    success: "Sector deleted!",
  });
};
