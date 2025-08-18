"use client";

import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Label } from "@radix-ui/react-label";
import { ArrowLeft, CloudUpload, ShieldCheck, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import StatusModal from "../components/StatusModal";

const StatusPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    phoneNumber: "",
    image1: null as File | null,
    image2: null as File | null,
  });

  // Modal state
  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    status: "unencrypted" | "pending" | "encrypted" ;
    isExistingUser: boolean;
    statusDetails: string;
    userId: string;
  }>({
    isOpen: false,
    status: "pending",
    isExistingUser: false,
    statusDetails: "",
    userId: "",
  });

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image1" | "image2"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [type]: file,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation before sending
      if (
        !formData.fullName ||
        !formData.address ||
        !formData.phoneNumber ||
        !formData.image1 ||
        !formData.image2
      ) {
        toast.error("Please fill in all fields and upload both images");
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("fullName", formData.fullName);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("phoneNumber", formData.phoneNumber);
      formDataToSend.append("image1", formData.image1);
      formDataToSend.append("image2", formData.image2);

      const response = await fetch("/api/users/status", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      console.log("Status Response:", data);

      if (data.success) {
        // Show the status modal
        setModalData({
          isOpen: true,
          status: data.data.status,
          isExistingUser: data.data.isExistingUser,
          statusDetails: data.data.statusDetails,
          userId: data.data.userId,
        });

        toast.success("Status check completed!");
      } else {
        toast.error(data.error || "Status check failed");
      }
    } catch (error: any) {
      console.error("Status check error:", error);
      toast.error("Status check failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      address: "",
      phoneNumber: "",
      image1: null,
      image2: null,
    });

    // Reset file inputs
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach((input: any) => (input.value = ""));

    setModalData((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 pt-6 pb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="p-2 rounded-full hover:bg-white/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-3 items-center">
            <Image src="/logo.svg" width={40} height={40} alt="logo" />
            <p
              className={`text-[1.5rem] text-[#003883]`}
              style={{ fontFamily: "Lobster" }}
            >
              Status
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
                <User />
                Personal Information
              </CardTitle>
              <CardDescription className="text-gray-600">
                Enter the same details used during encryption
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  className="bg-gray-50 border-gray-200 rounded-xl h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-gray-700">
                  Address
                </Label>
                <Textarea
                  id="address"
                  placeholder="Enter your complete address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="bg-gray-50 border-gray-200 rounded-xl min-h-20 resize-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-gray-700">
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                  className="bg-gray-50 border-gray-200 rounded-xl h-12"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* License Upload */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
                <ShieldCheck />
                Verification Document
              </CardTitle>
              <CardDescription className="text-gray-600">
                Upload clear pictures of your valid driver's license.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Front License */}
              <div className="space-y-2">
                <Label className="text-gray-700">Front Side</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors bg-gray-50/50">
                  <input
                    id="frontLicense"
                    type="file"
                    onChange={(e) => handleFileUpload(e, "image1")}
                    className="hidden"
                    accept="image/*"
                    required
                  />
                  <label
                    htmlFor="frontLicense"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <CloudUpload color="gray" />
                    <span className="font-medium text-gray-700">
                      {formData.image1
                        ? formData.image1.name
                        : "Upload front side"}
                    </span>
                    <span className="text-sm text-gray-500">
                      JPG, PNG up to 10MB
                    </span>
                  </label>
                </div>
              </div>

              {/* Back License */}
              <div className="space-y-2">
                <Label className="text-gray-700">Back Side</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors bg-gray-50/50">
                  <input
                    id="backLicense"
                    type="file"
                    onChange={(e) => handleFileUpload(e, "image2")}
                    className="hidden"
                    accept="image/*"
                    required
                  />
                  <label
                    htmlFor="backLicense"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <CloudUpload color="gray" />
                    <span className="font-medium text-gray-700">
                      {formData.image2
                        ? formData.image2.name
                        : "Upload back side"}
                    </span>
                    <span className="text-sm text-gray-500">
                      JPG, PNG up to 10MB
                    </span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent p-4 -mx-4">
            <Button
              type="submit"
              className="w-full h-14 bg-gradient-to-r from-blue-500 to-gray-600 hover:from-gray-600 hover:to-pink-700 text-white rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border-0"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Checking Status..." : "Check Status"}
            </Button>
          </div>
        </form>

        {/* Status Modal */}
        <StatusModal
          isOpen={modalData.isOpen}
          onClose={resetForm}
          status={modalData.status}
          isExistingUser={modalData.isExistingUser}
          statusDetails={modalData.statusDetails}
          userId={modalData.userId}
        />
      </div>
    </div>
  );
};

export default StatusPage;
