"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { CircleChevronLeft, LogOut } from "lucide-react";
import type { User as UserType } from "@/types/auth";
import { drawerRoutes } from "./DrawerRoutes";

export default function ProfileDrawer({
  user,
  onLogout,
}: {
  user: UserType;
  onLogout: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="border border-gray-300 bg-white rounded-full shadow"
      >
        <Image
          src={user.image || "/Pixel-60.png"}
          alt="avatar"
          width={30}
          height={30}
          className="rounded-full border border-gray-400 shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out"
        />
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween" }}
            className="fixed top-0 left-0 z-40 h-full w-[80%] bg-white shadow-lg flex flex-col"
          >
            {/* Header */}
            <div className="relative p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Image
                  src={user.image || "/Pixel-60.png"}
                  alt="User"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-[12px] text-gray-500">{user.email}</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-[-6%] top-[35%] bg-[#003883] w-8 h-8 rounded-full flex items-center justify-center"
              >
                <CircleChevronLeft size={40} color="#003883" fill="white" />
              </button>
            </div>

            {/* Divider */}
            <div className="w-full flex items-center justify-center py-2">
              <div className="w-[85%] bg-gray-400 rounded-full h-[0.5px]" />
            </div>

            {/* Navigation Links */}
            <div className="mb-6 py-4 text-sm text-gray-600">
              {drawerRoutes.map(({ label, icon, path }) => {
                const isActive = pathname === path;

                return (
                  <Link
                    key={path}
                    href={path}
                    className={`
                      flex items-center gap-2 w-full py-4 px-4 transition-all duration-200
                      ${
                        isActive
                          ? "bg-[linear-gradient(to_right,rgba(46,218,253,0.15),rgba(46,218,253,0))]"
                          : "bg-white"
                      }
                    `}
                    onClick={() => setIsOpen(false)}
                  >
                    <span
                      className={`${
                        isActive ? "text-[#003883]" : "text-black"
                      }`}
                    >
                      {icon}
                    </span>
                    <span
                      className={`text-[16px] font-medium ${
                        isActive ? "text-[#003883]" : "text-black"
                      }`}
                    >
                      {label}
                    </span>
                  </Link>
                );
              })}
            </div>
            <button
              className="flex items-center gap-2 w-full py-4 px-4 transition-all duration-200  bg-white"
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
            >
              <span className="text-red-500">
                <LogOut />
              </span>
              <span className="text-[16px] font-medium text-red-500">
                Logout
              </span>
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 z-30"
        />
      )}
    </>
  );
}
