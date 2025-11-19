// src/utils/toastErrors.ts
import toast from "react-hot-toast";
import mapServerErrorsToFieldErrors from "./validationMapper";
import { humanizeFieldKey } from "./stringUtils";

export function showServerErrorsAsSingleToast(err: any) {
  const errors = mapServerErrorsToFieldErrors(err);
  if (!errors || Object.keys(errors).length === 0) {
    toast.error("Something went wrong.");
    return;
  }

  const lines: string[] = [];

  Object.entries(errors).forEach(([field, messages]) => {
    const label = humanizeFieldKey(field);

    messages.forEach((m) => {
      const msg = String(m).trim();

      // If server message already contains human label, use it; otherwise normalize "The X field..." to "X is required."
      if (msg.toLowerCase().includes(label.toLowerCase())) {
        lines.push(msg);
        return;
      }

      const requiredMatch = msg.match(/^The\s+(.+?)\s+field\s+is\s+required\.$/i);
      if (requiredMatch && requiredMatch[1]) {
        lines.push(`${label} is required.`);
        return;
      }

      const genericDetected = /^required$|^is required$|^missing$|^error$/i.test(msg);
      if (genericDetected) {
        lines.push(`${label} is required.`);
        return;
      }

      // default
      lines.push(msg);
    });
  });

  // Deduplicate and keep order
  const uniqueLines = Array.from(new Set(lines)).filter(Boolean);

  // Join with newline so toast shows each message on its own line
  const toastText = uniqueLines.join("\n");

  // Show a single toast only
  toast.error(toastText, {
    // let the toast allow multi-line display; styling can be adjusted globally
    duration: 5000,
  });
}

export function showCollapsedServerErrors(err: any) {
  const errors = mapServerErrorsToFieldErrors(err);
  if (!errors || Object.keys(errors).length === 0) {
    toast.error("Something went wrong.");
    return;
  }

  const all = Object.entries(errors)
    .flatMap(([field, messages]) =>
      messages.map((m) => {
        const label = humanizeFieldKey(field);
        const msg = String(m).trim();
        if (msg.toLowerCase().includes(label.toLowerCase())) return msg;
        const requiredMatch = msg.match(/^The\s+(.+?)\s+field\s+is\s+required\.$/i);
        if (requiredMatch && requiredMatch[1]) return `${label} is required.`;
        const genericDetected = /^required$|^is required$|^missing$|^error$/i.test(msg);
        if (genericDetected) return `${label} is required.`;
        return msg;
      })
    )
    .filter(Boolean)
    .join(" • ");

  toast.error(all, { duration: 5000 });
}

export default showServerErrorsAsSingleToast;
