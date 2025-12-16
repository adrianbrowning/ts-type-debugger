import React, { useEffect, useState } from 'react';
import { useCssTheme } from '../theme.ts';
import { useToastContext, type ToastType } from '../hooks/useToast.tsx';

const TOAST_DURATION = 3000;
const ANIMATION_DURATION = 200;

type ToastItemProps = {
  id: number;
  message: string;
  type: ToastType;
  onDismiss: (id: number) => void;
};

const ToastItem: React.FC<ToastItemProps> = ({ id, message, type, onDismiss }) => {
  const theme = useCssTheme();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(id), ANIMATION_DURATION);
    }, TOAST_DURATION);

    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const bgColor = type === 'success' ? theme.accent.success : theme.accent.error;

  return (
    <div
      style={{
        padding: `${theme.spacing.md} ${theme.spacing.lg}`,
        backgroundColor: bgColor,
        color: theme.accent.btnText,
        borderRadius: theme.radius.md,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.medium,
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'translateX(100%)' : 'translateX(0)',
        transition: `opacity ${ANIMATION_DURATION}ms ease, transform ${ANIMATION_DURATION}ms ease`,
        cursor: 'pointer',
        maxWidth: '320px',
      }}
      onClick={() => {
        setIsExiting(true);
        setTimeout(() => onDismiss(id), ANIMATION_DURATION);
      }}
    >
      {message}
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const theme = useCssTheme();
  const { toasts, dismissToast } = useToastContext();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: theme.spacing.lg,
        right: theme.spacing.lg,
        zIndex: theme.zIndex.tooltip,
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.sm,
      }}
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={dismissToast}
        />
      ))}
    </div>
  );
};
