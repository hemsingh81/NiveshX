// src/hooks/useMarketCalendar.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../services/axiosInstance";
import type {
  MarketCalendarEntry,
  CreateMarketCalendarRequest,
  UpdateMarketCalendarRequest,
} from "../services/marketCalendarService";
import { withToast } from "../utils/toastUtils";

const BASE = "/marketcalendar";

export const useMarketCalendar = (opts?: { exchangeId?: string; from?: string; to?: string }) => {
  const key = ["marketCalendar", opts?.exchangeId ?? "", opts?.from ?? "", opts?.to ?? ""];
  return useQuery<MarketCalendarEntry[], Error>({
    queryKey: key,
    queryFn: async ({ signal }) => {
      const res = await axiosInstance.get<MarketCalendarEntry[]>(BASE, { params: opts, signal });
      return res.data;
    },
    staleTime: 60_000,
    retry: 2,
  });
};

export const useCreateMarketCalendar = () => {
  const qc = useQueryClient();
  return useMutation<MarketCalendarEntry, unknown, CreateMarketCalendarRequest>({
    mutationFn: async (payload) => {
      const axiosRes = await withToast(() => axiosInstance.post<MarketCalendarEntry>(BASE, payload), {
        loading: "Creating calendar entry...",
        success: "Created",
      });
      return axiosRes.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketCalendar"] });
    },
  });
};

export const useUpdateMarketCalendar = () => {
  const qc = useQueryClient();
  return useMutation<MarketCalendarEntry, unknown, { id: string; payload: UpdateMarketCalendarRequest }>({
    mutationFn: async ({ id, payload }) => {
      const axiosRes = await withToast(() => axiosInstance.put<MarketCalendarEntry>(`${BASE}/${id}`, payload), {
        loading: "Updating calendar entry...",
        success: "Updated",
      });
      return axiosRes.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketCalendar"] });
    },
  });
};

export const useDeleteMarketCalendar = () => {
  const qc = useQueryClient();
  return useMutation<void, unknown, string>({
    mutationFn: async (id: string) => {
      await withToast(() => axiosInstance.delete(`${BASE}/${id}`), {
        loading: "Deleting entry...",
        success: "Deleted",
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["marketCalendar"] }),
  });
};
