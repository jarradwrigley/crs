"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Plus,
  Smartphone,
  Shield,
  Upload,
  Info,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import ProtectedRoute from "@/components/Guard";
import ProfileDrawer from "@/components/Profiler";
import { toast, Toaster } from "sonner";
import { NewDeviceData } from "@/types/auth";
import { usePricing } from "@/hooks/usePricing";

export default function AddDevicePage() {
  const router = useRouter();
  const { user, logout, isLoading, addNewDevice } = useAuthStore();

  // Form state
  const [deviceName, setDeviceName] = useState("");
  const [deviceIMEI, setDeviceIMEI] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { allPlans, formatPrice } = usePricing();

  // Remove the hardcoded subscriptionPlans array and replace with:
  const subscriptionPlans = allPlans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    price: formatPrice(plan.price),
    duration: plan.durationText,
    features: plan.features.filter((f) => f.included).map((f) => f.text),
  }));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    // Validate file types
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    const invalidFiles = selectedFiles.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      setError("Only JPG, PNG, and PDF files are allowed");
      return;
    }

    // Validate file sizes (10MB each)
    const oversizedFiles = selectedFiles.filter(
      (file) => file.size > 10 * 1024 * 1024
    );
    if (oversizedFiles.length > 0) {
      setError("Each file must be less than 10MB");
      return;
    }

    // Validate total number of files
    const totalFiles = files.length + selectedFiles.length;
    if (totalFiles > 10) {
      setError("Maximum 10 files allowed");
      return;
    }

    setFiles((prev) => [...prev, ...selectedFiles]);
    setError("");
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Validate form including mandatory file upload
    if (!deviceName || !deviceIMEI || !phoneNumber || !selectedPlan) {
      setError("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    // Check if at least one file is uploaded
    if (files.length === 0) {
      setError("Please upload at least one document");
      setIsSubmitting(false);
      return;
    }

    try {
      // Create FormData for the request
      const formData = new FormData();
      formData.append("deviceName", deviceName);
      formData.append("imei", deviceIMEI);
      formData.append("phoneNumber", phoneNumber);
      formData.append("plan", selectedPlan);

      // Add files
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });

      const registerData: NewDeviceData = {
        deviceName,
        imei: deviceIMEI,
        plan: selectedPlan,
        phoneNumber: phoneNumber,
        files,
      };

      const result = await addNewDevice(registerData);
      // Call the add device API endpoint
      // const response = await fetch("/api/device/add", {
      //   method: "POST",
      //   headers: {
      //     Authorization: `Bearer ${user?.accessToken}`,
      //   },
      //   body: formData,
      // });

      // const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to add device");
      }

      setShowSuccess(true);
      toast.success("Device Added Successfully!", {
        description: "Your new device has been added to your account.",
      });

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/bitdefender/manage");
      }, 2000);
    } catch (err: any) {
      console.error("Add device error:", err);
      setError(err.message || "Failed to add device");
      toast.error("Failed to add device", {
        description: err.message || "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen px-4 py-4 bg-cover bg-center relative flex flex-col overflow-y-auto">
        <div className="back-image" />

        {/* Header */}
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
              Add New Device
            </span>
          </div>
          <ProfileDrawer user={user} onLogout={logout} />
        </div>

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 mx-4">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg
                    className="h-6 w-6 text-green-600"
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

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Device Added Successfully!
                </h3>

                <div className="text-gray-600 mb-6 space-y-2">
                  <p>Your new device has been queued for encryption.</p>
                  <p className="text-sm">
                    Device: <strong>{deviceName}</strong>
                  </p>
                  <p className="text-sm text-gray-500">
                    You'll receive a notification when it's ready for
                    activation.
                  </p>
                </div>

                <button
                  onClick={() => router.push("/bitdefender/manage")}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  View My Devices
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6 pb-6">
            {/* Device Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Device Information
              </h3>

              <input
                type="text"
                placeholder="Device Name (e.g., John's iPhone)"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="w-full p-3 border rounded-lg placeholder-gray-400"
                required
              />

              <input
                type="text"
                placeholder="Device IMEI"
                value={deviceIMEI}
                onChange={(e) => setDeviceIMEI(e.target.value)}
                className="w-full p-3 border rounded-lg placeholder-gray-400"
                required
              />

              <input
                type="tel"
                placeholder="Phone Number for this device"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-3 border rounded-lg placeholder-gray-400"
                required
              />
            </div>

            {/* Subscription Plan Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Choose Encryption Plan
              </h3>

              <div className="space-y-3">
                {subscriptionPlans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() =>
                      setSelectedPlan(selectedPlan === plan.id ? "" : plan.id)
                    }
                    className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                      selectedPlan === plan.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {plan.name}
                        </h4>
                        <p className="text-sm text-gray-600">{plan.duration}</p>
                      </div>
                      <span className="text-blue-600 font-semibold">
                        {plan.price}
                      </span>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="text-green-500">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Section - Now Required */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Documents <span className="text-red-500">*</span>
              </h3>

              <div
                className={`border-2 border-dashed rounded-lg p-4 ${
                  files.length === 0
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileUpload}
                  className="w-full"
                  required
                />
                <p className="text-sm text-gray-600 mt-2">
                  <span className="text-red-500 font-medium">Required:</span>{" "}
                  Upload at least one document (JPG, PNG, or PDF files, max 10MB
                  each, up to 10 files)
                </p>
                {files.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    Please upload at least one document to proceed
                  </p>
                )}
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">
                    Uploaded Files ({files.length}/10):
                  </h4>
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-100 p-2 rounded"
                    >
                      <span className="text-sm text-gray-700 truncate">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-800 border border-red-200 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-500 text-white p-3 rounded-lg disabled:opacity-50 font-medium flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Adding Device...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Device
                </>
              )}
            </button>
          </form>
        </div>

        <Toaster position="top-center" />
      </div>
    </ProtectedRoute>
  );
}
