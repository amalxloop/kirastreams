import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Admin {
  id: number;
  email: string;
  name: string;
  role: string;
}

export function useAdmin() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const token = localStorage.getItem("admin_token");
    
    if (!token) {
      setLoading(false);
      router.push("/admin/login");
      return;
    }

    try {
      const response = await fetch("/api/admin/auth/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem("admin_token");
        router.push("/admin/login");
        return;
      }

      const data = await response.json();
      setAdmin(data);
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("admin_token");
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    localStorage.removeItem("admin_token");
    setAdmin(null);
    router.push("/admin/login");
  }

  return { admin, loading, logout };
}