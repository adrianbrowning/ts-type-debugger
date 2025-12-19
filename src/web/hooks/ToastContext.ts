import { createContext } from "react";

export type ToastType = "success" | "error";

export type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

export type ToastContextValue = {
  toasts: Array<Toast>;
  showToast: (message: string, type: ToastType) => void;
  dismissToast: (id: number) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);
