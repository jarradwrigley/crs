"use client";

import VerifyEmailContent from "@/components/content/VerifyEmailContent";
import { Suspense } from "react";


export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-md mx-auto">
        <Suspense fallback={<div>Loading...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
