import { verifyAdmin } from "@/middleware/auth";
import { AuthService } from "@/services/api.service";
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

    const body = await request.json();
    console.log("BODY", body);
    const { username, email, password, role } = body;
    // const { username, email, password, role } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    const result = await AuthService.createAdmin(
      { username, email, password, role },
      verification.admin!.id
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Admin created successfully",
        admin: result.admin,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to create admin" },
      { status: 500 }
    );
  }
}
