import React, { useState, useCallback, useRef, useMemo } from "react";
import { ToastContext } from "./ToastContext.ts";
import type { ToastType, Toast } from "./ToastContext.ts";

export const ToastProvider: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
  const [ toasts, setToasts ] = useState<Array<Toast>>([]);
  const nextId = useRef(0);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = nextId.current++;
    setToasts(prev => [ ...prev, { id, message, type }]);
  }, []);

  const toastValues = useMemo(() => ({ toasts, showToast, dismissToast }), [ toasts, showToast, dismissToast ]);
  return (
    <ToastContext.Provider value={toastValues}>
      {children}
    </ToastContext.Provider>
  );
};
