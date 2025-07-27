"use client";
import ProtectedRoute from "@/components/Guard";
import type React from "react";

import ProfileDrawer from "@/components/Profiler";
import { useAuthStore } from "@/store/authStore";
import { useCallback, useEffect, useState, useRef } from "react";
import {
  Shield,
  Smartphone,
  Lock,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  ChevronLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { Subscription } from "@/types/auth";
import EncryptionCard from "@/components/EncryptionCard";
import { toast, Toaster } from "sonner";

const pi = Math.PI;
const tau = 2 * pi;

const map = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

function useSubscriptions(user: any) {
  const { retrieveUserData } = useAuthStore();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await retrieveUserData();
      if (!response.success) {
        throw new Error(
          `Failed to fetch subscriptions: ${response.statusText}`
        );
      }
      const data = response.data.subscriptions;
      setSubscriptions(data || []);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast.error("Failed to Load Subscriptions", {
        description:
          "Unable to retrieve your encryption subscriptions. Please refresh the page.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.subscriptions) {
      setSubscriptions(user.subscriptions);
      setLoading(false);
    } else {
      fetchSubscriptions();
    }
  }, [user?.subscriptions, fetchSubscriptions]);

  return { subscriptions, loading, refetch: fetchSubscriptions };
}

// Custom Popover Component
interface PopoverProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  trigger: React.ReactNode;
}

const CustomPopover: React.FC<PopoverProps> = ({
  isOpen,
  onClose,
  children,
  trigger,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        triggerRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <div className="relative">
      <div ref={triggerRef}>{trigger}</div>
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute bottom-full right-0 mb-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in-0 zoom-in-95 duration-200"
          style={{
            transformOrigin: "bottom right",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

// TypeScript interfaces
interface ActivationState {
  [key: string]: boolean;
}

interface LoadingState {
  [key: string]: boolean;
}

interface ErrorState {
  [key: string]: string;
}

interface TotpState {
  [key: string]: string;
}

interface QrCodeState {
  [key: string]: string;
}

interface OnboardedState {
  [key: string]: boolean;
}

const SUBSCRIPTION_TYPES: Record<string, string> = {
  "mobile-v4-basic": "Mobile Only v4 - Basic (30 days)",
  "mobile-v4-premium": "Mobile Only v4 - Premium (60 days)",
  "mobile-v4-enterprise": "Mobile Only v4 - Enterprise (90 days)",
  "mobile-v5-basic": "Mobile Only v5 - Basic (30 days)",
  "mobile-v5-premium": "Mobile Only v5 - Premium (60 days)",
  "full-suite-basic": "Full Suite - Basic (60 days)",
  "full-suite-premium": "Full Suite - Premium (90 days)",
};

const PLAN_DURATIONS: Record<string, number> = {
  "mobile-v4-basic": 30,
  "mobile-v4-premium": 60,
  "mobile-v4-enterprise": 90,
  "mobile-v5-basic": 30,
  "mobile-v5-premium": 60,
  "full-suite-basic": 60,
  "full-suite-premium": 90,
};

const ManageSubscriptions = () => {
  const { user, logout, isLoading, checkAuth } = useAuthStore();
  const { subscriptions, loading, refetch } = useSubscriptions(user);
  const router = useRouter();
  const [selectedDevice, setSelectedDevice] = useState<Subscription | null>(
    null
  );
  const [showKeyDetails, setShowKeyDetails] = useState<{
    [deviceId: string]: boolean;
  }>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [showActivation, setShowActivation] = useState<ActivationState>({});
  const [isOnboarded, setIsOnboarded] = useState<OnboardedState>({});
  const [qrCodes, setQrCodes] = useState<QrCodeState>({});
  const [totpCodes, setTotpCodes] = useState<TotpState>({});
  const [error, setError] = useState<ErrorState>({});
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Use subscriptions from the hook as the primary data source
  const devices = subscriptions;

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

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "expired":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Lock className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRefreshEncryption = async (deviceId: string) => {
    setIsRefreshing(true);
    setTimeout(async () => {
      await refetch();
      setIsRefreshing(false);
    }, 2000);
  };

  const toggleKeyVisibility = (deviceId: string) => {
    setShowKeyDetails((prev) => ({
      ...prev,
      [deviceId]: !prev[deviceId],
    }));
  };

  const generateMaskKey = (imei: string) => {
    return `${imei.slice(0, 3)}***${imei.slice(-3)}`;
  };

  const filteredDevices = devices.filter((device) => {
    if (activeTab === "all") return true;
    return device.status?.toLowerCase() === activeTab;
  });

  const getDeviceCount = (status: string) => {
    if (status === "all") return devices.length;
    return devices.filter((d) => d.status?.toLowerCase() === status).length;
  };

  const handleBack = () => {
    router.back();
  };

  const handleActivationSuccess = useCallback(async () => {
    await refetch();
    await checkAuth();
    toast.success("Device Activated", {
      description: "Your device has been successfully activated!",
    });
  }, [refetch, checkAuth]);

  const handleAddSubscription = () => {
    setIsPopoverOpen(false);
    router.push("/bitdefender/subscription");
    toast.info("Add Subscription", {
      description: "Redirecting to add subscription to existing device...",
    });
  };

  const handleAddDevice = () => {
    setIsPopoverOpen(false);
    router.push("/bitdefender/onboard");
    toast.info("Add Device", {
      description: "Redirecting to add new device...",
    });
  };

  const togglePopover = () => {
    setIsPopoverOpen(!isPopoverOpen);
  };

  if (!user) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen px-4 py-4 bg-cover bg-center relative flex flex-col overflow-y-auto">
        <div className="back-image" />
        <div className="flex justify-between items-center gap-3 flex-shrink-0 mb-4">
          <div className="flex gap-4 items-center">
            <ChevronLeft onClick={handleBack} className="cursor-pointer" />
            <span
              className="text-[1rem] text-[#003883]"
              style={{ fontFamily: "Lobster" }}
            >
              Manage Encryptions
            </span>
          </div>
          <ProfileDrawer user={user} onLogout={logout} />
        </div>

        <div className="py-4 space-y-4 flex-1">
          {/* Quick Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-3 text-center shadow-sm">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-xl font-bold text-gray-900">
                {getDeviceCount("active")}
              </p>
              <p className="text-xs text-gray-600">Active</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center shadow-sm">
              <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full mx-auto mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-xl font-bold text-gray-900">
                {getDeviceCount("expired")}
              </p>
              <p className="text-xs text-gray-600">Expired</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center shadow-sm">
              <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full mx-auto mb-2">
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
              <p className="text-xl font-bold text-gray-900">
                {getDeviceCount("pending")}
              </p>
              <p className="text-xs text-gray-600">Pending</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <div className="flex">
              {[
                { key: "all", label: "All" },
                { key: "active", label: "Active" },
                { key: "expired", label: "Expired" },
                { key: "pending", label: "Pending" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.key
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading subscriptions...</p>
            </div>
          )}

          {/* Devices List */}
          {!loading && (
            <div className="space-y-3">
              {filteredDevices.map((device) => (
                <EncryptionCard
                  key={device._id}
                  subscription={device}
                  onActivationSuccess={handleActivationSuccess}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredDevices.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {activeTab !== "all" ? activeTab : ""} devices
              </h3>
              <p className="text-gray-600 text-sm mb-6 px-4">
                {activeTab === "all"
                  ? "You don't have any encrypted devices yet."
                  : `No ${activeTab} encryption devices found.`}
              </p>
              {activeTab === "all" && (
                <button
                  onClick={handleAddDevice}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Device
                </button>
              )}
            </div>
          )}
        </div>

        {/* Custom Floating Action Button with Popover */}
        <div className="fixed bottom-6 right-6">
          <CustomPopover
            isOpen={isPopoverOpen}
            onClose={() => setIsPopoverOpen(false)}
            trigger={
              <button
                onClick={togglePopover}
                className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Plus
                  className={`w-6 h-6 transition-transform duration-200 ${
                    isPopoverOpen ? "rotate-45" : ""
                  }`}
                />
              </button>
            }
          >
            <div className="space-y-1">
              <button
                onClick={handleAddSubscription}
                className="w-full flex items-center gap-3 px-3 py-3 text-sm text-left hover:bg-gray-50 transition-colors duration-150 first:rounded-t-lg"
              >
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Plus className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    Add Subscription
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Add to existing device
                  </div>
                </div>
              </button>

              <div className="h-px bg-gray-100 mx-2" />

              <button
                onClick={handleAddDevice}
                className="w-full flex items-center gap-3 px-3 py-3 text-sm text-left hover:bg-gray-50 transition-colors duration-150 last:rounded-b-lg"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Add Device</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Add device + subscription
                  </div>
                </div>
              </button>
            </div>
          </CustomPopover>
        </div>

        <Toaster position="top-center" />
      </div>
    </ProtectedRoute>
  );
};

export default ManageSubscriptions;
