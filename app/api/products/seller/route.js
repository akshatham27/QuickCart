import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function GET(request) {
    try {
        console.log("Starting seller products fetch...");
        
        const { userId } = getAuth(request);
        if (!userId) {
            console.error("No userId found in request");
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        console.log("Seller ID:", userId);

        // Connect to database
        console.log("Connecting to database...");
        await connectDB();
        console.log("Database connected successfully");
        
        // Count seller's products
        const totalCount = await Product.countDocuments({ userId });
        console.log(`Total products for seller ${userId}:`, totalCount);

        // Fetch seller's products
        const products = await Product.find({ userId })
            .sort({ date: -1 })
            .select('name description category price offerPrice image _id')
            .lean();

        console.log(`Found ${products.length} products for seller`);
        
        if (!products || products.length === 0) {
            console.log("No products found for seller");
            return NextResponse.json({ 
                success: true, 
                products: [],
                message: "No products found",
                totalCount: 0
            });
        }

        // Log each product's basic info
        products.forEach((product, index) => {
            console.log(`Product ${index + 1}:`, {
                id: product._id,
                name: product.name,
                hasImages: product.image && product.image.length > 0,
                imageCount: product.image ? product.image.length : 0
            });
        });

        // Validate product data
        const validatedProducts = products.map(product => ({
            ...product,
            image: product.image || [],
            price: product.price || 0,
            offerPrice: product.offerPrice || 0,
            name: product.name || "Untitled Product",
            description: product.description || "",
            category: product.category || "Uncategorized"
        }));

        console.log("Successfully validated all products");

        return NextResponse.json({ 
            success: true, 
            products: validatedProducts,
            totalCount
        });
    } catch (error) {
        console.error("Error fetching seller products:", error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || "Failed to fetch products",
            error: error.stack
        }, { status: 500 });
    }
} 