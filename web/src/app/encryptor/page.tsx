"use client";

import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  Copy,
  Loader2,
  Shield,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "@/components/Guard";
import ProfileDrawer from "@/components/Profiler";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

// Toast notification component
const Toast = ({
  message,
  type,
  show,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "warning";
  show: boolean;
  onClose: () => void;
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-yellow-500";

  return (
    <div
      className={`fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-md shadow-lg z-50 transition-opacity duration-300`}
    >
      {message}
    </div>
  );
};

const EncryptorPage = () => {
  const { user, logout, checkActiveStatus } = useAuthStore();
  const router = useRouter();

  // Encryption status states
  const [isEncrypted, setIsEncrypted] = useState<boolean>(false);
  const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Encryption functionality state
  const [textToEncrypt, setTextToEncrypt] = useState<string>("");
  const [encryptedText, setEncryptedText] = useState<string>("");
  const [textToDecrypt, setTextToDecrypt] = useState<string>("");
  const [decryptedText, setDecryptedText] = useState<string>("");
  const [cipherKey, setCipherKey] = useState<string>("");
  const [method, setMethod] = useState<string>("");
  const [contentVisible, setContentVisible] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Toast state
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "warning";
  }>({ show: false, message: "", type: "success" });

  const showToast = (
    message: string,
    type: "success" | "error" | "warning"
  ) => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  useEffect(() => {
    if (method) {
      setContentVisible(false);
      const timer = setTimeout(() => {
        setContentVisible(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [method]);

  // Check active subscription status on component mount
  useEffect(() => {
    const checkUserActiveStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await checkActiveStatus();

        if (response.success) {
          const { hasActiveSubscription, activeSubscriptions: activeSubs } =
            response.data;
          setIsEncrypted(hasActiveSubscription);
          setActiveSubscriptions(activeSubs || []);

          if (!hasActiveSubscription) {
            setError(
              "No active subscriptions found. Please activate a subscription to use the encryptor."
            );
          }
        } else {
          setError("Failed to check subscription status");
          setIsEncrypted(false);
        }
      } catch (err) {
        console.error("Error checking active status:", err);
        setError("Could not verify your subscription status");
        setIsEncrypted(false);
      } finally {
        setLoading(false);
      }
    };

    checkUserActiveStatus();
  }, [checkActiveStatus]);

  const encryptText = (text: string, key: string): string => {
    if (!text || !key) return "";

    let numericKey = 0;
    for (let i = 0; i < key.length; i++) {
      numericKey += key.charCodeAt(i);
    }
    numericKey = numericKey % 26;

    let result = "";
    for (let i = 0; i < text.length; i++) {
      let char = text[i];
      if (char.match(/[a-z]/i)) {
        const code = text.charCodeAt(i);
        if (code >= 65 && code <= 90) {
          char = String.fromCharCode(((code - 65 + numericKey) % 26) + 65);
        } else if (code >= 97 && code <= 122) {
          char = String.fromCharCode(((code - 97 + numericKey) % 26) + 97);
        }
      }
      result += char;
    }
    return result;
  };

  const decryptText = (text: string, key: string): string => {
    if (!text || !key) return "";

    let numericKey = 0;
    for (let i = 0; i < key.length; i++) {
      numericKey += key.charCodeAt(i);
    }
    numericKey = numericKey % 26;

    let result = "";
    for (let i = 0; i < text.length; i++) {
      let char = text[i];
      if (char.match(/[a-z]/i)) {
        const code = text.charCodeAt(i);
        if (code >= 65 && code <= 90) {
          char = String.fromCharCode(((code - 65 - numericKey + 26) % 26) + 65);
        } else if (code >= 97 && code <= 122) {
          char = String.fromCharCode(((code - 97 - numericKey + 26) % 26) + 97);
        }
      }
      result += char;
    }
    return result;
  };

  const handleEncrypt = () => {
    if (!textToEncrypt) {
      showToast("Please enter text to encrypt", "error");
      return;
    }
    if (!cipherKey) {
      showToast("Please enter a cipher key", "error");
      return;
    }
    const encrypted = encryptText(textToEncrypt, cipherKey);
    setEncryptedText(encrypted);
  };

  const handleDecrypt = () => {
    if (!textToDecrypt) {
      showToast("Please enter text to decrypt", "error");
      return;
    }
    if (!cipherKey) {
      showToast("Please enter a cipher key", "error");
      return;
    }
    const decrypted = decryptText(textToDecrypt, cipherKey);
    setDecryptedText(decrypted);
  };

  const handleClearEncrypt = () => {
    setTextToEncrypt("");
    setEncryptedText("");
  };

  const handleClearDecrypt = () => {
    setTextToDecrypt("");
    setDecryptedText("");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setIsCopied(true);
        showToast("Text copied to clipboard", "success");
        setTimeout(() => setIsCopied(false), 2000);
      },
      (err) => {
        console.error("Could not copy text: ", err);
        showToast("Failed to copy text", "error");
      }
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!user) return null;

  return (
    <ProtectedRoute>
      <div className="h-[100dvh] overflow-hidden px-4 py-4 bg-cover bg-center relative flex flex-col">
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
              Encryptor
            </span>
          </div>
          <ProfileDrawer user={user} onLogout={logout} />
        </div>

        <div className="flex flex-col items-start w-full space-y-4 flex-1 overflow-y-auto">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center w-full py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">Checking subscription status...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 h-5 text-red-500 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
              <div className="mt-3">
                <Link
                  href="/bitdefender"
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                >
                  Manage Encryptions
                </Link>
              </div>
            </div>
          )}

          {/* Subscription Status Display */}
          {!loading && !error && (
            <div className="w-full">
              <div className="flex items-center space-x-2 mb-4">
                {/* <span>Subscription Status:</span> */}
                <div
                  className={`flex items-center px-3 py-1 rounded-full ${
                    isEncrypted
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      isEncrypted ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  {isEncrypted ? "Active" : "Inactive"}
                </div>
              </div>

              {/* Active Subscriptions Info */}
              {/* {isEncrypted && activeSubscriptions.length > 0 && (
                <div className="w-full p-3 mb-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center mb-2">
                    <Shield className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">
                      Active Subscriptions ({activeSubscriptions.length})
                    </span>
                  </div>
                  {activeSubscriptions.map((subscription, index) => (
                    <div
                      key={subscription._id}
                      className="text-xs text-green-700 mb-1"
                    >
                      <span className="font-medium">
                        {subscription.deviceName}
                      </span>{" "}
                      -<span className="ml-1">{subscription.plan}</span> -
                      <span className="ml-1">
                        Expires: {formatDate(subscription.endDate)}
                      </span>
                    </div>
                  ))}
                </div>
              )} */}
            </div>
          )}

          {/* Encryptor Interface - Only show if user has active subscription */}
          {!loading && !error && isEncrypted && (
            <>
              <div className="w-full">
                <label className="block mb-2 text-sm font-medium">
                  Cipher Key: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter cipher here"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={cipherKey}
                  onChange={(e) => setCipherKey(e.target.value)}
                />
              </div>

              <div className="w-full">
                <label className="block mb-2 text-sm font-medium">Type:</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  <option value="">Select method</option>
                  <option value="encrypt">Encrypt</option>
                  <option value="decrypt">Decrypt</option>
                </select>
              </div>

              {cipherKey.trim() && (
                <div
                  className={`w-full mt-3 transition-opacity duration-300 ${
                    contentVisible ? "opacity-100" : "opacity-0"
                  } ${method ? "h-auto" : "h-0 overflow-hidden"}`}
                >
                  {method === "encrypt" && (
                    <div className="w-full p-4 bg-white border rounded-md shadow-sm">
                      <h3 className="mb-4 font-bold">Encryption Panel</h3>

                      <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium">
                          Enter text to encrypt
                        </label>
                        <textarea
                          className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={textToEncrypt}
                          onChange={(e) => setTextToEncrypt(e.target.value)}
                        />
                      </div>

                      <div className="flex justify-center mb-4 space-x-4">
                        <button
                          className="px-4 py-2 text-white bg-gradient-to-r from-blue-400 to-blue-600 rounded-md hover:from-blue-500 hover:to-blue-700"
                          onClick={handleEncrypt}
                        >
                          Encrypt
                        </button>
                        <button
                          className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                          onClick={handleClearEncrypt}
                        >
                          Clear
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            Encrypted Text:
                          </span>
                          <button
                            onClick={() =>
                              encryptedText && handleCopy(encryptedText)
                            }
                            disabled={!encryptedText}
                            className={`${
                              encryptedText
                                ? "cursor-pointer"
                                : "cursor-not-allowed opacity-50"
                            }`}
                          >
                            <Copy
                              className={`w-4 h-4 ${
                                isCopied ? "text-green-500" : ""
                              }`}
                            />
                          </button>
                        </div>
                        <textarea
                          className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                          value={encryptedText}
                          readOnly
                        />
                      </div>
                    </div>
                  )}

                  {method === "decrypt" && (
                    <div className="w-full p-4 bg-white border rounded-md shadow-sm">
                      <h3 className="mb-4 font-bold">Decryption Panel</h3>

                      <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium">
                          Enter text to decrypt
                        </label>
                        <textarea
                          className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={textToDecrypt}
                          onChange={(e) => setTextToDecrypt(e.target.value)}
                        />
                      </div>

                      <div className="flex justify-center mb-4 space-x-4">
                        <button
                          className="px-4 py-2 text-white bg-gradient-to-r from-blue-400 to-blue-600 rounded-md hover:from-blue-500 hover:to-blue-700"
                          onClick={handleDecrypt}
                        >
                          Decrypt
                        </button>
                        <button
                          className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                          onClick={handleClearDecrypt}
                        >
                          Clear
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            Decrypted Text:
                          </span>
                          <button
                            onClick={() =>
                              decryptedText && handleCopy(decryptedText)
                            }
                            disabled={!decryptedText}
                            className={`${
                              decryptedText
                                ? "cursor-pointer"
                                : "cursor-not-allowed opacity-50"
                            }`}
                          >
                            <Copy
                              className={`w-4 h-4 ${
                                isCopied ? "text-green-500" : ""
                              }`}
                            />
                          </button>
                        </div>
                        <textarea
                          className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                          value={decryptedText}
                          readOnly
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <Toast
          message={toast.message}
          type={toast.type}
          show={toast.show}
          onClose={hideToast}
        />
      </div>
    </ProtectedRoute>
  );
};

export default EncryptorPage;
