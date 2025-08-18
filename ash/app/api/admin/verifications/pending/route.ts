import { verifyAdmin } from "@/middleware/auth";
import { UserVerificationService } from "@/services/verification.service";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const verification = await verifyAdmin(request);

    if (!verification.success) {
      return NextResponse.json(
        { success: false, error: verification.error },
        { status: 401 }
      );
    }

    const pendingUsers =
      await UserVerificationService.getPendingVerifications();

    return NextResponse.json({
      success: true,
      data: pendingUsers,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch pending verifications",
      },
      { status: 500 }
    );
  }
}