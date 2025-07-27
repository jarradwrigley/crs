import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const formData = await request.formData();

    // Extract all form data
    const registrationData = {
      deviceId: formData.get("deviceId"),
      plan: formData.get("plan"),
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

    const response = await fetch(
      `${process.env.API_BASE_URL}/subscriptions/new`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: apiFormData,
      }
    );

    const result = await response.json();

    // console.log("REG API response", result);

    if (!response.ok) {
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
