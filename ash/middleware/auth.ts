// middleware/authMiddleware.ts
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import Admin from "@/models/Admin";
import connectDB from "../lib/mongodb";


const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";

export interface AuthenticatedRequest extends NextRequest {
  admin?: {
    id: string;
    username: string;
    role: string;
  };
}

export async function verifyAdmin(request: NextRequest): Promise<{
  success: boolean;
  admin?: {
    id: string;
    username: string;
    role: string;
  };
  error?: string;
}> {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { success: false, error: "No valid authorization token provided" };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    await connectDB();
    const admin = await Admin.findById(decoded.adminId);

    if (!admin || !admin.isActive) {
      return { success: false, error: "Admin not found or inactive" };
    }

    return {
      success: true,
      admin: {
        id: admin._id.toString(),
        username: admin.username,
        role: admin.role,
      },
    };
  } catch (error: any) {
    return { success: false, error: "Invalid or expired token" };
  }
}
