// src/utils/toasterConfig.ts
export type OperationType = "query" | "create" | "update" | "delete" | "other";

export interface ToasterConfig {
  // enable success toast for operation types
  success: Partial<Record<OperationType, boolean>>;
  // enable loading toast for operation types
  loading: Partial<Record<OperationType, boolean>>;
  // enable mapped server error toast from withToast (true by default)
  mappedError: boolean;
  // default loading/success messages per operation
  messages: Partial<Record<OperationType, { loading?: string; success?: string }>>;
}

export const defaultToasterConfig: ToasterConfig = {
  success: {
    query: false,
    create: true,
    update: true,
    delete: true,
    other: true,
  },
  loading: {
    query: false,
    create: true,
    update: true,
    delete: true,
    other: true,
  },
  mappedError: true,
  messages: {
    create: { loading: "Creating...", success: "Created" },
    update: { loading: "Updating...", success: "Updated" },
    delete: { loading: "Deleting...", success: "Deleted" },
    query: { loading: "Loading...", success: "Loaded" },
  },
};

// runtime-config object — you can mutate this at startup or runtime to change behaviour
export const toasterConfig: ToasterConfig = { ...defaultToasterConfig };
