import { useEffect } from "react";

interface ToastProps {
  open?: boolean;
  message?: string;
  autoHideDuration?: number;
  onClose: () => void;
}

export default function Toast({
  open = true,
  message = "",
  autoHideDuration = 5000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    if (!open) return;

    if (onClose) {
      const timeout = setTimeout(() => {
        onClose();
      }, autoHideDuration);

      return () => clearTimeout(timeout);
    }
  }, [open, autoHideDuration, onClose]);

  if (!open) return;

  return (
    <div className="toast-end toast toast-top">
      <div className="alert alert-info">
        <span className="max-w-sm truncate">{message}</span>
      </div>
    </div>
  );
}
