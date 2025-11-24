import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- API Helpers ---
export function getApiBase() {
  // Prefer env var; fallback to local Express default
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
}

export async function apiFetch<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const base = getApiBase();
  const url = path.startsWith("http") ? path : `${base}${path}`;

  // Merge headers and attach bearer token if available
  const headers = new Headers(init.headers || {});
  const hasBody = typeof init.body !== "undefined" && !(init.body instanceof FormData);
  if (hasBody && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("ks_token");
    if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch {}
    throw new Error(msg);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  // @ts-expect-error allow non-json
  return (await res.text()) as T;
}