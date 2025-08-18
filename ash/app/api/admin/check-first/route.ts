import { NextRequest, NextResponse } from "next/server";
import Admin from "@/models/Admin";
import connectDB from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const adminCount = await Admin.countDocuments();
    const isFirstAdmin = adminCount === 0;

    return NextResponse.json({
      success: true,
      isFirstAdmin,
      adminCount,
    });
  } catch (error: any) {
    console.error("Error checking first admin:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check admin status" },
      { status: 500 }
    );
  }
}

// app/api/admin/invites/[id]/revoke/route.ts
