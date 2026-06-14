"use client";

import React, { createContext, useContext, useCallback } from "react";
import toast from "react-hot-toast";
import { Leaf } from "lucide-react";

interface ToastCtx {
  showCreditToast: (credits: number, message: string) => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const showCreditToast = useCallback((credits: number, message: string) => {
    toast.custom((t) => (
      <div
        className={`${t.visible ? "animate-fade-up" : "opacity-0"} bg-white border border-emerald-200 shadow-lg rounded-xl px-4 py-3 flex items-center gap-3 max-w-[360px]`}
      >
        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <Leaf className="size-5 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-emerald-800">+{credits} Green Credits!</p>
          <p className="text-xs text-slate-600 truncate">{message}</p>
        </div>
      </div>
    ), { duration: 5000 });
  }, []);

  const showError = useCallback((message: string) => {
    toast.error(message);
  }, []);

  const showSuccess = useCallback((message: string) => {
    toast.success(message);
  }, []);

  return (
    <Ctx.Provider value={{ showCreditToast, showError, showSuccess }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCreditToast() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCreditToast must be inside ToastProvider");
  return v;
}

export function useToast() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useToast must be inside ToastProvider");
  return v;
}
