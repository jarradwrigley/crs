import { AuthService } from "@/services/api.service";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    console.log("BODY", body);
    const { username, email, password } = body;

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Username, email, and password are required",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a valid email address",
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 8 characters long",
        },
        { status: 400 }
      );
    }

    // Check if super admin already exists
    const { exists } = await AuthService.checkSuperAdminExists();

    if (exists) {
      return NextResponse.json(
        {
          success: false,
          error: "Super admin already exists. Only one super admin is allowed.",
        },
        { status: 409 } // Conflict
      );
    }

    // Create the first super admin
    const result = await AuthService.createFirstSuperAdmin({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
    });

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: "Super admin created successfully",
          admin: result.admin,
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error in create-superadmin API:", error);

    // Handle specific error types
    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid data provided",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Please try again later.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if super admin exists (for setup status)
    const result = await AuthService.checkSuperAdminExists();

    return NextResponse.json(
      {
        success: true,
        exists: result.exists,
        needsSetup: result.needsSetup,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error checking super admin status:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to check setup status",
      },
      { status: 500 }
    );
  }
}

// Prevent other HTTP methods
export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
