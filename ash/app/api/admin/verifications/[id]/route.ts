import { verifyAdmin } from "@/middleware/auth";
import { UserVerificationService } from "@/services/verification.service";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    // Verify admin authentication
    const verification = await verifyAdmin(request);

    if (!verification.success) {
      return NextResponse.json(
        { success: false, error: verification.error },
        { status: 401 }
      );
    }

    // Await the params Promise
    const resolvedParams = await params;

    const user = await UserVerificationService.getUserForReview(
      resolvedParams.id
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch user" },
      { status: 500 }
    );
  }
}
