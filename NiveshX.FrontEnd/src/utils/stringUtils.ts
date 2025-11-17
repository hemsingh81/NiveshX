// src/utils/stringUtils.ts
export function humanizeFieldKey(key: string | undefined | null): string {
  if (!key) return "Error";
  if (key === "__global") return "Error";

  key = key.replace(/^\$\./, "").replace(/\[\d+\]/g, "");
  const last = key.split(".").filter(Boolean).pop() ?? key;

  let s = last.replace(/[_\-]+/g, " ");
  s = s.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Z])([A-Z][a-z])/g, "$1 $2");
  s = s.replace(/\b(Id|IDs|Dto|DTO)\b$/i, "").trim();
  s = s.replace(/\s+/g, " ").trim();

  return s
    .split(" ")
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ") || "Error";
}
