"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faExclamationCircle,
  faInfoCircle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  exiting: boolean;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DISPLAY_MS = 6000;
const EXIT_MS = 300;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    // เริ่ม exit animation ก่อน
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    // ลบออกหลัง animation จบ
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, EXIT_MS);
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
      setTimeout(() => removeToast(id), DISPLAY_MS);
    },
    [removeToast]
  );

  const icons = {
    success: faCheckCircle,
    error: faExclamationCircle,
    info: faInfoCircle,
  };

  const iconColors = {
    success: "text-emerald-500",
    error: "text-red-500",
    info: "text-sky-500",
  };

  const colors = {
    success: "bg-white border-emerald-200 text-gray-800 shadow-emerald-100",
    error: "bg-white border-red-200 text-gray-800 shadow-red-100",
    info: "bg-white border-sky-200 text-gray-800 shadow-sky-100",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-4 z-[100] flex flex-col-reverse gap-2.5 max-w-xs w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-lg overflow-hidden",
              toast.exiting ? "toast-exit" : "toast-enter",
              colors[toast.type]
            )}
          >
            <FontAwesomeIcon
              icon={icons[toast.type]}
              className={cn("mt-0.5 text-base shrink-0", iconColors[toast.type])}
            />
            <p className="flex-1 text-sm font-medium leading-snug">
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className="opacity-40 hover:opacity-80 transition-opacity shrink-0 mt-0.5"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xs" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}