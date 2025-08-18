import { UserVerificationService } from "@/services/verification.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const stats = await UserVerificationService.getVerificationStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch verification stats",
      },
      { status: 500 }
    );
  }
}
