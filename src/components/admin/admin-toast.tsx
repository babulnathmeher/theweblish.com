"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type ToastKind = "success" | "error";
type Toast = { id: number; message: string; kind: ToastKind };
type ToastContext = (message: string, kind?: ToastKind) => void;

const Context = createContext<ToastContext | null>(null);

export function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = useCallback<ToastContext>((message, kind = "success") => {
    setToasts((current) => [...current.slice(-2), { id: Date.now() + Math.random(), message, kind }]);
  }, []);
  const dismiss = useCallback((id: number) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);
  useEffect(() => {
    if (!toasts.length) return;
    const timer = window.setTimeout(() => dismiss(toasts[0].id), 5000);
    return () => window.clearTimeout(timer);
  }, [dismiss, toasts]);
  return <Context.Provider value={show}>{children}<div className="admin-toast-stack" aria-label="Notifications">{toasts.map((toast) => <div key={toast.id} className={`admin-toast admin-toast--${toast.kind}`} role={toast.kind === "error" ? "alert" : "status"}><span className="admin-toast-icon" aria-hidden="true">{toast.kind === "error" ? "!" : "✓"}</span><span>{toast.message}</span><button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification">×</button></div>)}</div></Context.Provider>;
}

export function useAdminToast() {
  const show = useContext(Context);
  if (!show) throw new Error("AdminToastProvider is missing.");
  return show;
}
