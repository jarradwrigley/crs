import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Verification token is required",
        },
        { status: 400 }
      );
    }

    // Call your backend API to verify the email
    const response = await fetch(
      `${process.env.API_BASE_URL}/auth/verify-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: result?.message || "Email verification failed",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: result?.message || "Email verified successfully",
      data: result?.data,
    });
  } catch (error: any) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Email verification failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
