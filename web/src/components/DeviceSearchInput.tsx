"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Search, Smartphone, Loader2, ChevronDown } from "lucide-react";

interface Device {
  _id: string;
  deviceName: string;
  imei: string;
  phoneNumber: string;
  status: string;
  createdAt: string;
}

interface DeviceSearchInputProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Device[];
  isSearching: boolean;
  searchError: string;
  onDeviceSelect: (device: Device) => void;
  selectedDevice: Device | null;
  placeholder: string;
  label: string;
}

export default function DeviceSearchInput({
  searchQuery,
  setSearchQuery,
  searchResults,
  isSearching,
  searchError,
  onDeviceSelect,
  selectedDevice,
  placeholder,
  label,
}: DeviceSearchInputProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchResults.length > 0 && searchQuery.length >= 2) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  }, [searchResults, searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (selectedDevice) {
      onDeviceSelect(null as any); // Clear selection when typing
    }
  };

  const handleDeviceSelect = (device: Device) => {
    onDeviceSelect(device);
    setSearchQuery(device.deviceName);
    setIsDropdownOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} <span className="text-red-500">*</span>
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 p-3 border rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            selectedDevice ? "bg-green-50 border-green-300" : ""
          }`}
          required
        />

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isSearching ? (
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          ) : (
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </div>
      </div>

      {selectedDevice && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-green-800">
            <Smartphone className="w-4 h-4" />
            <span className="font-medium">
              Selected: {selectedDevice.deviceName}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                selectedDevice.status
              )}`}
            >
              {selectedDevice.status}
            </span>
          </div>
          <div className="text-xs text-green-600 mt-1">
            IMEI: {selectedDevice.imei} • Phone: {selectedDevice.phoneNumber}
          </div>
        </div>
      )}

      {/* Search Results Dropdown */}
      {isDropdownOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {searchError && (
            <div className="p-3 text-sm text-red-600 border-b">
              {searchError}
            </div>
          )}

          {searchResults.length === 0 &&
            !isSearching &&
            searchQuery.length >= 2 &&
            !searchError && (
              <div className="p-3 text-sm text-gray-500 text-center">
                No devices found matching "{searchQuery}"
              </div>
            )}

          {searchResults.map((device) => (
            <button
              key={device._id}
              type="button"
              onClick={() => handleDeviceSelect(device)}
              className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-gray-50 focus:outline-none"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {device.deviceName}
                    </div>
                    <div className="text-xs text-gray-500">
                      IMEI: {device.imei} • Phone: {device.phoneNumber}
                    </div>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                    device.status
                  )}`}
                >
                  {device.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
