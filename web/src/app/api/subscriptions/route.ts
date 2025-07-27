import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: true,
      message: "Subscription activated successfully",
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
