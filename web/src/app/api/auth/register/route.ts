import { NextRequest, NextResponse } from "next/server";
import {
  extractClientIP,
  extractIPFromBody,
  getBestClientIP,
} from "@/middleware/ipExtractor";

export async function POST(request: NextRequest) {
  // const authHeader = request.headers.get("authorization");
  // const token = authHeader?.split(" ")[1];

  // if (!token) {
  //   return NextResponse.json({ error: "Missing token" }, { status: 401 });
  // }

  try {
    // Get client IP from multiple sources
    const clientIP = await getBestClientIP(request);

    const formData = await request.formData();

    // Extract all form data
    const registrationData = {
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
      deviceName: formData.get("deviceName"),
      imei: formData.get("imei"),
      phoneNumber: formData.get("phoneNumber"),
      plan: formData.get("plan"),
      clientIP: clientIP, // Add IP to registration data
    };

    // Handle file uploads
    const files: File[] = [];
    for (let i = 0; i < 10; i++) {
      const file = formData.get(`file_${i}`) as File;
      if (file) files.push(file);
    }

    // Send to your actual API
    const apiFormData = new FormData();
    Object.entries(registrationData).forEach(([key, value]) => {
      if (value) apiFormData.append(key, value as string);
    });

    files.forEach((file, index) => {
      apiFormData.append(`files`, file);
    });

    const response = await fetch(`${process.env.API_BASE_URL}/auth/create`, {
      method: "POST",
      body: apiFormData,
      headers: {
        // Add IP to headers as well for backend processing
        "X-Client-IP": clientIP,
        "X-Real-IP": clientIP,
      },
    });

    const result = await response.json();

    console.log("Login attempt from IP:", result);

    console.log("Registration API response with IP:", {
      clientIP,
      success: result.success,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            result?.message === "Failed to upload files to Cloudinary"
              ? "Failed to upload"
              : result?.message || "Registration failed",
        },
        { status: response.status }
      );
    }

    // Handle successful registration that requires email verification
    if (result.success && result.data?.requiresVerification) {
      return NextResponse.json({
        success: true,
        message: result.message,
        data: result.data,
      });
    }

    // Handle normal successful registration (user logged in immediately)
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Registration API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Registration failed",
      },
      { status: 500 }
    );
  }
}
