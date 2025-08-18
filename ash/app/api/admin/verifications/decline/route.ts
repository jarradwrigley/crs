import { verifyAdmin } from "@/middleware/auth";
import { UserVerificationService } from "@/services/verification.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const verification = await verifyAdmin(request);

    if (!verification.success) {
      return NextResponse.json(
        { success: false, error: verification.error },
        { status: 401 }
      );
    }

    const { userId, reason } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await UserVerificationService.declineVerification({
      userId,
      adminId: verification.admin!.id,
      approved: false,
      reason,
    });

    return NextResponse.json({
      success: true,
      message: "User verification declined successfully",
      data: user,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to decline verification",
      },
      { status: 500 }
    );
  }
}
