"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "@radix-ui/react-label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Shield,
  User,
  Lock,
  Eye,
  EyeOff,
  Mail,
  AlertCircle,
  CheckCircle,
  Key,
  ArrowLeft,
  Crown,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

const AdminRegistrationPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [inviteValidated, setInviteValidated] = useState(false);
  const [inviteData, setInviteData] = useState<any>(null);
  const [isFirstAdmin, setIsFirstAdmin] = useState(false);
  const [showRegistrationSecret, setShowRegistrationSecret] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    registrationSecret: "",
    inviteCode: searchParams?.get("invite") || "",
  });

  const [validationErrors, setValidationErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // checkFirstAdmin();
    // if (formData.inviteCode) {
    //   validateInviteCode();
    // }
  }, []);

  const checkFirstAdminn = async () => {
    try {
      const response = await fetch("/api/admin/check-first");
      const data = await response.json();
      setIsFirstAdmin(data.isFirstAdmin);
    } catch (error) {
      console.error("Error checking first admin:", error);
    }
  };

  const validateInviteCode = async () => {
    if (!formData.inviteCode) return;

    try {
      const response = await fetch("/api/admin/invites/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: formData.inviteCode }),
      });

      const data = await response.json();

      if (data.success) {
        setInviteValidated(true);
        setInviteData(data.data);
        if (data.data.email) {
          setFormData((prev) => ({ ...prev, email: data.data.email }));
        }
        toast.success("Valid invite code!");
      } else {
        toast.error(data.error || "Invalid invite code");
        setInviteValidated(false);
      }
    } catch (error) {
      console.error("Error validating invite:", error);
      toast.error("Failed to validate invite code");
      setInviteValidated(false);
    }
  };

  const validateForm = () => {
    const errors = {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    // Username validation
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.values(errors).every((error) => error === "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    // Check authorization requirements
    if (!isFirstAdmin && !inviteValidated && !formData.registrationSecret) {
      toast.error(
        "Registration requires an invite code or registration secret"
      );
      return;
    }

    setIsLoading(true);

    try {
      //   const response = await fetch("/api/auth/register", {
      const response = await fetch("/api/auth/superadmin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          inviteCode: formData.inviteCode || undefined,
          registrationSecret: formData.registrationSecret || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and redirect to dashboard
        localStorage.setItem("adminToken", data.token);
        toast.success(data.message);
        router.push("/admin/dashboard");
      } else {
        toast.error(data.error || "Registration failed");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    const levels = [
      { label: "Very Weak", color: "bg-red-500" },
      { label: "Weak", color: "bg-red-400" },
      { label: "Fair", color: "bg-yellow-400" },
      { label: "Good", color: "bg-blue-400" },
      { label: "Strong", color: "bg-green-400" },
      { label: "Very Strong", color: "bg-green-500" },
    ];

    return { strength, ...levels[Math.min(strength, 5)] };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/login")}
              className="absolute left-4 top-4 p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-gray-600 rounded-full flex items-center justify-center shadow-lg">
              {isFirstAdmin ? (
                <Crown className="w-8 h-8 text-yellow-300" />
              ) : (
                <Shield className="w-8 h-8 text-white" />
              )}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isFirstAdmin ? "Create Super Admin" : "Admin Registration"}
          </h1>
          <p className="text-gray-600">
            {isFirstAdmin
              ? "Set up the first administrator account"
              : "Create your admin account to get started"}
          </p>
        </div>

        {/* Status Cards */}
        {isFirstAdmin && (
          <Card className="border-2 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">
                    First Admin Setup
                  </p>
                  <p className="text-sm text-yellow-700">
                    You will be granted Super Admin privileges
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {inviteValidated && (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">
                    Valid Invite Code
                  </p>
                  <p className="text-sm text-green-700">
                    Role: {inviteData?.role} • Expires:{" "}
                    {new Date(inviteData?.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Registration Form */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-gray-800">
              Admin Account Details
            </CardTitle>
            <CardDescription>
              Enter your information to create an admin account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Invite Code (if not first admin) */}
              {!isFirstAdmin && (
                <div className="space-y-2">
                  <Label
                    htmlFor="inviteCode"
                    className="text-gray-700 font-medium"
                  >
                    Invite Code (Optional)
                  </Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="inviteCode"
                      type="text"
                      placeholder="Enter invite code"
                      value={formData.inviteCode}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          inviteCode: e.target.value.toUpperCase(),
                        }))
                      }
                      className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl"
                    />
                    {formData.inviteCode && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={validateInviteCode}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      >
                        Validate
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Registration Secret (if not first admin and no valid invite) */}
              {!isFirstAdmin && !inviteValidated && (
                <div className="space-y-2">
                  <Label
                    htmlFor="registrationSecret"
                    className="text-gray-700 font-medium"
                  >
                    Registration Secret
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="registrationSecret"
                      type={showRegistrationSecret ? "text" : "password"}
                      placeholder="Enter registration secret"
                      value={formData.registrationSecret}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          registrationSecret: e.target.value,
                        }))
                      }
                      className="pl-10 pr-10 h-12 bg-gray-50 border-gray-200 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowRegistrationSecret(!showRegistrationSecret)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showRegistrationSecret ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Required if you don't have an invite code
                  </p>
                </div>
              )}

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700 font-medium">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    className={`pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.username
                        ? "border-red-300 focus:ring-red-500"
                        : ""
                    }`}
                    required
                  />
                </div>
                {validationErrors.username && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors.username}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className={`pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.email
                        ? "border-red-300 focus:ring-red-500"
                        : ""
                    }`}
                    disabled={inviteValidated && inviteData?.email}
                    required
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors.email}
                  </p>
                )}
                {inviteValidated && inviteData?.email && (
                  <p className="text-xs text-green-600">
                    Email provided by invite code
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className={`pl-10 pr-10 h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.password
                        ? "border-red-300 focus:ring-red-500"
                        : ""
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{
                            width: `${(passwordStrength.strength / 6) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {passwordStrength.label}
                      </span>
                    </div>
                  </div>
                )}

                {validationErrors.password && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-gray-700 font-medium"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className={`pl-10 pr-10 h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.confirmPassword
                        ? "border-red-300 focus:ring-red-500"
                        : ""
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword &&
                  formData.password === formData.confirmPassword && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Passwords match
                    </p>
                  )}
                {validationErrors.confirmPassword && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-gray-600 hover:from-blue-600 hover:to-gray-700 text-white rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </div>
                ) : (
                  `Create ${isFirstAdmin ? "Super " : ""}Admin Account`
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Login Link */}
        <Card className="border-0 bg-white/50 backdrop-blur-sm">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an admin account?{" "}
                <button
                  onClick={() => router.push("/admin/login")}
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="border-0 bg-amber-50/80 backdrop-blur-sm">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Security Requirements</p>
                <ul className="text-amber-700 mt-1 space-y-1">
                  <li>• Passwords must be at least 6 characters long</li>
                  <li>• Include uppercase, lowercase, and numbers</li>
                  <li>• Admin accounts have access to sensitive data</li>
                  {!isFirstAdmin && (
                    <li>• Registration requires invitation or secret key</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminRegistrationPage;
