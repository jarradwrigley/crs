import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin, { IAdmin } from "@/models/Admin";
import connectDB from "../lib/mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  admin?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  error?: string;
}

export interface CreateSuperAdminData {
  username: string;
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Admin login
   */
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      await connectDB();

      const { username, password } = credentials;

      // Find admin by username
      const admin = await Admin.findOne({ username }).select("+password");

      if (!admin || !admin.isActive) {
        return {
          success: false,
          error: "Invalid credentials or account inactive",
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, admin.password);

      if (!isPasswordValid) {
        return { success: false, error: "Invalid credentials" };
      }

      // Update last login
      admin.lastLogin = new Date();
      await admin.save();

      // Generate JWT token
      const token = jwt.sign(
        { adminId: admin._id, username: admin.username, role: admin.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      return {
        success: true,
        token,
        admin: {
          id: admin._id.toString(),
          username: admin.username,
          email: admin.email,
          role: admin.role,
        },
      };
    } catch (error: any) {
      return { success: false, error: "Login failed" };
    }
  }

  /**
   * Create the first and only super admin
   * This method can only be used when no super admin exists
   */
  static async createFirstSuperAdmin(
    adminData: CreateSuperAdminData
  ): Promise<{ success: boolean; admin?: any; error?: string }> {
    try {
      await connectDB();

      // Check if any super admin already exists
      const existingSuperAdmin = await Admin.findOne({ role: "super_admin" });

      if (existingSuperAdmin) {
        return {
          success: false,
          error: "Super admin already exists. Only one super admin is allowed.",
        };
      }

      // Validate required fields
      if (!adminData.username?.trim()) {
        return { success: false, error: "Username is required" };
      }
      if (!adminData.email?.trim()) {
        return { success: false, error: "Email is required" };
      }
      if (!adminData.password || adminData.password.length < 6) {
        return {
          success: false,
          error: "Password is required and must be at least 6 characters",
        };
      }

      // Check if username or email already exists
      const existingAdmin = await Admin.findOne({
        $or: [
          { username: adminData.username.trim().toLowerCase() },
          { email: adminData.email.trim().toLowerCase() },
        ],
      });

      if (existingAdmin) {
        return {
          success: false,
          error: "Username or email already exists",
        };
      }

      // Hash password with high salt rounds for security
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

      // Create the super admin
      const superAdmin = new Admin({
        username: adminData.username.trim().toLowerCase(),
        email: adminData.email.trim().toLowerCase(),
        password: hashedPassword,
        role: "super_admin",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await superAdmin.save();

      return {
        success: true,
        admin: {
          id: superAdmin._id.toString(),
          username: superAdmin.username,
          email: superAdmin.email,
          role: superAdmin.role,
        },
      };
    } catch (error: any) {
      console.error("Error creating first super admin:", error);

      if (error.code === 11000) {
        return { success: false, error: "Username or email already exists" };
      }

      return {
        success: false,
        error: "Failed to create super admin. Please try again.",
      };
    }
  }

  /**
   * Check if super admin exists
   */
  static async checkSuperAdminExists(): Promise<{
    exists: boolean;
    needsSetup: boolean;
    error?: string;
  }> {
    try {
      await connectDB();

      const superAdmin = await Admin.findOne({ role: "super_admin" });
      const totalAdmins = await Admin.countDocuments();

      return {
        exists: !!superAdmin,
        needsSetup: !superAdmin && totalAdmins === 0,
      };
    } catch (error: any) {
      console.error("Error checking super admin:", error);
      return {
        exists: false,
        needsSetup: false,
        error: "Failed to check admin status",
      };
    }
  }

  /**
   * Create new admin (super admin only)
   */
  static async createAdmin(
    adminData: {
      username: string;
      email: string;
      password: string;
      role?: "admin" | "super_admin";
    },
    creatorId: string
  ): Promise<{ success: boolean; admin?: any; error?: string }> {
    try {
      await connectDB();

      // Verify creator is super admin
      const creator = await Admin.findById(creatorId);
      if (!creator || creator.role !== "super_admin") {
        return {
          success: false,
          error: "Only super admins can create new admins",
        };
      }

      // Prevent creating another super admin
      if (adminData.role === "super_admin") {
        const existingSuperAdmin = await Admin.findOne({ role: "super_admin" });
        if (
          existingSuperAdmin &&
          existingSuperAdmin._id.toString() !== creatorId
        ) {
          return {
            success: false,
            error: "Only one super admin is allowed",
          };
        }
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

      const admin = new Admin({
        ...adminData,
        username: adminData.username.trim().toLowerCase(),
        email: adminData.email.trim().toLowerCase(),
        password: hashedPassword,
        role: adminData.role || "admin",
      });

      await admin.save();

      return {
        success: true,
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
        },
      };
    } catch (error: any) {
      if (error.code === 11000) {
        return { success: false, error: "Username or email already exists" };
      }
      return { success: false, error: "Failed to create admin" };
    }
  }

  /**
   * Verify token and get admin info
   */
  static async verifyToken(
    token: string
  ): Promise<{ success: boolean; admin?: any; error?: string }> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      await connectDB();
      const admin = await Admin.findById(decoded.adminId);

      if (!admin || !admin.isActive) {
        return { success: false, error: "Admin not found or inactive" };
      }

      return {
        success: true,
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
        },
      };
    } catch (error) {
      return { success: false, error: "Invalid or expired token" };
    }
  }
}
