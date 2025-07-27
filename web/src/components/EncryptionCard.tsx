import React, { useState, useEffect } from "react";
import { useSpring, animated, config } from "@react-spring/web";
import {
  Shield,
  Smartphone,
  Calendar,
  Clock,
  RefreshCw,
  Settings,
  AlertTriangle,
  CheckCircle,
  Plus,
  Eye,
  EyeOff,
  ArrowLeft,
  Key,
} from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { getPlanDisplayName } from "@/config/pricing";
import { SecureIcon } from "./Svg";

const pi = Math.PI;
const tau = 2 * pi;

const map = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

// TypeScript interfaces
interface Subscription {
  _id: string;
  user: string;
  imei: string;
  deviceName: string;
  phone: string;
  email: string;
  plan: string;
  price: number;
  queuePosition: string;
  status: "PENDING" | "QUEUED" | "ACTIVE" | "EXPIRED" | "DECLINED";
  createdAt: string;
  updatedAt: string;
  startDate?: string;
  endDate?: string;
  activatedAt?: string;
}

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


// Simple shield icon component

type EncryptionCardProps = {
  subscription: Subscription;
  onActivationSuccess: () => void;
};

const EncryptionCard: React.FC<EncryptionCardProps> = ({
  subscription,
  onActivationSuccess,
}) => {
  const router = useRouter()
  const { checkOnboarding, setupDevice, activateSubscription } = useAuthStore();
  const [devices, setDevices] = useState<Subscription[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [showActivation, setShowActivation] = useState<ActivationState>({});
  const [isOnboarded, setIsOnboarded] = useState<OnboardedState>({});
  const [qrCodes, setQrCodes] = useState<QrCodeState>({});
  const [totpCodes, setTotpCodes] = useState<TotpState>({});
  const [loading, setLoading] = useState<LoadingState>({});
  const [error, setError] = useState<ErrorState>({});
  const [activeTab, setActiveTab] = useState<string>("all");

  const calculateTimePercentage = (device: Subscription): number => {
    if (!device.startDate || !device.endDate) {
      return device.status === "ACTIVE" ? 50 : 0;
    }

    const now = new Date();
    const startDate = new Date(device.startDate);
    const endDate = new Date(device.endDate);
    const totalDuration = endDate.getTime() - startDate.getTime();

    if (totalDuration <= 0) return 0;

    const remainingTime = endDate.getTime() - now.getTime();
    const percentage = Math.max(
      0,
      Math.min(100, (remainingTime / totalDuration) * 100)
    );
    return percentage;
  };

  // Determine color based on percentage and status
  const getColor = (percentage: number, status: string): string => {
    if (status === "EXPIRED" || status === "DECLINED") return "#ef4444";
    if (status === "PENDING" || status === "QUEUED") return "#64748b";
    if (percentage <= 25) return "#ef4444";
    if (percentage <= 50) return "#eab308";
    return "#22c55e";
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "QUEUED":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "EXPIRED":
      case "DECLINED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "EXPIRED":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case "QUEUED":
      case "PENDING":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysRemaining = (device: Subscription): number => {
    if (!device.endDate) return 0;
    const endDate = new Date(device.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getPlanDuration = (plan: string): number => {
    return getSubscriptionDuration(plan) || 30;
  };

  const getSubscriptionDisplayName = (plan: string): string => {
    return getPlanDisplayName(plan);
  };

  const getSubscriptionDuration = (plan: string): number => {
    return getPlanDuration(plan);
  };

  

  // Activation logic
  const handleActivateClick = async (deviceId: string): Promise<void> => {
    if (subscription._id !== deviceId) return;

    setLoading((prev) => ({ ...prev, [deviceId]: true }));
    setError((prev) => ({ ...prev, [deviceId]: "" }));

    try {
      const onboardingResponse = await checkOnboarding(subscription.imei);

      if (!onboardingResponse.success) {
        setError((prev) => ({
          ...prev,
          [deviceId]: onboardingResponse.error || "Device check failed",
        }));
        return;
      }

      const result = onboardingResponse.data;

      // Update onboarded state
      setIsOnboarded((prev) => ({
        ...prev,
        [deviceId]: result.isOnboarded,
      }));

      // If not onboarded, generate QR code
      if (!result.isOnboarded) {
        const setupResponse = await setupDevice(
          subscription.imei,
          subscription.deviceName || `Device ${subscription.imei.slice(-4)}`
        );

        if (setupResponse.success) {
          setQrCodes((prev) => ({
            ...prev,
            [deviceId]: setupResponse.data.qrCode,
          }));
        } else {
          throw new Error(setupResponse.error || "Failed to setup device");
        }
      }

      // Show activation interface
      setShowActivation((prev) => ({ ...prev, [deviceId]: true }));
    } catch (err: any) {
      setError((prev) => ({
        ...prev,
        [deviceId]: err.message || "Failed to initiate activation",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [deviceId]: false }));
    }
  };

  const handleTotpSubmit = async (
    e: React.FormEvent,
    deviceId: string,
    imei: string
  ): Promise<void> => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, [deviceId]: true }));
    setError((prev) => ({ ...prev, [deviceId]: "" }));

    try {
      // const device = devices.find((d) => d._id === deviceId);
      // if (!device) {
      //   throw new Error("Device not found");
      // }

      const totpCode = totpCodes[deviceId];
      if (!totpCode || totpCode.length !== 6) {
        throw new Error("Please enter a valid 6-digit code");
      }

      // Call the real activation API
      const activationResponse = await activateSubscription(deviceId, totpCode, imei);


      console.log('ACCCCCC', activationResponse)

      if (!activationResponse.success) {
        throw new Error(activationResponse.error || "Activation failed");
      }

      // Update local state with the response data
      const activatedDevice = activationResponse.data;

      setDevices((prev) =>
        prev.map((device) =>
          device._id === deviceId
            ? {
                ...device,
                status: "ACTIVE" as const,
                startDate: activatedDevice.startDate,
                endDate: activatedDevice.endDate,
                activatedAt: activatedDevice.activatedAt,
              }
            : device
        )
      );

      console.log('LLL', devices)

      // Clear form and close activation interface
      setShowActivation((prev) => ({ ...prev, [deviceId]: false }));
      setTotpCodes((prev) => ({ ...prev, [deviceId]: "" }));

      console.log("AAA", showActivation);
      console.log("TTTT", totpCodes);


      // Call success callback
      onActivationSuccess();
      // setShowActivation(false);
      // setTotpCode("");
    // } else {
    //   toast.error("Activation Failed", {
    //     description:
    //       data.error || "Please check your TOTP code and try again",
    //   });
    // }
    } catch (err: any) {
      setError((prev) => ({
        ...prev,
        [deviceId]: err.message || "Activation failed. Please try again.",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [deviceId]: false }));
    }
  };

  const handleRenew = async () => {

  }

  const filteredDevices = devices.filter((device) => {
    if (activeTab === "all") return true;
    return device.status.toLowerCase() === activeTab;
  });

  const getDeviceCount = (status: string): number => {
    if (status === "all") return devices.length;
    return devices.filter((d) => d.status.toLowerCase() === status).length;
  };

  const handleBack = (): void => {
    // Navigate back logic
  };

  const percentage = calculateTimePercentage(subscription);
  const color = getColor(percentage, subscription.status);
  const daysRemaining = getDaysRemaining(subscription);
  const maxDash = 785.4;
  const offset = maxDash * (1 - percentage / 100);

  const { dashOffset } = useSpring({
    dashOffset: offset,
    from: { dashOffset: maxDash },
    config: config.molasses,
  });

  return (
    <div className="bg-white/90 backdrop-blur-md border border-white/20 rounded-lg shadow-sm">
      <div className="p-4">
        {/* Show activation interface if in progress */}
        {showActivation[subscription._id] ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">
                {isOnboarded[subscription._id]
                  ? "🔐 Enter TOTP Code"
                  : "📱 Setup Authenticator"}
              </h4>
              <button
                onClick={() =>
                  setShowActivation((prev) => ({
                    ...prev,
                    [subscription._id]: false,
                  }))
                }
                className="text-gray-500 text-sm"
              >
                Cancel
              </button>
            </div>

            {/* QR Code Section */}
            {!isOnboarded[subscription._id] && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Scan this QR code with your authenticator app:
                </p>

                {qrCodes[subscription._id] ? (
                  <div className="flex justify-center mb-3">
                    <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                      <Image
                        width={192}
                        height={192}
                        src={qrCodes[subscription._id]}
                        alt="TOTP QR Code"
                        className="w-48 h-48"
                        style={{ imageRendering: "pixelated" }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center mb-3">
                    <div className="p-4 bg-gray-100 rounded-lg border-2 border-gray-200">
                      <div className="w-48 h-48 flex items-center justify-center text-gray-500">
                        Loading QR Code...
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  Compatible with Google Authenticator, Authy, and other TOTP
                  apps
                </p>
              </div>
            )}

            <form
              onSubmit={(e) =>
                handleTotpSubmit(e, subscription._id, subscription.imei)
              }
            >
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  6-Digit Code from Authenticator App
                </label>
                <input
                  type="text"
                  value={totpCodes[subscription._id] || ""}
                  onChange={(e) =>
                    setTotpCodes((prev) => ({
                      ...prev,
                      [subscription._id]: e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6),
                    }))
                  }
                  placeholder="000000"
                  className="w-full text-black px-3 py-3 border border-gray-300 rounded-lg text-center text-xl tracking-widest font-mono"
                  maxLength={6}
                  required
                />
              </div>

              {error[subscription._id] && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  ❌ {error[subscription._id]}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  loading[subscription._id] ||
                  (totpCodes[subscription._id] || "").length !== 6
                }
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
              >
                {loading[subscription._id] ? "Activating..." : "Activate"}
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Subscription Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-black mb-1">
                  {subscription.deviceName}
                </h3>
                <p className="text-sm text-gray-600">
                  {getSubscriptionDisplayName(subscription.plan) ||
                    subscription.plan}
                </p>
                <p className="text-base font-bold text-gray-900 mt-1">
                  ${subscription.price}/month
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  subscription.status
                )}`}
              >
                {subscription.status}
              </span>
            </div>

            {/* Progress Arc - only show for active subscriptions */}
            {subscription.status === "ACTIVE" && (
              <>
                <div className="flex justify-center mb-4">
                  <svg viewBox="0 0 700 380" fill="none" width="220">
                    {/* Background path */}
                    <path
                      d="M100 350C100 283.696 126.339 220.107 173.223 173.223C220.107 126.339 283.696 100 350 100C416.304 100 479.893 126.339 526.777 173.223C573.661 220.107 600 283.696 600 350"
                      stroke="#e5e7eb"
                      strokeWidth="20"
                      strokeLinecap="round"
                    />
                    {/* Animated progress path */}
                    <animated.path
                      d="M100 350C100 283.696 126.339 220.107 173.223 173.223C220.107 126.339 283.696 100 350 100C416.304 100 479.893 126.339 526.777 173.223C573.661 220.107 600 283.696 600 350"
                      stroke={color}
                      strokeWidth="30"
                      strokeLinecap="round"
                      strokeDasharray={maxDash}
                      strokeDashoffset={dashOffset}
                    />
                    {/* Circular indicator */}
                    <animated.circle
                      cx={dashOffset.to(
                        (x) => 350 + 250 * Math.cos(map(x, maxDash, 0, pi, tau))
                      )}
                      cy={dashOffset.to(
                        (x) => 350 + 250 * Math.sin(map(x, maxDash, 0, pi, tau))
                      )}
                      r="12"
                      fill="#fff"
                      stroke={color}
                      strokeWidth="2"
                    />

                    {/* Secure Icon centered */}
                    <g transform="translate(320, 240)">
                      <SecureIcon size={60} color={color} />
                    </g>
                  </svg>
                </div>

                {/* Progress percentage and status */}
                <div className="text-center mb-4">
                  <div className="font-bold text-xl mb-1" style={{ color }}>
                    {percentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    {daysRemaining} days remaining
                  </div>
                </div>
              </>
            )}

            {/* Device Info */}
            <div className="space-y-3 mb-4 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Smartphone className="w-4 h-4" />
                <span>
                  IMEI: {subscription.imei.slice(0, 8)}...
                  {subscription.imei.slice(-4)}
                </span>
              </div>

              {subscription.status === "ACTIVE" && (
                <>
                  {subscription.startDate && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4" />
                      <span>Started: {formatDate(subscription.startDate)}</span>
                    </div>
                  )}

                  {subscription.endDate && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4" />
                      <span>Expires: {formatDate(subscription.endDate)}</span>
                    </div>
                  )}
                </>
              )}

              {subscription.activatedAt && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4" />
                  <span>Activated: {formatDate(subscription.activatedAt)}</span>
                </div>
              )}

              {(subscription.status === "PENDING" ||
                subscription.status === "QUEUED") &&
                subscription.queuePosition && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Clock className="w-4 h-4" />
                    <span>Queue position: #{subscription.queuePosition}</span>
                  </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {subscription.status === "QUEUED" && (
                <button
                  onClick={() => handleActivateClick(subscription._id)}
                  disabled={loading[subscription._id]}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {loading[subscription._id]
                    ? "Loading..."
                    : "🚀 Activate Subscription"}
                </button>
              )}

              {subscription.status === "ACTIVE" && (
                <>
                  <button
                    onClick={() =>
                      router.push(`/bitdefender/renew/${subscription._id}`)
                    }
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <RefreshCw className="w-4 h-4 inline mr-2" />
                    Renew Now
                  </button>
                  {/* <button className="p-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                    <Settings className="w-4 h-4" />
                  </button> */}
                </>
              )}

              {subscription.status === "EXPIRED" && (
                <button className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium">
                  <Key className="w-4 h-4 inline mr-2" />
                  Renew Encryption
                </button>
              )}
            </div>

            {/* Error display */}
            {error[subscription._id] && !showActivation[subscription._id] && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                ❌ {error[subscription._id]}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EncryptionCard;
