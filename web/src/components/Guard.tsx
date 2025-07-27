"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Lottie from "lottie-react";
import loginAnimation from "../../public/animations/loadthree.json";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  fallback,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  // Only redirect if not loading and no user - don't call checkAuth here
  // since it's already called in the main app initialization
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Lottie
              animationData={loginAnimation}
              loop={true}
              className="w-[200px] h-[150px]"
            />
          </div>
        </div>
      )
    );
  }

  // Don't render if no user (will redirect)
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
