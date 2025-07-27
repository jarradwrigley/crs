import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const { subscriptionId, imei, totpCode } = await request.json();

    if (!subscriptionId || !totpCode || !imei) {
      return NextResponse.json(
        { error: "Subscription ID, IMEI and TOTP code are required" },
        { status: 400 }
      );
    }

    // Validate TOTP code format
    if (!/^\d{6}$/.test(totpCode)) {
      return NextResponse.json(
        { error: "Invalid TOTP code format" },
        { status: 400 }
      );
    }

    // Call your backend API to activate subscription
    const response = await fetch(
      `${process.env.API_BASE_URL}/subscriptions/activate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subscriptionId, imei, totpCode }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: result?.message || "Failed to activate subscription",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error: any) {
    console.error("Activate subscription API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to activate subscription",
      },
      { status: 500 }
    );
  }
}
