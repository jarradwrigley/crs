import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    // Call backend API to get active subscription status
    const response = await fetch(
      `${process.env.API_BASE_URL}/subscriptions/active-status`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    console.log("Active Status API response:", result);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result?.message || "Failed to fetch active status",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Active Status API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch active status",
      },
      { status: 500 }
    );
  }
}
