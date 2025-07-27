"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { RegisterData } from "@/types/auth";
import { usePricing } from "@/hooks/usePricing";

interface AuthFormProps {
  mode: "login" | "register";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
  const [registrationSuccessData, setRegistrationSuccessData] = useState<{
    email: string;
    message: string;
  } | null>(null);

  // Register form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [deviceIMEI, setDeviceIMEI] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const { login, register, isLoading } = useAuthStore();
  const router = useRouter();
  const { allPlans, formatPrice } = usePricing();

  // Remove the hardcoded subscriptionPlans array and replace with:
  const subscriptionPlans = allPlans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    price: formatPrice(plan.price),
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

  // Removed resend verification function - user should just check their inbox

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailVerificationRequired(false);

    try {
      if (mode === "login") {
        await login(email, password);
        router.push("/dashboard");
      } else {
        // Validate register form
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          return;
        }

        if (!selectedPlan) {
          setError("Please select a subscription plan");
          return;
        }

        const registerData: RegisterData = {
          username: name,
          email,
          password,
          deviceName,
          imei: deviceIMEI,
          phoneNumber: phone,
          plan: selectedPlan,
          files,
        };

        await register(registerData);
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.log("Auth Error:", err);
      
      // Handle email verification case for login
      if (mode === "login" && err.code === "EMAIL_VERIFICATION_REQUIRED") {
        setEmailVerificationRequired(true);
        setVerificationEmail(err.email || email);
        setError(err.message);
      }

      else if (mode === 'login' && err.message === "Invalid credentials") {
        setError(
          err.message ||
            (mode === "login" ? "Invalid credentials" : "Registration failed")
        );

      }
      // Handle registration success with email verification required
      else if (mode === "register" && err.code === "REGISTRATION_SUCCESS_VERIFICATION_REQUIRED") {
        setShowRegistrationSuccess(true);
        setRegistrationSuccessData({
          email: err.email || email,
          message: err.message
        });
      } else {
        // Handle other errors - now showing the actual backend message
        setError(err.message || (mode === "login" ? "Invalid credentials" : "Registration failed"));
      }
    }
  };

  if (mode === "login") {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded-lg"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded-lg"
          required
        />

        {error && (
          <div className={`text-sm p-3 rounded-lg ${
            emailVerificationRequired 
              ? "bg-yellow-50 text-yellow-800 border border-yellow-200" 
              : "bg-red-50 text-red-800 border border-red-200"
          }`}>
            <p>{error}</p>
            {emailVerificationRequired && (
              <div className="mt-3">
                <p className="text-sm">
                  Please check your inbox and click the verification link to activate your account. 
                  Don't forget to check your spam folder if you don't see the email.
                </p>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white p-3 rounded-lg disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Login"}
        </button>
      </form>
    );
  }

  return (
    <>
      {/* Registration Success Modal */}
      {showRegistrationSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 mx-4">
            <div className="text-center">
              {/* Success Icon */}
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
              
              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Account Created Successfully!
              </h3>
              
              {/* Message */}
              <div className="text-gray-600 mb-6 space-y-2">
                <p>{registrationSuccessData?.message}</p>
                <p className="text-sm">
                  Please check your inbox at <strong>{registrationSuccessData?.email}</strong> and 
                  click the verification link to activate your account.
                </p>
                <p className="text-sm text-gray-500">
                  Don't forget to check your spam folder if you don't see the email.
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowRegistrationSuccess(false);
                    router.push("/auth/login");
                  }}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Go to Login
                </button>
                <button
                  onClick={() => setShowRegistrationSuccess(false)}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Form */}
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* User Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          User Information
        </h3>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border rounded-lg placeholder-gray-400"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded-lg placeholder-gray-400"
          required
        />

        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-3 border rounded-lg placeholder-gray-400"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded-lg placeholder-gray-400"
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-3 border rounded-lg placeholder-gray-400"
          required
        />
      </div>

      {/* Device Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Device Information
        </h3>

        <input
          type="text"
          placeholder="Device Name"
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
      </div>

      {/* Subscription Plan Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Subscription Plan
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
                <h4 className="font-medium text-gray-900">{plan.name}</h4>
                <span className="text-blue-600 font-semibold">
                  {plan.price}
                </span>
              </div>
              <ul className="text-sm text-gray-600">
                {plan.features.map((feature, index) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </div>

      {/* Upload Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Upload Documents
        </h3>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileUpload}
            className="w-full"
          />
          <p className="text-sm text-gray-600 mt-2">
            Upload JPG, PNG, or PDF files (max 10MB each, up to 10 files)
          </p>
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
        disabled={isLoading}
        className="w-full bg-blue-500 text-white p-3 rounded-lg disabled:opacity-50 font-medium"
      >
        {isLoading ? "Encrypting..." : "Encrypt Device"}
      </button>
    </form>
  </>
  );
}