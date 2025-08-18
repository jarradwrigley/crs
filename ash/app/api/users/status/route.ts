// app/api/users/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { UserVerificationService } from "@/services/verification.service";

export async function POST(request: NextRequest) {
  try {
    console.log("=== API Route Started ===");

    // Check if Cloudinary is configured
    console.log("Cloudinary config:", {
      cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
      api_key: !!process.env.CLOUDINARY_API_KEY,
      api_secret: !!process.env.CLOUDINARY_API_SECRET,
    });

    try {
      await cloudinary.api.ping();
      console.log("Cloudinary connection successful");
    } catch (cloudinaryError) {
      console.error("Cloudinary connection failed:", cloudinaryError);
      throw new Error("Cloudinary service unavailable");
    }

    const formData = await request.formData();
    console.log("FormData entries:", Array.from(formData.entries()));

    const fullName = formData.get("fullName") as string;
    const address = formData.get("address") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const image1 = formData.get("image1") as File;
    const image2 = formData.get("image2") as File;

    console.log("Extracted data:", {
      fullName: !!fullName,
      address: !!address,
      phoneNumber: !!phoneNumber,
      image1: !!image1,
      image2: !!image2,
    });

    // Validation
    if (!fullName || !address || !phoneNumber || !image1 || !image2) {
      console.log("Validation failed");
      return NextResponse.json(
        {
          success: false,
          error: "All fields including both images are required",
        },
        { status: 400 }
      );
    }

    console.log("Checking existing user...");
    // Check if user already exists with this phone number (original number only)
    const existingUser = await UserVerificationService.getUserByPhoneNumber(
      phoneNumber
    );
    console.log("Existing user found:", !!existingUser);

    const imageUrls: string[] = [];
    const imagePublicIds: string[] = [];

    console.log("Starting image uploads...");
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
          `Uploading image ${index + 1} (${Math.round(image.size / 1024)}KB)...`
        );

        const uploadResult = await cloudinary.uploader.upload(dataUri, {
          folder: "ash-status-checks",
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

    console.log("Generating unique phone number...");
    // Generate unique phone number with slug for new entry
    const uniquePhoneNumber =
      await UserVerificationService.generateUniquePhoneNumber(phoneNumber);
    console.log("Unique phone number generated");

    console.log("Creating status check entry...");
    // Create new status check entry with unique phone number
    const statusCheckEntry = await UserVerificationService.createStatusCheck({
      fullName,
      address,
      phoneNumber: uniquePhoneNumber, // Use the unique phone number
      imageUrls,
      imagePublicIds,
    });
    console.log("Status check entry created");

    // Determine status to return (always based on original phone number)
    let userStatus = "unencrypted"; // Default status for new users
    let userId = statusCheckEntry._id;

    if (existingUser) {
      userStatus = existingUser.status;
      userId = existingUser._id; // Use original user's ID for status
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: userId,
        status: userStatus,
        isExistingUser: !!existingUser,
        statusCheckId: statusCheckEntry._id,
        originalPhoneNumber: phoneNumber,
        savedPhoneNumber: uniquePhoneNumber,
        message: existingUser
          ? `Status for existing user: ${userStatus}`
          : "New user created with pending status",
        statusDetails:
          {
            pending: "Your application is under review",
            encrypted: "Your verification has been encrypted",
            unencrypted: "Your verification was unencrypted",
          }[userStatus as "pending" | "encrypted" | "unencrypted"] ||
          "Status unknown",
      },
    });
  } catch (error: any) {
    console.error("=== DETAILED ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Error details:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to check status",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// export async function POST(request: NextRequest) {
//   try {
//     const formData = await request.formData();

//     console.log('FORMDATA:', formData)

//     const fullName = formData.get("fullName") as string;
//     const address = formData.get("address") as string;
//     const phoneNumber = formData.get("phoneNumber") as string;
//     const image1 = formData.get("image1") as File;
//     const image2 = formData.get("image2") as File;

//     // Validation
//     if (!fullName || !address || !phoneNumber || !image1 || !image2) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "All fields including both images are required",
//         },
//         { status: 400 }
//       );
//     }

//     // Check if user already exists with this phone number (original number only)
//     const existingUser = await UserVerificationService.getUserByPhoneNumber(
//       phoneNumber
//     );

//     const imageUrls: string[] = [];
//     const imagePublicIds: string[] = [];

//     // Upload both images to Cloudinary
//     for (const [index, image] of [image1, image2].entries()) {
//       const bytes = await image.arrayBuffer();
//       const buffer = Buffer.from(bytes);

//       const uploadResult = await new Promise((resolve, reject) => {
//         cloudinary.uploader
//           .upload_stream(
//             {
//               folder: "user-status-checks",
//               allowed_formats: ["jpg", "jpeg", "png", "pdf"],
//               public_id: `status-${Date.now()}-${index + 1}-${Math.round(
//                 Math.random() * 1e9
//               )}`,
//               transformation: [
//                 { width: 800, height: 600, crop: "limit" },
//                 { quality: "auto:good" },
//               ],
//             },
//             (error: any, result: any) => {
//               if (error) reject(error);
//               else resolve(result);
//             }
//           )
//           .end(buffer);
//       });

//       const { secure_url, public_id } = uploadResult as any;
//       imageUrls.push(secure_url);
//       imagePublicIds.push(public_id);
//     }

//     // Generate unique phone number with slug for new entry
//     const uniquePhoneNumber =
//       await UserVerificationService.generateUniquePhoneNumber(phoneNumber);

//     // Create new status check entry with unique phone number
//     const statusCheckEntry = await UserVerificationService.createStatusCheck({
//       fullName,
//       address,
//       phoneNumber: uniquePhoneNumber, // Use the unique phone number
//       imageUrls,
//       imagePublicIds,
//     });

    // // Determine status to return (always based on original phone number)
    // let userStatus = "unencrypted"; // Default status for new users
    // let userId = statusCheckEntry._id;

    // if (existingUser) {
    //   userStatus = existingUser.status;
    //   userId = existingUser._id; // Use original user's ID for status
    // }

    // return NextResponse.json({
    //   success: true,
    //   data: {
    //     userId: userId,
    //     status: userStatus,
    //     isExistingUser: !!existingUser,
    //     statusCheckId: statusCheckEntry._id,
    //     originalPhoneNumber: phoneNumber,
    //     savedPhoneNumber: uniquePhoneNumber,
    //     message: existingUser
    //       ? `Status for existing user: ${userStatus}`
    //       : "New user created with pending status",
    //     statusDetails:
    //       {
    //         pending: "Your application is under review",
    //         encrypted: "Your verification has been encrypted",
    //         unencrypted: "Your verification was unencrypted",
    //       }[userStatus as "pending" | "encrypted" | "unencrypted"] ||
    //       "Status unknown",
    //   },
    // });
//   } catch (error: any) {
//     console.error("Status check error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: error.message || "Failed to check status",
//       },
//       { status: 500 }
//     );
//   }
// }
