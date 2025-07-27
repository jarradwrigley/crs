"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Lottie from "lottie-react";
import loginAnimation from "../../../public/animations/loadthree.json";

// Type definitions...
type VerificationStatus =
  | "loading"
  | "success"
  | "error"
  | "expired"
  | "already_verified";

export default function VerifyEmailContent() {
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      const emailParam = searchParams.get("email");

      if (emailParam) setEmail(emailParam);

      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link.");
        return;
      }

      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const result = await res.json();

        if (result.success) {
          setStatus("success");
          setMessage(result.message || "Email verified!");
          setEmail(result.data?.email || emailParam || "");
          setTimeout(() => router.push("/auth/login"), 3000);
        } else {
          if (result.error?.includes("expired")) setStatus("expired");
          else if (result.error?.includes("already verified"))
            setStatus("already_verified");
          else setStatus("error");

          setMessage(result.error || "Verification failed.");
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage("Something went wrong.");
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  const handleResendVerification = async () => {
    if (!email) return;
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      setMessage(
        result.success
          ? "Verification email sent."
          : result.error || "Failed to resend."
      );
    } catch {
      setMessage("Resend failed. Try again.");
    }
  };

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="text-center">
            <Lottie
              animationData={loginAnimation}
              loop={true}
              className="w-[200px] h-[150px] mx-auto"
            />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Verifying Your Email
            </h1>
            <p className="text-gray-600">
              Please wait while we verify your email address...
            </p>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
              <svg
                className="h-10 w-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-green-800 mb-4">
              Email Verified Successfully!
            </h1>

            <p className="text-gray-600 mb-6">{message}</p>

            {email && (
              <p className="text-sm text-gray-500 mb-6">
                Account: <strong>{email}</strong>
              </p>
            )}

            <div className="space-y-3">
              <p className="text-sm text-blue-600">
                Redirecting to login in 3 seconds...
              </p>

              <Link
                href="/auth/login"
                className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Go to Login Now
              </Link>
            </div>
          </div>
        );

      case "expired":
        return (
          <div className="text-center">
            {/* Warning Icon */}
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100 mb-6">
              <svg
                className="h-10 w-10 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-yellow-800 mb-4">
              Verification Link Expired
            </h1>

            <p className="text-gray-600 mb-6">{message}</p>

            <div className="space-y-3">
              {email && (
                <button
                  onClick={handleResendVerification}
                  className="block w-full bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Send New Verification Email
                </button>
              )}

              <Link
                href="/auth/register"
                className="block w-full bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back to Registration
              </Link>
            </div>
          </div>
        );

      case "already_verified":
        return (
          <div className="text-center">
            {/* Info Icon */}
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 mb-6">
              <svg
                className="h-10 w-10 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-blue-800 mb-4">
              Email Already Verified
            </h1>

            <p className="text-gray-600 mb-6">{message}</p>

            <Link
              href="/auth/login"
              className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        );

      case "error":
      default:
        return (
          <div className="text-center">
            {/* Error Icon */}
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
              <svg
                className="h-10 w-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-red-800 mb-4">
              Verification Failed
            </h1>

            <p className="text-gray-600 mb-6">{message}</p>

            <div className="space-y-3">
              <Link
                href="/auth/register"
                className="block w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Try Registration Again
              </Link>

              <Link
                href="/auth/login"
                className="block w-full bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Go to Login
              </Link>
            </div>
          </div>
        );
    }
  };

  return <>{renderContent()}</>;
}
