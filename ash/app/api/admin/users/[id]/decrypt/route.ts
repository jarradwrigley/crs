import { verifyAdmin } from "@/middleware/auth";
import { UserVerificationService } from "@/services/verification.service";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  id: string;
}

export async function POST(
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

    const result = await UserVerificationService.getDecryptedUserData(
      resolvedParams.id,
      verification.admin!.id
    );

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: result.user._id,
          status: result.user.status,
          approvedAt: result.user.approvedAt,
          createdAt: result.user.createdAt,
          imageUrls: result.user.imageUrls,
        },
        decryptedData: result.decryptedData,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to decrypt user data" },
      { status: 500 }
    );
  }
}
