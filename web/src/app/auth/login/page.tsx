"use client";

import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import loginAnimation from "../../../../public/animations/loadfour.json";
import Lottie from "lottie-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-sm mx-auto">
        {/* <h1 className="text-2xl font-bold text-center mb-8">Login</h1> */}

        <div className="flex justify-center items-center mb-[3rem]">
          <Lottie
            animationData={loginAnimation}
            loop={true}
            className="w-[200px] h-[150px"
          />
        </div>

        <AuthForm mode="login" />

        <p className="text-center mt-4 text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/auth/register" className="text-blue-500">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
