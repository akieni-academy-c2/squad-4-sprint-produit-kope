import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/shared/utils";
import { toast as toastMotion } from "@/shared/motion/variants.js";

const NotificationContext = createContext(null);
let uid = 0;

const TYPE_ICONS = {
  success: (
    <CheckCircle2
      size={16}
      aria-hidden
      className="mt-0.5 shrink-0 text-emerald-600"
    />
  ),
  error: (
    <XCircle size={16} aria-hidden className="mt-0.5 shrink-0 text-rose-600" />
  ),
  info: <Info size={16} aria-hidden className="mt-0.5 shrink-0 text-sky-600" />,
  warning: (
    <AlertTriangle
      size={16}
      aria-hidden
      className="mt-0.5 shrink-0 text-amber-600"
    />
  ),
};

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ message, type = "info", duration = 3500 }) => {
      const id = ++uid;
      setToasts((list) => [...list, { id, message, type }]);
      if (duration > 0) setTimeout(() => remove(id), duration);

      return id;
    },
    [remove],
  );

  const value = useMemo(() => ({ toast, remove }), [toast, remove]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-toast flex flex-col items-center gap-2 px-4 sm:right-4 sm:items-end sm:px-0"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              role="status"
              variants={toastMotion}
              initial="initial"
              animate="animate"
              exit="exit"
              className={cn(
                "pointer-events-auto w-full max-w-sm rounded-md border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-md",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  {TYPE_ICONS[t.type] || TYPE_ICONS.info}
                  <p className="leading-5">{t.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(t.id)}
                  className="shrink-0 text-current/60 transition hover:text-current"
                  aria-label="Fermer"
                >
                  <X size={16} aria-hidden />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotification must be used inside <NotificationProvider>",
    );
  return ctx;
}
