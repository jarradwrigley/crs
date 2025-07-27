"use client"

import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { ChevronLeft } from "lucide-react";
import ProfileDrawer from "@/components/Profiler";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import SubscribeForm from "@/components/Subscribe";

export default function RegisterPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-sm mx-auto">
        <div className="flex justify-between items-center gap-3 flex-shrink-0 mb-4">
          <div className="flex gap-4 items-center">
            <ChevronLeft
              onClick={() => router.back()}
              className="cursor-pointer"
            />
            <span
              className="text-[1rem] text-[#003883]"
              style={{ fontFamily: "Lobster" }}
            >
              Add Subscription
            </span>
          </div>
          <ProfileDrawer user={user} onLogout={logout} />
        </div>

        <SubscribeForm mode="register" />
      </div>
    </div>
  );
}
