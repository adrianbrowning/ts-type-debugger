import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

export type ToastType = 'success' | 'error';

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  toasts: Toast[];
  showToast: (message: string, type: ToastType) => void;
  dismissToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION = 3000;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): Pick<ToastContextValue, 'showToast'> => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return { showToast: context.showToast };
};

export const useToastContext = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }
  return context;
};
