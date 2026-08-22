import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { StockStatus } from "../types";
import { STATUS_META } from "../data";
import { AlertIcon, CheckIcon, CloseIcon } from "./icons";

/* ---------------- Toasts ---------------- */

type ToastKind = "success" | "error" | "info";
interface Toast {
  id: number;
  kind: ToastKind;
  msg: string;
}

const ToastCtx = createContext<(kind: ToastKind, msg: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

const KIND_STYLE: Record<ToastKind, { border: string; icon: ReactNode }> = {
  success: {
    border: "border-mint/40",
    icon: (
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-mint/15 text-mint">
        <CheckIcon className="size-4" />
      </span>
    ),
  },
  error: {
    border: "border-coral/40",
    icon: (
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-coral/15 text-coral">
        <AlertIcon className="size-4" />
      </span>
    ),
  },
  info: {
    border: "border-sky/40",
    icon: (
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-sky/15 text-sky">
        <AlertIcon className="size-4" />
      </span>
    ),
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const push = useCallback((kind: ToastKind, msg: string) => {
    const id = ++idRef.current;
    setToasts((t) => [...t.slice(-3), { id, kind, msg }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-5 left-5 z-[90] flex w-[min(92vw,340px)] flex-col gap-2">
        {toasts.map((t) => (
          <button
            key={t.id}
            onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}
            className={`pointer-events-auto flex items-center gap-3 rounded-xl border bg-raised/95 px-3.5 py-3 text-start shadow-xl shadow-black/40 backdrop-blur-sm transition-transform hover:scale-[1.02] animate-pop ${KIND_STYLE[t.kind].border}`}
          >
            {KIND_STYLE[t.kind].icon}
            <span className="text-sm font-medium leading-5 text-fog">{t.msg}</span>
          </button>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------------- Modal ---------------- */

export function Modal({
  title,
  subtitle,
  onClose,
  children,
  width = "max-w-lg",
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  width?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-ink/70 p-4 backdrop-blur-[3px] animate-fadein"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`panel w-full ${width} my-auto overflow-hidden animate-pop`}>
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 className="font-display text-xl font-bold text-fog">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-mist">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-lg border border-line text-mist transition-colors hover:border-coral/50 hover:text-coral"
            aria-label="إغلاق"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ---------------- Count-up ---------------- */

export function useCountUp(target: number, duration = 900): number {
  const [val, setVal] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return val;
}

/* ---------------- Small pieces ---------------- */

export function StatusBadge({ status }: { status: StockStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
      style={{ color: meta.color, borderColor: `${meta.color}55`, background: `${meta.color}14` }}
    >
      <span
        className={`size-1.5 rounded-full ${status !== "ok" ? "animate-blink" : ""}`}
        style={{ background: meta.color }}
      />
      {meta.label}
    </span>
  );
}

export function Field({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold text-mist">{label}</span>
      {children}
      {error && <span className="mt-1 block text-[11px] font-medium text-coral">{error}</span>}
    </label>
  );
}
