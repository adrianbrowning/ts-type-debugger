import { useContext } from "react";
import { ToastContext } from "./ToastContext.ts";
import type { ToastContextValue } from "./ToastContext.ts";

export const useToast = (): Pick<ToastContextValue, "showToast"> => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return { showToast: context.showToast };
};

export const useToastContext = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within ToastProvider");
  }
  return context;
};
