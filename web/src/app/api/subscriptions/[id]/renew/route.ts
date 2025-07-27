import { getBestClientIP } from "@/middleware/ipExtractor";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  try {
    // Get client IP
    const clientIP = await getBestClientIP(request);

    // Await the params
    const { id } = await params;
    const { newPlan, paymentMethod } = await request.json();

    if (!id || id.trim() === "") {
      return NextResponse.json(
        { error: "Invalid subscription ID" },
        { status: 400 }
      );
    }

    if (!newPlan || !paymentMethod) {
      return NextResponse.json(
        { error: "Missing required details" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${process.env.API_BASE_URL}/subscriptions/${id}/renew`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Client-IP": clientIP,
          "X-Real-IP": clientIP,
        },
        body: JSON.stringify({
          subscriptionId: id,
          newPlan,
          paymentMethod,
          clientIP: clientIP,
          renewalTimestamp: new Date().toISOString(),
        }),
      }
    );

    const optionsResult = await response.json();

    console.log("Subscription renewal from IP:", clientIP, {
      subscriptionId: id,
      newPlan,
      success: optionsResult.success,
    });

    if (!optionsResult.success) {
      throw new Error(optionsResult?.message.toString() || "Renewal failed");
    }

    return NextResponse.json(optionsResult);
  } catch (error) {
    console.error("Error renewing subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
