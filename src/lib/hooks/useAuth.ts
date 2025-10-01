"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch, getApiBase } from "@/lib/utils";

export type AuthUser = {
  id: string;
  name?: string;
  email?: string;
  role?: "user" | "admin" | string;
  avatarUrl?: string;
  [key: string]: any;
};

// LocalStorage key used by apiFetch
const TOKEN_KEY = "ks_token";

// Simple pub/sub to sync auth state across hook instances
const listeners = new Set<() => void>();
function notifyAll() {
  for (const l of Array.from(listeners)) l();
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
  notifyAll();
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null
  );
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Sync token changes across tabs/components
  useEffect(() => {
    const update = () => setToken(getStoredToken());
    listeners.add(update);
    const onStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY) update();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(update);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Fetch current user when token changes
  useEffect(() => {
    let cancelled = false;
    async function fetchMe() {
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const me = await apiFetch<AuthUser>("/api/auth/me");
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) {
          setUser(null);
          // Invalid token -> clear
          setStoredToken(null);
        }
      }
    }
    void fetchMe();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();
      const tk: string | undefined = data.token || data.accessToken || data.jwt;
      if (tk) setStoredToken(tk);
      setUser(data.user || null);
      return { user: data.user as AuthUser, token: tk };
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name?: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      if (!res.ok) throw new Error("Registration failed");
      const data = await res.json();
      const tk: string | undefined = data.token || data.accessToken || data.jwt;
      if (tk) setStoredToken(tk);
      setUser(data.user || null);
      return { user: data.user as AuthUser, token: tk };
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!getStoredToken()) return null;
    try {
      const me = await apiFetch<AuthUser>("/api/auth/me");
      setUser(me);
      return me;
    } catch {
      setUser(null);
      setStoredToken(null);
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Best-effort server logout
      await fetch(`${getApiBase()}/api/auth/logout`, { method: "POST", headers: { Authorization: `Bearer ${getStoredToken()}` } });
    } catch {}
    setUser(null);
    setStoredToken(null);
  }, []);

  return {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    refresh,
  } as const;
}