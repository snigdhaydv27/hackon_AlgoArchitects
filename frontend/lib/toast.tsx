"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Leaf, X } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  credits: number;
}

interface ToastCtx {
  showCreditToast: (credits: number, message: string) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showCreditToast = useCallback((credits: number, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, credits, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <Ctx.Provider value={{ showCreditToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-28 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto animate-fade-up bg-white border border-emerald-200 shadow-lg rounded-xl px-4 py-3 flex items-center gap-3 min-w-[280px] max-w-[360px]"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <Leaf className="size-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-emerald-800">+{t.credits} Green Credits!</p>
              <p className="text-xs text-slate-600 truncate">{t.message}</p>
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useCreditToast() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCreditToast must be inside ToastProvider");
  return v;
}
