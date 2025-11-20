// src/services/classificationTagService.ts
import axiosInstance from "./axiosInstance";
import { withToast } from "../utils/toastUtils";

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/classificationtag`;

export interface ClassificationTagResponse {
  id: string;
  name: string;
  category?: string | null;
  description?: string | null;
  isActive: boolean;
}

export interface CreateClassificationTagRequest {
  name: string;
  category?: string | null;
  description?: string | null;
}

export interface UpdateClassificationTagRequest {
  name: string;
  category?: string | null;
  description?: string | null;
  isActive: boolean;
}

export const getAllClassificationTags = async (): Promise<ClassificationTagResponse[]> => {
  const res = await axiosInstance.get<ClassificationTagResponse[]>(`${API_URL}`);
  return res.data;
};

export const createClassificationTag = async (
  payload: CreateClassificationTagRequest
): Promise<ClassificationTagResponse> => {
  const res = await withToast(
    () =>
      axiosInstance.post<ClassificationTagResponse>(`${API_URL}`, payload, {
        headers: { "x-skip-error-toaster": "true" },
      }),
    {
      operationType: "create",
      // optional: override messages here if desired
      // loading: "Creating tag...",
      // success: "Tag created!",
    }
  );
  return res.data;
};

export const updateClassificationTag = async (
  id: string,
  payload: UpdateClassificationTagRequest
): Promise<ClassificationTagResponse> => {
  const res = await withToast(
    () =>
      axiosInstance.put<ClassificationTagResponse>(`${API_URL}/${id}`, payload, {
        headers: { "x-skip-error-toaster": "true" },
      }),
    {
      operationType: "update",
      // optional: override messages here if desired
      // loading: "Updating tag...",
      // success: "Tag updated!",
    }
  );
  return res.data;
};

export const deleteClassificationTag = async (id: string): Promise<void> => {
  await withToast(
    () =>
      axiosInstance.delete(`${API_URL}/${id}`, {
        headers: { "x-skip-error-toaster": "true" },
      }),
    {
      operationType: "delete",
      // optional: override messages here if desired
      // loading: "Deleting tag...",
      // success: "Tag deleted!",
    }
  );
};
