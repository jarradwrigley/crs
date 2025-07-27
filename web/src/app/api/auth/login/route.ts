import { getBestClientIP } from "@/middleware/ipExtractor";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const clientIP = await getBestClientIP(request);
    const { email, password } = await request.json();

    // Call backend API with IP information
    const response = await fetch(`${process.env.API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Client-IP": clientIP,
        "X-Real-IP": clientIP,
      },
      body: JSON.stringify({
        username: email,
        password,
        clientIP: clientIP, // Include in body as well
        loginTimestamp: new Date().toISOString(),
      }),
    });

    const result = await response.json();

    
    if (!result.success) {
      // console.log("Result from IP:", result);
      return NextResponse.json(
        {
          success: false,
          error: result?.message || "Authentication failed",
          data: result?.data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Authentication failed",
      },
      { status: 401 }
    );
  }
}
