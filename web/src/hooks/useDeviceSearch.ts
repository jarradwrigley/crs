"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "./useDebounce";
import { useAuthStore } from "@/store/authStore";

interface Device {
  _id: string;
  deviceName: string;
  imei: string;
  phoneNumber: string;
  status: string;
  createdAt: string;
}

export function useDeviceSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Device[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const { user, searchDevice } = useAuthStore();

  const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms delay

  useEffect(() => {
    const searchDevices = async () => {
      if (!debouncedSearchQuery.trim() || debouncedSearchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      setSearchError("");

      try {
        // const response = await fetch(
        //   `/api/devices/search?q=${encodeURIComponent(debouncedSearchQuery)}`,
        //   {
        //     method: "GET",
        //     headers: {
        //       Authorization: `Bearer ${user?.accessToken}`,
        //       "Content-Type": "application/json",
        //     },
        //   }
        // );

        // const result = await response.json();

        const result = await searchDevice(debouncedSearchQuery);

        if (!result.success) {
          throw new Error(result.error || "Failed to search devices");
        }

        setSearchResults(result.data || []);
      } catch (error: any) {
        console.error("Device search error:", error);
        setSearchError(error.message || "Failed to search devices");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchDevices();
  }, [debouncedSearchQuery, user?.accessToken]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    searchError,
  };
}
