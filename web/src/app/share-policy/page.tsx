"use client";

import ProtectedRoute from "@/components/Guard";
import ProfileDrawer from "@/components/Profiler";
import { useAuthStore } from "@/store/authStore";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const SharePolicy = () => {
  const { user, logout, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  const isFeatureLocked = true; // You can make this dynamic based on user subscription

  if (!user) return null;

  return (
    <ProtectedRoute>
      <div className="h-[100dvh] overflow-hidden px-4 py-4 bg-cover bg-center relative flex flex-col">
        <div className="back-image" />

        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} aria-label="Go back">
              <ChevronLeft size={28} className="text-[#003883]" />
            </button>

            <h1
              className="text-xl font-bold text-[#003883]"
              style={{ fontFamily: "Lobster" }}
            >
              Privacy Information
            </h1>
          </div>

          <ProfileDrawer user={user} onLogout={logout} />
        </header>

        {/* Main Content */}
        <section className="bg-white rounded-md p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-[#003883] mb-3">
            What your organization can see:
          </h2>
          <ul className="list-disc list-inside text-sm space-y-2 text-gray-700 leading-relaxed">
            <li>
              <strong>Device information</strong> (e.g., model, OS version)
            </li>
            <li>
              <strong>Network activity</strong> and usage patterns
            </li>
            <li>
              <strong>Installed applications</strong> and their permissions
            </li>
            <li>
              <strong>Security events</strong> and alerts
            </li>
            <li>
              <strong>Policy compliance</strong> status with organizational
              rules
            </li>
            <li>
              <strong>Location data</strong> (if enabled or applicable)
            </li>
            <li>
              <strong>Access logs</strong> and authentication attempts
            </li>
            <li>
              <strong>Data usage statistics</strong> over time
            </li>
            <li>
              <strong>Device health</strong> and performance metrics
            </li>
            <li>
              <strong>Incident response</strong> actions and remediation history
            </li>
          </ul>
        </section>
      </div>
    </ProtectedRoute>
  );
};

export default SharePolicy;
