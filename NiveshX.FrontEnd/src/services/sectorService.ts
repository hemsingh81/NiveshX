// src/services/sectorService.ts
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
  const res = await axiosInstance.get<SectorResponse[]>(`${API_URL}`);
  return res.data;
};

export const createSector = async (payload: CreateSectorRequest): Promise<SectorResponse> => {
  const res = await withToast(
    () =>
      axiosInstance.post<SectorResponse>(`${API_URL}`, payload, {
        headers: { "x-skip-error-toaster": "true" },
      }),
    {
      operationType: "create",
      // optional: override loading/success messages here
      // loading: "Creating sector...",
      // success: "Sector created!",
    }
  );
  return res.data;
};

export const updateSector = async (id: string, payload: UpdateSectorRequest): Promise<SectorResponse> => {
  const res = await withToast(
    () =>
      axiosInstance.put<SectorResponse>(`${API_URL}/${id}`, payload, {
        headers: { "x-skip-error-toaster": "true" },
      }),
    {
      operationType: "update",
      // loading: "Updating sector...",
      // success: "Sector updated!",
    }
  );
  return res.data;
};

export const deleteSector = async (id: string): Promise<void> => {
  await withToast(
    () =>
      axiosInstance.delete(`${API_URL}/${id}`, {
        headers: { "x-skip-error-toaster": "true" },
      }),
    {
      operationType: "delete",
      // loading: "Deleting sector...",
      // success: "Sector deleted!",
    }
  );
};
