// src/utils/validationMapper.ts
export type ServerErrorPayload =
  | {
      type?: string;
      title?: string;
      status?: number;
      errors?: Record<string, string[]>;
      message?: string;
      detail?: string;
    }
  | {
      errors?: { field?: string; key?: string; message?: string }[];
      message?: string;
      title?: string;
    }
  | { message?: string; title?: string };

const pascalToCamel = (s: string) =>
  s.length > 0 ? s.charAt(0).toLowerCase() + s.slice(1) : s;

/**
 * Normalize keys coming from server or binder:
 * - "$.countryId" => "countryId"
 * - "CountryId" => "countryId"
 * - "items[0].name" => "name"
 * - "request" => "__global"
 */
const normalizeKey = (rawKey: unknown): string => {
  if (typeof rawKey !== "string" || !rawKey.trim()) return "__global";
  let key = rawKey.trim();

  if (key.startsWith("$.") || key.startsWith("$[")) key = key.slice(2);
  key = key.replace(/\[(\d+)\]/g, ".$1");

  const parts = key.split(".").filter(Boolean);
  const last = parts.length ? parts[parts.length - 1] : key;

  if (!last) return "__global";
  if (last.toLowerCase() === "request") return "__global";

  return /^[A-Z]/.test(last) ? pascalToCamel(last) : last;
};

const splitDetailIntoMessages = (detail: string): string[] => {
  if (!detail) return [];
  // Split on sentence boundaries but avoid splitting urls etc — simple split on period followed by space.
  const parts = detail
    .split(/(?<=\.)\s+/g)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : [detail];
};

export function mapServerErrorsToFieldErrors(err: any): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  // Accept axios-style error (err.response.data) or a raw payload
  const data: any = err?.response?.data ?? err ?? null;
  if (!data) {
    if (err?.message) result["__global"] = [String(err.message)];
    return result;
  }

  // 1) If errors is an object map: { errors: { field: [msgs] } }
  if (
    data &&
    "errors" in data &&
    data.errors &&
    typeof data.errors === "object" &&
    !Array.isArray(data.errors)
  ) {
    Object.entries(data.errors as Record<string, unknown>).forEach(([key, val]) => {
      const normalizedKey = normalizeKey(key);
      const messages = Array.isArray(val) ? (val as unknown[]).map(String) : [String(val ?? "")];
      result[normalizedKey] = (result[normalizedKey] || []).concat(messages);
    });
    return result;
  }

  // 2) If errors is an array: [{ field, message }]
  if (data && "errors" in data && Array.isArray(data.errors)) {
    (data.errors as any[]).forEach((it) => {
      const rawField = it?.field ?? it?.key ?? "__global";
      const normalizedKey = normalizeKey(rawField);
      const msg = String(it?.message ?? it?.msg ?? it?.error ?? JSON.stringify(it));
      result[normalizedKey] = (result[normalizedKey] || []).concat(msg);
    });
    return result;
  }

  // 3) If the payload follows the pattern { title, status, detail } (e.g. your example),
  //    map title and detail to __global messages. Split detail into sentences if needed.
  if (data && (data.title || (data as any).detail || data.message)) {
    if (data.title) {
      result["__global"] = (result["__global"] || []).concat(String(data.title));
    }
    if ((data as any).detail) {
      const msgs = splitDetailIntoMessages(String((data as any).detail));
      result["__global"] = (result["__global"] || []).concat(msgs);
    }
    if (data.message && !data.detail) {
      // if message exists but detail did not, include message
      result["__global"] = (result["__global"] || []).concat(String(data.message));
    }
    // Return early because this payload is top-level global error style
    if (Object.keys(result).length > 0) return result;
  }

  // 4) Defensive: if data.errors exists but didn't match map/array shapes, iterate entries
  if (data && "errors" in data && data.errors && typeof data.errors === "object") {
    try {
      for (const [k, v] of Object.entries(data.errors as Record<string, unknown>)) {
        const normalizedKey = normalizeKey(k);
        if (Array.isArray(v)) {
          (v as unknown[]).forEach((m) => (result[normalizedKey] = (result[normalizedKey] || []).concat(String(m))));
        } else {
          result[normalizedKey] = (result[normalizedKey] || []).concat(String(v ?? ""));
        }
      }
      if (Object.keys(result).length) return result;
    } catch {
      // fall through to fallback
    }
  }

  // 5) Fallback: if data is string or object, put in __global
  if (typeof data === "string") {
    result["__global"] = (result["__global"] || []).concat(data);
  } else {
    try {
      result["__global"] = (result["__global"] || []).concat(JSON.stringify(data));
    } catch {
      result["__global"] = (result["__global"] || []).concat(String(data));
    }
  }

  return result;
}

export default mapServerErrorsToFieldErrors;
