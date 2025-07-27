"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Carousel from "@/components/Carousel";
import { useAuthStore } from "@/store/authStore";
import Lottie from "lottie-react";
import loginAnimation from "../../public/animations/loadthree.json";

export default function LandingPage() {
  const { user, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();

  // checkAuth is now handled by AuthInitializer in layout

  // Redirect to dashboard if user is authenticated
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Lottie
            animationData={loginAnimation}
            loop={true}
            className="w-[200px] h-[150px]"
          />
        </div>
      </div>
    );
  }

  // Only show landing page if user is not authenticated
  if (user) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-sm mx-auto">
        <Carousel />

        <div className="absolute flex w-full gap-7 bottom-[5%]">
          <Link
            href="/auth/login"
            className="block w-[30%] bg-blue-500 text-white text-center py-3 rounded-lg font-medium"
          >
            Login
          </Link>

          <Link
            href="/auth/register"
            className="block w-[30%] bg-gray-200 text-gray-800 text-center py-3 rounded-lg font-medium"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
