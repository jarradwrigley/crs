import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Call your backend API to resend verification
    const response = await fetch(
      `${process.env.API_BASE_URL}/auth/resend-verification`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: result?.message || "Failed to resend verification email",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: result?.message || "Verification email sent successfully",
    });
  } catch (error: any) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to resend verification email" },
      { status: 500 }
    );
  }
}
