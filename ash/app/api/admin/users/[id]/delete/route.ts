import { UserVerificationService } from "@/services/verification.service";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  id: string;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { adminId } = await request.json();

    if (!adminId) {
      return NextResponse.json(
        { success: false, error: "Admin ID is required" },
        { status: 400 }
      );
    }

    // Await the params Promise
    const resolvedParams = await params;

    await UserVerificationService.deleteUser(resolvedParams.id, adminId);

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
