// src/utils/validationMapper.ts
export type ServerErrorPayload =
  | { errors?: Record<string, string[]>; message?: string }
  | { errors?: { field: string; message: string }[]; message?: string }
  | { message?: string };

const toCamel = (s: string) =>
  s.replace(/^[A-Z]/, (m) => m.toLowerCase()).replace(/\s+/g, "");

export function mapServerErrorsToFieldErrors(
  err: any
): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  const data = err?.response?.data;
  if (!data) {
    if (err?.message) result["__global"] = [String(err.message)];
    return result;
  }

  // Shape A: errors object where each key -> string[]
  if (
    data.errors &&
    typeof data.errors === "object" &&
    !Array.isArray(data.errors)
  ) {
    Object.entries(data.errors).forEach(([key, val]) => {
      const messages = Array.isArray(val) ? val.map(String) : [String(val)];
      const normalizedKey =
        key[0] === key[0].toUpperCase() ? toCamel(key) : key;
      result[normalizedKey] = (result[normalizedKey] || []).concat(messages);
    });
    return result;
  }

  // Shape B: errors array of { field, message }
  if (Array.isArray(data.errors)) {
    data.errors.forEach((it: any) => {
      const field = it.field ?? it.key ?? "__global";
      const normalizedKey =
        typeof field === "string"
          ? field[0] === field[0].toUpperCase()
            ? toCamel(field)
            : field
          : "__global";
      const msg = String(it.message ?? it.msg ?? it.error ?? "");
      result[normalizedKey] = (result[normalizedKey] || []).concat(msg);
    });
    return result;
  }

  // Generic message
  if (data.message) {
    result["__global"] = [String(data.message)];
    return result;
  }

  if (err?.message) {
    result["__global"] = [String(err.message)];
  }

  return result;
}
