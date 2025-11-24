"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("admin_token");
    if (storedToken) {
      setToken(storedToken);
      fetchAdminProfile(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  async function fetchAdminProfile(authToken: string) {
    try {
      const response = await fetch("/api/admin/auth/me", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAdmin(data);
      } else {
        localStorage.removeItem("admin_token");
        setToken(null);
        setAdmin(null);
      }
    } catch (error) {
      console.error("Failed to fetch admin profile:", error);
      localStorage.removeItem("admin_token");
      setToken(null);
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Login failed");
      }

      const data = await response.json();
      setToken(data.token);
      setAdmin(data.admin);
      localStorage.setItem("admin_token", data.token);
      router.push("/admin");
    } catch (error: any) {
      throw error;
    }
  }

  function logout() {
    localStorage.removeItem("admin_token");
    setToken(null);
    setAdmin(null);
    router.push("/admin/login");
  }

  return (
    <AdminAuthContext.Provider value={{ admin, token, login, logout, isLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}