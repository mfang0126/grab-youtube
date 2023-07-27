import {
  createContext,
  type FC,
  useState,
  useCallback,
  useEffect,
} from "react";
import Toast from "~/components/Toast";

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

  // Interesting story, and let's make a blog.
  const showToast = useCallback(
    (toast: Toast) => {
      setToast(toast);
    },
    [setToast]
  );

  const removeToast = () => {
    setToast(null);
  };

  return (
    <ToastContext.Provider value={{ toast, showToast, removeToast }}>
      {children}
      <Toast message={toast?.message} onClose={removeToast} open={!!toast} />
    </ToastContext.Provider>
  );
};

export default ToastContext;
