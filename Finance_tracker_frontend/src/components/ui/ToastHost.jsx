import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const typeStyles = {
  success: {
    border: "border-[rgb(var(--success))]/30",
    icon: CheckCircle,
    iconColor: "text-[rgb(var(--success))]",
  },
  error: {
    border: "border-[rgb(var(--danger))]/30",
    icon: XCircle,
    iconColor: "text-[rgb(var(--danger))]",
  },
  info: {
    border: "border-[rgb(var(--info))]/30",
    icon: Info,
    iconColor: "text-[rgb(var(--info))]",
  },
};

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const dismiss = useCallback((id) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type, message) => {
      const id = crypto.randomUUID();
      setItems((prev) => [...prev, { id, type, message }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      success: (m) => push("success", m),
      error: (m) => push("error", m),
      info: (m) => push("info", m),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed left-0 right-0 top-3 z-50 mx-auto flex max-w-md flex-col gap-2 px-4 pointer-events-none">
        {items.map((t) => {
          const style = typeStyles[t.type] || typeStyles.info;
          const IconComp = style.icon;
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border ${style.border} bg-[rgb(var(--card))] px-4 py-3 text-sm shadow-lg backdrop-blur-sm animate-slide-down`}
            >
              <IconComp size={18} className={`shrink-0 mt-0.5 ${style.iconColor}`} />
              <span className="flex-1">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
