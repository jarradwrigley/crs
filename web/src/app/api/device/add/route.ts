// src/app/api/devices/add/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  try {
    const formData = await request.formData();

    // Extract all form data
    const deviceData = {
      deviceName: formData.get("deviceName"),
      imei: formData.get("imei"),
      phoneNumber: formData.get("phoneNumber"),
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
    Object.entries(deviceData).forEach(([key, value]) => {
      if (value) apiFormData.append(key, value as string);
    });

    files.forEach((file, index) => {
      apiFormData.append(`files`, file);
    });

    // The backend might use the same registration endpoint for adding devices
    // You may need to adjust this based on your actual backend API
    const response = await fetch(
      `${process.env.API_BASE_URL}/devices/add`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: apiFormData,
      }
    );

    const result = await response.json();

    console.log("ADD DEVICE API response", result);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: result?.message || "Failed to add device",
        },
        { status: response.status }
      );
    }

    // Handle successful device addition
    return NextResponse.json({
      success: true,
      message: result.message || "Device added successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Add Device API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add device",
      },
      { status: 500 }
    );
  }
}
