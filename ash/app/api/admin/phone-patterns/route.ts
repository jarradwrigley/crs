import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyAdmin } from "@/middleware/auth";

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

    await connectDB();

    // Get all unique phone number patterns (original numbers)
    const phonePatterns = await User.aggregate([
      {
        $project: {
          originalPhone: {
            $regexFind: {
              input: "$phoneNumber",
              regex: "^(.+?)(?:\\d{5})?$",
            },
          },
          phoneNumber: 1,
          status: 1,
          createdAt: 1,
        },
      },
      {
        $group: {
          _id: "$originalPhone.captures",
          count: { $sum: 1 },
          statuses: { $addToSet: "$status" },
          latestEntry: { $max: "$createdAt" },
          entries: {
            $push: {
              phoneNumber: "$phoneNumber",
              status: "$status",
              createdAt: "$createdAt",
            },
          },
        },
      },
      {
        $sort: { count: -1, latestEntry: -1 },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: phonePatterns,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch phone patterns",
      },
      { status: 500 }
    );
  }
}
