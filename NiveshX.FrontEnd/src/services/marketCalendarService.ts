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

  // RowVersion as base64 string (server sends byte[] -> JSON base64)
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
  // RowVersion required by server: provide base64 string
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
  const res = await withToast(() => axiosInstance.post<MarketCalendarEntry>(BASE, payload), {
    loading: "Creating calendar entry...",
    success: "Calendar entry created!",
  });
  return res.data;
};

export const updateMarketCalendar = async (id: string, payload: UpdateMarketCalendarRequest) => {
  const res = await withToast(() => axiosInstance.put<MarketCalendarEntry>(`${BASE}/${id}`, payload), {
    loading: "Updating calendar entry...",
    success: "Calendar entry updated!",
  });
  return res.data;
};

export const deleteMarketCalendar = async (id: string) => {
  await withToast(() => axiosInstance.delete(`${BASE}/${id}`), {
    loading: "Deleting entry...",
    success: "Entry deleted!",
  });
};
