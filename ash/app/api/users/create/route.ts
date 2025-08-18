import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { UserVerificationService } from "@/services/verification.service";
// import { upload } from "@/services/cloudinary.service";


import { promisify } from "util";

// Helper to handle multer in Next.js App Router
// const uploadSingle = promisify(upload.single("idImage"));

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    console.log('FORMDDARA:', formData)

    const fullName = formData.get("fullName") as string;
    const address = formData.get("address") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const image1 = formData.get("image1") as File;
    const image2 = formData.get("image2") as File;

    // Validation
    if (!fullName || !address || !phoneNumber || !image1 || !image2) {
      return NextResponse.json(
        {
          success: false,
          error: "All fields including both images are required",
        },
        { status: 400 }
      );
    }

    const imageUrls: string[] = [];
    const imagePublicIds: string[] = [];

    // Upload both images to Cloudinary

        for (const [index, image] of [image1, image2].entries()) {
          console.log(`Processing image ${index + 1}...`);

          try {
            // Check file size (Cloudinary free tier has 10MB limit)
            if (image.size > 10 * 1024 * 1024) {
              throw new Error(
                `Image ${index + 1} is too large (${Math.round(
                  image.size / 1024 / 1024
                )}MB). Maximum 10MB allowed.`
              );
            }

            const bytes = await image.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64String = buffer.toString("base64");
            const dataUri = `data:${image.type};base64,${base64String}`;

            console.log(
              `Uploading image ${index + 1} (${Math.round(
                image.size / 1024
              )}KB)...`
            );

            const uploadResult = await cloudinary.uploader.upload(dataUri, {
              folder: "ash-encrypt",
              resource_type: "image",
              public_id: `status-${Date.now()}-${index + 1}-${Math.round(
                Math.random() * 1e9
              )}`,
              transformation: [
                { width: 800, height: 600, crop: "limit" },
                { quality: "auto:good" },
              ],
              // Add timeout and retry options
              timeout: 60000,
            });

            console.log(
              `Image ${index + 1} uploaded successfully:`,
              uploadResult.public_id
            );

            imageUrls.push(uploadResult.secure_url);
            imagePublicIds.push(uploadResult.public_id);
          } catch (uploadError: any) {
            console.error(`Image ${index + 1} upload failed:`, {
              message: uploadError.message,
              http_code: uploadError.http_code,
              error: uploadError,
            });

            // Provide more specific error messages
            if (uploadError.http_code === 500) {
              throw new Error(
                `Cloudinary server error while uploading image ${
                  index + 1
                }. Please try again.`
              );
            } else if (uploadError.message?.includes("File size too large")) {
              throw new Error(
                `Image ${
                  index + 1
                } is too large. Please use an image smaller than 10MB.`
              );
            } else {
              throw new Error(
                `Failed to upload image ${index + 1}: ${
                  uploadError.message || "Unknown error"
                }`
              );
            }
          }
        }

    // Create user verification request
    const user = await UserVerificationService.createUser({
      fullName,
      address,
      phoneNumber,
      imageUrls,
      imagePublicIds,
    });

    return NextResponse.json(
      {
        success: true,
        message: "User verification request created successfully",
        data: {
          id: user._id,
          status: user.status,
          createdAt: user.createdAt,
          imageCount: user.imageUrls.length,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("User creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create user verification request",
      },
      { status: 500 }
    );
  }
}