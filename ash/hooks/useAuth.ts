import { useState, useEffect } from "react";

interface Admin {
  id: string;
  username: string;
  email: string;
  role: string;
}

export const useAuth = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch("/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setAdmin(data.admin);
      } else {
        localStorage.removeItem("adminToken");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("adminToken");
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("adminToken", data.token);
        setAdmin(data.admin);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: "Login failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setAdmin(null);
  };

  return { admin, loading, login, logout };
};
