"use client";
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";

interface AuthInitializerProps {
  children: React.ReactNode;
}

export default function AuthInitializer({ children }: AuthInitializerProps) {
  const { checkAuth } = useAuthStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only initialize once per app session
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      checkAuth();
    }
  }, [checkAuth]);

  return <>{children}</>;
}
