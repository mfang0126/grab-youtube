import { createContext, type FC, useState } from "react";

interface Toast {
  message: string;
  autoHideDuration?: number;
}

interface Context {
  toast: Toast | null;
  showToast: (toast: Toast) => void;
  removeToast: () => void;
}

const ToastContext = createContext<Context | null>(null);

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (toast: Toast) => {
    setToast(toast);
  };

  const removeToast = () => {
    setToast(null);
  };

  return (
    <ToastContext.Provider value={{ toast, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export default ToastContext;
