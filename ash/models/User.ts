import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  address: string;
  phoneNumber: string;
  imageUrls: string[]; // Array of image URLs
  imagePublicIds: string[]; // Array of Cloudinary public IDs for deletion
  status: "unencrypted" | "pending" | "encrypted";
  encryptedData?: string; // Encrypted user data after approval
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  declineReason?: string;
}

const UserSchema: Schema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: [500, "Address cannot exceed 500 characters"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number"],
    },
    imageUrls: [
      {
        type: String,
        required: [true, "At least one image is required"],
      },
    ],
    imagePublicIds: [
      {
        type: String,
        required: [true, "Image public IDs are required"],
      },
    ],
    status: {
      type: String,
      enum: ["unencrypted", "pending", "encrypted"],
      default: "unencrypted",
    },
    encryptedData: {
      type: String,
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    declineReason: {
      type: String,
      maxlength: [500, "Decline reason cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Custom validation to ensure exactly 2 images
UserSchema.pre<IUser>("save", function (next) {
  if (this.imageUrls && this.imageUrls.length !== 2) {
    next(new Error("Exactly 2 images are required"));
  } else if (this.imagePublicIds && this.imagePublicIds.length !== 2) {
    next(new Error("Exactly 2 image public IDs are required"));
  } else {
    next();
  }
});

// Index for efficient queries
UserSchema.index({ status: 1, createdAt: -1 });
UserSchema.index({ phoneNumber: 1 }, { unique: true });

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
