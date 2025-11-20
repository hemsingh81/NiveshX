// src/services/marketCalendarService.ts
import axiosInstance from "./axiosInstance";
import { withToast } from "../utils/toastUtils";

const BASE = "/marketcalendar"; // ensure this matches your backend route

export type MarketCalendarEntry = {
  id: string;
  exchangeId: string;
  exchange?: { id: string; name: string } | null;

  regularOpenTime?: string | null;
  regularCloseTime?: string | null;
  preMarketOpen?: string | null;
  preMarketClose?: string | null;
  postMarketOpen?: string | null;
  postMarketClose?: string | null;

  holidayDatesJson?: string | null;
  sessionRulesJson?: string | null;
  isActive: boolean;

  createdAt?: string;
  updatedAt?: string;

  rowVersion?: string | null;
};

export type CreateMarketCalendarRequest = {
  exchangeId: string;
  regularOpenTime?: string | null;
  regularCloseTime?: string | null;
  preMarketOpen?: string | null;
  preMarketClose?: string | null;
  postMarketOpen?: string | null;
  postMarketClose?: string | null;
  holidayDatesJson?: string | null;
  sessionRulesJson?: string | null;
  isActive?: boolean;
};

export type UpdateMarketCalendarRequest = {
  rowVersion: string;
  exchangeId: string;
  regularOpenTime?: string | null;
  regularCloseTime?: string | null;
  preMarketOpen?: string | null;
  preMarketClose?: string | null;
  postMarketOpen?: string | null;
  postMarketClose?: string | null;
  holidayDatesJson?: string | null;
  sessionRulesJson?: string | null;
  isActive?: boolean;
};

export const getMarketCalendar = async (params?: { exchangeId?: string; from?: string; to?: string }) => {
  const res = await axiosInstance.get<MarketCalendarEntry[]>(BASE, { params });
  return res.data;
};

export const getMarketCalendarById = async (id: string) => {
  const res = await axiosInstance.get<MarketCalendarEntry>(`${BASE}/${id}`);
  return res.data;
};

export const createMarketCalendar = async (payload: CreateMarketCalendarRequest) => {
  const res = await withToast(
    () =>
      axiosInstance.post<MarketCalendarEntry>(BASE, payload, {
        headers: { "x-skip-error-toaster": "true" },
      }),
    {
      operationType: "create",
      // optional overrides:
      // loading: "Creating calendar entry...",
      // success: "Calendar entry created!",
    }
  );
  return res.data;
};

export const updateMarketCalendar = async (id: string, payload: UpdateMarketCalendarRequest) => {
  const res = await withToast(
    () =>
      axiosInstance.put<MarketCalendarEntry>(`${BASE}/${id}`, payload, {
        headers: { "x-skip-error-toaster": "true" },
      }),
    {
      operationType: "update",
      // optional overrides:
      // loading: "Updating calendar entry...",
      // success: "Calendar entry updated!",
    }
  );
  return res.data;
};

export const deleteMarketCalendar = async (id: string) => {
  await withToast(
    () =>
      axiosInstance.delete(`${BASE}/${id}`, {
        headers: { "x-skip-error-toaster": "true" },
      }),
    {
      operationType: "delete",
      // optional overrides:
      // loading: "Deleting entry...",
      // success: "Entry deleted!",
    }
  );
};
