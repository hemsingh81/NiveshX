//src/hooks/useExchanges.ts
import { useQuery, useMutation, useQueryClient, QueryFunctionContext } from "@tanstack/react-query";
import axiosInstance from "../services/axiosInstance";
import { withToast } from "../utils/toastUtils";
import type { ExchangeResponse, CreateExchangeRequest, UpdateExchangeRequest } from "../services";

const BASE = "/exchange";

/**
 * Fetch exchanges
 */
export const useExchanges = () =>
  useQuery<ExchangeResponse[], Error>({
    queryKey: ["exchanges"],
    queryFn: async ({ signal }) => {
      const res = await axiosInstance.get<ExchangeResponse[]>(BASE, { signal });
      return res.data;
    },
    staleTime: 60_000,
    retry: 2,
  });
/**
 * Create exchange (object-style useMutation)
 * generics: <TData, TError, TVariables>
 */
export const useCreateExchange = () => {
  const qc = useQueryClient();

  return useMutation<ExchangeResponse, unknown, CreateExchangeRequest>({
    // mutationFn performs the async work and returns TData
    mutationFn: async (payload: CreateExchangeRequest) => {
      const axiosRes = await withToast(() => axiosInstance.post<ExchangeResponse>(BASE, payload), {
        loading: "Creating...",
        success: "Created!",
      });
      return axiosRes.data as ExchangeResponse;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exchanges"] });
    },
  });
};

/**
 * Update exchange
 * TVariables: { id: string; payload: UpdateExchangeRequest }
 */
export const useUpdateExchange = () => {
  const qc = useQueryClient();

  return useMutation<ExchangeResponse, unknown, { id: string; payload: UpdateExchangeRequest }>({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateExchangeRequest }) => {
      const axiosRes = await withToast(() => axiosInstance.put<ExchangeResponse>(`${BASE}/${id}`, payload), {
        loading: "Updating...",
        success: "Updated!",
      });
      return axiosRes.data as ExchangeResponse;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exchanges"] });
    },
  });
};

/**
 * Delete exchange
 * TVariables: string (id)
 */
export const useDeleteExchange = () => {
  const qc = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: async (id: string) => {
      await withToast(() => axiosInstance.delete(`${BASE}/${id}`), { loading: "Deleting...", success: "Deleted!" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exchanges"] });
    },
  });
};
