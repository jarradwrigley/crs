import { verifyAdmin } from "@/middleware/auth";
import { UserVerificationService } from "@/services/verification.service";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  phoneNumber: string;
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
    const phoneNumber = decodeURIComponent(resolvedParams.phoneNumber);

    // Get all entries for this phone number
    const allEntries = await UserVerificationService.getAllEntriesByPhoneNumber(
      phoneNumber
    );

    // Get statistics
    const stats = await UserVerificationService.getStatusCheckStatsByPhone(
      phoneNumber
    );

    // Group entries by type
    const originalEntry = allEntries.find(
      (entry) => entry.phoneNumber === phoneNumber
    );
    const statusCheckEntries = allEntries.filter(
      (entry) => entry.phoneNumber !== phoneNumber
    );

    return NextResponse.json({
      success: true,
      data: {
        originalPhoneNumber: phoneNumber,
        statistics: stats,
        originalEntry: originalEntry || null,
        statusCheckEntries: statusCheckEntries,
        totalEntries: allEntries.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch phone entries",
      },
      { status: 500 }
    );
  }
}
