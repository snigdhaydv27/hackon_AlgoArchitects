"use client";

const BASE = "/api";

export async function api<T = unknown>(
  path: string,
  opts: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const token =
    opts.token ?? (typeof window !== "undefined" ? localStorage.getItem("reloop_token") : null);
  const headers = new Headers(opts.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (opts.body && !(opts.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(BASE + path, {
    ...opts,
    headers,
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  if (res.status === 204) return null as T;
  return (await res.json()) as T;
}
