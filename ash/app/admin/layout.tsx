"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthentication();
  }, [pathname]);

  const checkAuthentication = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      // Allow access to login page without token
      if (pathname === "/admin") {
        if (token) {
          // If already logged in, redirect to dashboard
          router.push("/admin/dashboard");
        } else {
          setLoading(false);
        }
        return;
      }

      // For all other admin pages, require authentication
      if (!token) {
        router.push("/admin");
        return;
      }

      // Verify token with server
      const response = await fetch("/api/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        router.push("/admin/dashboard");
      } else {
        localStorage.removeItem("adminToken");
        router.push("/admin");
        toast.error("Session expired. Please login again.");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("adminToken");
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
