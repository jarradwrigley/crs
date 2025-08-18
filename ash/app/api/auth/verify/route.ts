import { verifyAdmin } from "@/middleware/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const verification = await verifyAdmin(request);

    if (!verification.success) {
      return NextResponse.json(
        { success: false, error: verification.error },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: verification.admin,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Token verification failed" },
      { status: 500 }
    );
  }
}
