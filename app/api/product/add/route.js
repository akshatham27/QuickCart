import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request) {
    try {
        // Debug Cloudinary configuration
        console.log("Cloudinary Config Check:", {
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? "✓ Present" : "✗ Missing",
            apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ? "✓ Present" : "✗ Missing",
            apiSecret: process.env.CLOUDINARY_API_SECRET ? "✓ Present" : "✗ Missing"
        });
        
        console.log("Starting product addition process...");
        
        const { userId } = getAuth(request);
        if (!userId) {
            console.error("No userId found in request");
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        console.log("User authenticated:", userId);

        const formData = await request.formData();
        console.log("Received form data fields:", [...formData.keys()]);
        
        const name = formData.get('name');
        const description = formData.get('description');
        const category = formData.get('category');
        const price = formData.get('price');
        const offerPrice = formData.get('offerPrice');
        const files = formData.getAll('images').filter(file => file.size > 0);

        console.log("Form data values:", { 
            name, description, category, price, offerPrice,
            filesCount: files.length,
            fileTypes: files.map(f => f.type)
        });

        // Validate required fields
        if (!name || !description || !category || !price || !offerPrice) {
            console.error("Missing required fields:", { name, description, category, price, offerPrice });
            return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
        }

        if (!files || files.length === 0) {
            console.error("No valid files uploaded");
            return NextResponse.json({ success: false, message: 'At least one image is required' }, { status: 400 });
        }

        // Upload images to Cloudinary
        console.log("Starting Cloudinary upload...");
        const uploadPromises = files.map((file, index) => {
            console.log(`Uploading file ${index + 1}:`, { 
                type: file.type, 
                size: file.size,
                name: file.name 
            });
            return uploadToCloudinary(file);
        });

        const imageUrls = await Promise.all(uploadPromises);
        console.log("Successfully uploaded images:", imageUrls);

        if (imageUrls.length === 0) {
            console.error("No images were successfully uploaded");
            return NextResponse.json({ success: false, message: 'Failed to upload images' }, { status: 500 });
        }

        // Connect to database
        console.log("Connecting to database...");
        await connectDB();
        console.log("Database connected successfully");

        // Create product
        console.log("Creating product in database with data:", {
            userId,
            name,
            description,
            category,
            price,
            offerPrice,
            imageCount: imageUrls.length
        });

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

        console.log("Product created successfully:", {
            id: product._id,
            name: product.name,
            imageUrls: product.image
        });

        return NextResponse.json({ 
            success: true, 
            message: 'Product added successfully', 
            product 
        }, { status: 201 });
    } catch (error) {
        console.error("Error in product addition:", error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || 'Failed to add product',
            error: error.stack
        }, { status: 500 });
    }
}
