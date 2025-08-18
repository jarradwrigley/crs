import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import mongoose from "mongoose";

interface Params {
  id: string;
}

// GET - Fetch user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    await connectDB();

    // Await the params Promise
    const resolvedParams = await params;

    if (!mongoose.Types.ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json(
        { success: false, error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const user = await User.findById(resolvedParams.id);

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
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    await connectDB();
    const body = await request.json();

    // Await the params Promise
    const resolvedParams = await params;

    if (!mongoose.Types.ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json(
        { success: false, error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(resolvedParams.id, body, {
      new: true,
      runValidators: true,
    });

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
      { success: false, error: error.message || "Failed to update user" },
      { status: 400 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    await connectDB();

    // Await the params Promise
    const resolvedParams = await params;

    if (!mongoose.Types.ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json(
        { success: false, error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndDelete(resolvedParams.id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
