import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "ash-documents",
      allowed_formats: ["jpg", "jpeg", "png", "pdf"],
      public_id: `id-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
      transformation: [
        { width: 800, height: 600, crop: "limit" },
        { quality: "auto:good" },
      ],
    };
  },
});

// Multer configuration
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image files and PDFs are allowed"));
    }
  },
});

// Cloudinary service functions
export class CloudinaryService {
  /**
   * Delete image from Cloudinary
   */
  static async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error("Error deleting image from Cloudinary:", error);
      throw new Error("Failed to delete image");
    }
  }

  /**
   * Get optimized image URL
   */
  static getOptimizedUrl(publicId: string, options?: object): string {
    return cloudinary.url(publicId, {
      transformation: [
        { width: 400, height: 300, crop: "fill" },
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ],
      ...options,
    });
  }
}

export default cloudinary;
