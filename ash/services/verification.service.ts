// services/userVerificationService.ts
import User, { IUser } from "@/models/User";
import Admin, { IAdmin } from "@/models/Admin";
import connectDB from "@/lib/mongodb";
import { EncryptionService } from "@/services/encryption.service";
import mongoose from "mongoose";
import { CloudinaryService } from "./cloudinary.service";

export interface CreateUserData {
  fullName: string;
  address: string;
  phoneNumber: string;
  imageUrls: string[]; // Array of 2 image URLs
  imagePublicIds: string[]; // Array of 2 Cloudinary public IDs
}

export interface VerificationDecision {
  userId: string;
  adminId: string;
  approved: boolean;
  reason?: string;
}

export class UserVerificationService {
  /**
   * Create a new user verification request
   */
  static async createUser(userData: CreateUserData): Promise<IUser> {
    try {
      await connectDB();

      // Check if phone number already exists
      const existingUser = await User.findOne({
        phoneNumber: userData.phoneNumber,
      });
      if (existingUser) {
        throw new Error("User with this phone number already exists");
      }

      // Validate that exactly 2 images are provided
      if (!userData.imageUrls || userData.imageUrls.length !== 2) {
        throw new Error("Exactly 2 images are required");
      }

      if (!userData.imagePublicIds || userData.imagePublicIds.length !== 2) {
        throw new Error("Image public IDs are required for both images");
      }

      const user = new User({
        ...userData,
        status: "pending",
      });

      await user.save();
      return user;
    } catch (error: any) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Get user by phone number (exact match only - no slug variants)
   */
  static async getUserByPhoneNumber(
    phoneNumber: string
  ): Promise<IUser | null> {
    try {
      await connectDB();
      // Only find exact phone number match (original number without slug)
      return await User.findOne({ phoneNumber: phoneNumber }).select(
        "-encryptedData"
      );
    } catch (error: any) {
      throw new Error(`Failed to fetch user by phone: ${error.message}`);
    }
  }

  /**
   * Generate unique phone number with slug to avoid duplicates
   */
  static async generateUniquePhoneNumber(
    originalPhoneNumber: string
  ): Promise<string> {
    try {
      await connectDB();

      // Count existing entries that start with this phone number
      const existingCount = await User.countDocuments({
        phoneNumber: { $regex: `^${originalPhoneNumber}` },
      });

      // If no existing entries, use original number
      if (existingCount === 0) {
        return originalPhoneNumber;
      }

      // Generate slug with leading zeros (5 digits)
      const slug = String(existingCount).padStart(5, "0");
      const uniquePhoneNumber = `${originalPhoneNumber}${slug}`;

      // Double-check this unique number doesn't exist (edge case protection)
      const existingWithSlug = await User.findOne({
        phoneNumber: uniquePhoneNumber,
      });
      if (existingWithSlug) {
        // If somehow it exists, increment until we find a unique one
        for (let i = existingCount + 1; i <= 99999; i++) {
          const newSlug = String(i).padStart(5, "0");
          const testPhoneNumber = `${originalPhoneNumber}${newSlug}`;
          const testExisting = await User.findOne({
            phoneNumber: testPhoneNumber,
          });
          if (!testExisting) {
            return testPhoneNumber;
          }
        }
        throw new Error("Maximum phone number variations reached (99999)");
      }

      return uniquePhoneNumber;
    } catch (error: any) {
      throw new Error(
        `Failed to generate unique phone number: ${error.message}`
      );
    }
  }

  /**
   * Get all entries for a phone number (including slug variants)
   */
  static async getAllEntriesByPhoneNumber(
    originalPhoneNumber: string
  ): Promise<IUser[]> {
    try {
      await connectDB();
      return await User.find({
        phoneNumber: { $regex: `^${originalPhoneNumber}` },
      })
        .sort({ createdAt: -1 })
        .select("-encryptedData");
    } catch (error: any) {
      throw new Error(`Failed to fetch all entries by phone: ${error.message}`);
    }
  }

  /**
   * Create a status check entry (for audit trail) - now handles unique phone numbers
   */
  static async createStatusCheck(userData: CreateUserData): Promise<IUser> {
    try {
      await connectDB();

      // Validate that exactly 2 images are provided
      if (!userData.imageUrls || userData.imageUrls.length !== 2) {
        throw new Error("Exactly 2 images are required");
      }

      if (!userData.imagePublicIds || userData.imagePublicIds.length !== 2) {
        throw new Error("Image public IDs are required for both images");
      }

      // Create a new entry for status check (phoneNumber should already be unique when passed)
      const statusCheck = new User({
        ...userData,
        status: "pending", // Always start with pending for new entries
      });

      await statusCheck.save();
      return statusCheck;
    } catch (error: any) {
      throw new Error(`Failed to create status check: ${error.message}`);
    }
  }

  /**
   * Extract original phone number from slugged phone number
   */
  static extractOriginalPhoneNumber(phoneNumber: string): string {
    // Check if phone number has a 5-digit slug at the end
    const slugPattern = /^(.+?)(\d{5})$/;
    const match = phoneNumber.match(slugPattern);

    if (match) {
      const originalPart = match[1];
      const slugPart = match[2];

      // Verify the slug part is actually a slug (all digits, potentially with leading zeros)
      if (/^\d{5}$/.test(slugPart)) {
        return originalPart;
      }
    }

    // If no slug pattern found, return original number
    return phoneNumber;
  }

  /**
   * Get status check statistics by original phone number
   */
  static async getStatusCheckStatsByPhone(
    originalPhoneNumber: string
  ): Promise<{
    totalChecks: number;
    originalUserStatus: string | null;
    lastCheckDate: Date | null;
  }> {
    try {
      await connectDB();

      // Get all entries for this phone number
      const allEntries = await this.getAllEntriesByPhoneNumber(
        originalPhoneNumber
      );

      // Find the original user (exact phone number match)
      const originalUser = allEntries.find(
        (user) => user.phoneNumber === originalPhoneNumber
      );

      // Get the most recent check
      const lastCheck = allEntries.length > 0 ? allEntries[0] : null;

      return {
        totalChecks: allEntries.length,
        originalUserStatus: originalUser ? originalUser.status : null,
        lastCheckDate: lastCheck ? lastCheck.createdAt : null,
      };
    } catch (error: any) {
      throw new Error(`Failed to get status check stats: ${error.message}`);
    }
  }

  /**
   * Get all status checks by phone number (for admin view)
   */
  static async getStatusChecksByPhone(phoneNumber: string): Promise<IUser[]> {
    try {
      await connectDB();
      return await User.find({ phoneNumber })
        .sort({ createdAt: -1 })
        .select("-encryptedData");
    } catch (error: any) {
      throw new Error(`Failed to fetch status checks: ${error.message}`);
    }
  }

  /**
   * Get user status with additional info
   */
  static async getUserStatus(userId: string): Promise<{
    user: IUser;
    statusMessage: string;
    canResubmit: boolean;
  } | null> {
    try {
      await connectDB();

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID");
      }

      const user = await User.findById(userId).select("-encryptedData");
      if (!user) {
        return null;
      }

      const statusMessages = {
        pending:
          "Your application is currently under review. We will notify you once a decision is made.",
        encrypted:
          "Congratulations! Your verification has been encrypted and your data is now encrypted.",
        unencrypted:
          "Your verification was declined. You may resubmit with corrected information.",
      };

      return {
        user,
        statusMessage:
          statusMessages[user.status as keyof typeof statusMessages],
        canResubmit: user.status === "unencrypted",
      };
    } catch (error: any) {
      throw new Error(`Failed to get user status: ${error.message}`);
    }
  }

  /**
   * Get all pending verification requests
   */
  static async getPendingVerifications(): Promise<IUser[]> {
    try {
      await connectDB();
      return await User.find({ status: "pending" })
        .sort({ createdAt: -1 })
        .select("-encryptedData");
    } catch (error: any) {
      throw new Error(
        `Failed to fetch pending verifications: ${error.message}`
      );
    }
  }

  /**
   * Get user by ID for admin review
   */
  static async getUserForReview(userId: string): Promise<IUser | null> {
    try {
      await connectDB();

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID");
      }

      return await User.findById(userId).select("-encryptedData");
    } catch (error: any) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }

  /**
   * Approve user verification and encrypt data
   */
  static async approveVerification(
    decision: VerificationDecision
  ): Promise<IUser> {
    try {
      await connectDB();

      if (!mongoose.Types.ObjectId.isValid(decision.userId)) {
        throw new Error("Invalid user ID");
      }

      if (!mongoose.Types.ObjectId.isValid(decision.adminId)) {
        throw new Error("Invalid admin ID");
      }

      // Verify admin exists
      const admin = await Admin.findById(decision.adminId);
      if (!admin || !admin.isActive) {
        throw new Error("Admin not found or inactive");
      }

      // Get user
      const user = await User.findById(decision.userId);
      if (!user) {
        throw new Error("User not found");
      }

      if (user.status !== "pending") {
        throw new Error("User verification already processed");
      }

      // Encrypt user data
      const encryptedData = EncryptionService.encryptUserData({
        fullName: user.fullName,
        address: user.address,
        phoneNumber: user.phoneNumber,
      });

      // Update user status
      user.status = "encrypted";
      user.encryptedData = encryptedData;
      user.approvedAt = new Date();
      user.approvedBy = new mongoose.Types.ObjectId(decision.adminId);

      await user.save();

      // Return user without sensitive data
      return (await User.findById(user._id).select("-encryptedData")) as IUser;
    } catch (error: any) {
      throw new Error(`Failed to approve verification: ${error.message}`);
    }
  }

  /**
   * Decline user verification
   */
  static async declineVerification(
    decision: VerificationDecision
  ): Promise<IUser> {
    try {
      await connectDB();

      if (!mongoose.Types.ObjectId.isValid(decision.userId)) {
        throw new Error("Invalid user ID");
      }

      if (!mongoose.Types.ObjectId.isValid(decision.adminId)) {
        throw new Error("Invalid admin ID");
      }

      // Verify admin exists
      const admin = await Admin.findById(decision.adminId);
      if (!admin || !admin.isActive) {
        throw new Error("Admin not found or inactive");
      }

      // Get user
      const user = await User.findById(decision.userId);
      if (!user) {
        throw new Error("User not found");
      }

      if (user.status !== "pending") {
        throw new Error("User verification already processed");
      }

      // Update user status
      user.status = "unencrypted";
      user.declineReason = decision.reason || "Verification declined by admin";
      user.approvedBy = new mongoose.Types.ObjectId(decision.adminId);

      await user.save();

      // Optionally delete the uploaded images from Cloudinary
      try {
        for (const publicId of user.imagePublicIds) {
          await CloudinaryService.deleteImage(publicId);
        }
      } catch (error) {
        console.error("Failed to delete images from Cloudinary:", error);
        // Don't throw here as the user status update is more important
      }

      return user;
    } catch (error: any) {
      throw new Error(`Failed to decline verification: ${error.message}`);
    }
  }

  /**
   * Get approved user's decrypted data (admin only)
   */
  static async getDecryptedUserData(
    userId: string,
    adminId: string
  ): Promise<{
    user: IUser;
    decryptedData: {
      fullName: string;
      address: string;
      phoneNumber: string;
    };
  }> {
    try {
      await connectDB();

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID");
      }

      if (!mongoose.Types.ObjectId.isValid(adminId)) {
        throw new Error("Invalid admin ID");
      }

      // Verify admin exists and has proper permissions
      const admin = await Admin.findById(adminId);
      if (!admin || !admin.isActive) {
        throw new Error("Admin not found or inactive");
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      if (user.status !== "encrypted" || !user.encryptedData) {
        throw new Error("User not approved or no encrypted data available");
      }

      // Decrypt the data
      const decryptedData = EncryptionService.decryptUserData(
        user.encryptedData
      );

      return {
        user: user,
        decryptedData: decryptedData,
      };
    } catch (error: any) {
      throw new Error(`Failed to get decrypted data: ${error.message}`);
    }
  }

  /**
   * Get verification statistics
   */
  static async getVerificationStats(): Promise<{
    total: number;
    pending: number;
    encrypted: number;
    unencrypted: number;
  }> {
    try {
      await connectDB();

      const stats = await User.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const result = {
        total: 0,
        pending: 0,
        encrypted: 0,
        unencrypted: 0,
      };

      stats.forEach((stat) => {
        result.total += stat.count;
        result[stat._id as keyof typeof result] = stat.count;
      });

      return result;
    } catch (error: any) {
      throw new Error(`Failed to get verification stats: ${error.message}`);
    }
  }

  /**
   * Delete user and associated image
   */
  static async deleteUser(userId: string, adminId: string): Promise<void> {
    try {
      await connectDB();

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID");
      }

      if (!mongoose.Types.ObjectId.isValid(adminId)) {
        throw new Error("Invalid admin ID");
      }

      // Verify admin exists
      const admin = await Admin.findById(adminId);
      if (!admin || !admin.isActive) {
        throw new Error("Admin not found or inactive");
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Delete images from Cloudinary
      try {
        for (const publicId of user.imagePublicIds) {
          await CloudinaryService.deleteImage(publicId);
        }
      } catch (error) {
        console.error("Failed to delete images from Cloudinary:", error);
      }

      // Delete user from database
      await User.findByIdAndDelete(userId);
    } catch (error: any) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}
