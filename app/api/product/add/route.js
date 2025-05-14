import { v2 as cloudinary } from "cloudinary";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import authSeller from "@/lib/authSeller";
import connectDB from "@/lib/db.js";
import Product from "@/app/api/product/add/route"; // ✅ Make sure this path is correct

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const isSeller = await authSeller(userId);

    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const category = formData.get("category");
    const price = formData.get("price");
    const offerPrice = formData.get("offerPrice");
    const files = formData.getAll("images");

    if (!name || !description || !category || !price) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "No files uploaded" },
        { status: 400 }
      );
    }

    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(buffer);
        });
      })
    );

    const imageUrls = uploadedImages.map((img) => img.secure_url);

    await connectDB();

    const product = await Product.create({
      userId,
      name,
      description,
      category,
      price: Number(price),
      offerPrice: Number(offerPrice),
      image: imageUrls,
      date: Date.now(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product added successfully",
        newProduct: product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
