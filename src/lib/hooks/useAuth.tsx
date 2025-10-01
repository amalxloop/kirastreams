"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type User = {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role?: "user" | "admin";
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function fakeJwt(payload: object) {
  // NOTE: Demo-only non-signed token to simulate JWT
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
  const body = btoa(JSON.stringify({ ...payload, iat: Date.now() / 1000 }));
  return `${header}.${body}.`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("ks_token") : null;
    const u = typeof window !== "undefined" ? localStorage.getItem("ks_user") : null;
    if (t) setToken(t);
    if (u) setUser(JSON.parse(u));
  }, []);

  const persist = useCallback((u: User | null, t: string | null) => {
    setUser(u);
    setToken(t);
    if (typeof window === "undefined") return;
    if (u && t) {
      localStorage.setItem("ks_user", JSON.stringify(u));
      localStorage.setItem("ks_token", t);
    } else {
      localStorage.removeItem("ks_user");
      localStorage.removeItem("ks_token");
    }
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    const API = process.env.NEXT_PUBLIC_API_URL;
    if (API) {
      try {
        const res = await fetch(`${API}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: _password }),
        });
        if (!res.ok) throw new Error("Login failed");
        const data = await res.json();
        persist(
          { id: data.user.id, email: data.user.email, name: data.user.name, avatarUrl: data.user.avatarUrl, role: data.user.role },
          data.token
        );
        return;
      } catch (e) {
        console.warn("Falling back to demo auth (login)", e);
      }
    }
    // Demo fallback
    const u: User = {
      id: email.split("@")[0] || "user",
      email,
      name: email.split("@")[0],
      avatarUrl:
        "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=200&auto=format&fit=crop",
      role: "user",
    };
    const t = fakeJwt({ sub: u.id, email: u.email });
    persist(u, t);
  }, [persist]);

  const signup = useCallback(async (email: string, _password: string, name?: string) => {
    const API = process.env.NEXT_PUBLIC_API_URL;
    if (API) {
      try {
        const res = await fetch(`${API}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: _password, name }),
        });
        if (!res.ok) throw new Error("Signup failed");
        const data = await res.json();
        persist(
          { id: data.user.id, email: data.user.email, name: data.user.name, avatarUrl: data.user.avatarUrl, role: data.user.role },
          data.token
        );
        return;
      } catch (e) {
        console.warn("Falling back to demo auth (signup)", e);
      }
    }
    // Demo fallback
    const u: User = {
      id: (name || email).toLowerCase().replace(/[^a-z0-9]+/g, "-") || "user",
      email,
      name: name || email.split("@")[0],
      avatarUrl:
        "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=200&auto=format&fit=crop",
      role: "user",
    };
    const t = fakeJwt({ sub: u.id, email: u.email });
    persist(u, t);
  }, [persist]);

  const logout = useCallback(() => persist(null, null), [persist]);

  const value = useMemo<AuthContextValue>(() => ({ user, token, login, signup, logout }), [user, token, login, signup, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}