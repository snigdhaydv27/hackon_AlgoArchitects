"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";

export interface AuthUser {
  id: string;
  name: string;
  role: "seller" | "buyer" | "admin" | "small_seller" | "locker";
  age?: number;
  gender?: string;
  mobile?: string;
  address?: string;
  location?: { type: "Point"; coordinates: [number, number] };
  profile?: { footLengthMm?: number; preferredSize?: string; brand?: string };
  interests?: string[];
  greenCredits?: number;
}

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  login: (personaId: string) => Promise<AuthUser>;
  loginWithToken: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("reloop_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api<AuthUser>("/auth/me")
      .then(setUser)
      .catch(() => localStorage.removeItem("reloop_token"))
      .finally(() => setLoading(false));
  }, []);

  // Demo mode: persona-based login
  async function login(personaId: string): Promise<AuthUser> {
    const r = await api<{ token: string; user: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ personaId }),
    });
    localStorage.setItem("reloop_token", r.token);
    setUser(r.user);
    return r.user;
  }

  // Production mode: token already obtained from /auth/signin
  function loginWithToken(token: string, u: AuthUser) {
    localStorage.setItem("reloop_token", token);
    setUser(u);
  }

  function logout() {
    localStorage.removeItem("reloop_token");
    setUser(null);
  }

  return <Ctx.Provider value={{ user, loading, login, loginWithToken, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be inside AuthProvider");
  return v;
}
