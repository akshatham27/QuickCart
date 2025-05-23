import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function GET() {
    try {
        console.log("Starting products fetch...");
        
        // Connect to database
        console.log("Connecting to database...");
        await connectDB();
        console.log("Database connected successfully");
        
        // Count total products
        const totalCount = await Product.countDocuments();
        console.log("Total products in database:", totalCount);

        // Fetch products with detailed error handling
        let products;
        try {
            products = await Product.find({})
                .sort({ date: -1 })
                .select('name description category price offerPrice image _id userId')
                .lean();
        } catch (dbError) {
            console.error("Database query error:", dbError);
            throw new Error(`Failed to query products: ${dbError.message}`);
        }

        console.log(`Found ${products?.length || 0} products`);
        
        if (!products || products.length === 0) {
            console.log("No products found in database");
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
                userId: product.userId,
                hasImages: product.image && product.image.length > 0,
                imageCount: product.image ? product.image.length : 0
            });
        });

        // Validate product data
        const validatedProducts = products.map(product => ({
            ...product,
            image: Array.isArray(product.image) ? product.image : [],
            price: Number(product.price) || 0,
            offerPrice: Number(product.offerPrice) || 0,
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
        console.error("Error fetching products:", error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || "Failed to fetch products",
            error: error.stack
        }, { status: 500 });
    }
} 