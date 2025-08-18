"use client";
import { Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

export default function MobileOnly({ children }: { children: any }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <>
      {/* Mobile content */}
      <div className="block md:hidden">{children}</div>

      {/* Desktop notification */}
      <div className="hidden md:flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="text-center text-white p-8 rounded-lg bg-white/10 backdrop-blur-sm animate-pulse">
          {/* <div className="text-6xl mb-4">📱</div> */}

          <div className="flex mb-4 justify-center">
            <Smartphone size={80} className="animate-tilt" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Mobile Only</h1>
          <p className="text-xl mb-6">
            This app is designed for mobile devices
          </p>
          <div className="animate-bounce">
            <p className="text-lg">Please switch to your mobile device</p>
          </div>
        </div>
      </div>

      <Toaster position="top-center" />
    </>
  );
}
