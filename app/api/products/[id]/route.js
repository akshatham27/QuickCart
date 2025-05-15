import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

// Get a single product
export async function GET(request, { params }) {
    try {
        console.log("Fetching product with ID:", params.id);
        await connectDB();
        
        const product = await Product.findById(params.id)
            .select('name description category price offerPrice image _id userId')
            .lean();

        if (!product) {
            console.log("Product not found");
            return NextResponse.json({ 
                success: false, 
                message: "Product not found" 
            }, { status: 404 });
        }

        // Validate product data
        const validatedProduct = {
            ...product,
            image: product.image || [],
            price: product.price || 0,
            offerPrice: product.offerPrice || 0,
            name: product.name || "Untitled Product",
            description: product.description || "",
            category: product.category || "Uncategorized"
        };

        console.log("Product found:", validatedProduct);

        return NextResponse.json({ 
            success: true, 
            product: validatedProduct 
        });
    } catch (error) {
        console.error("Error fetching product:", error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || "Failed to fetch product",
            error: error.stack
        }, { status: 500 });
    }
}

// Delete a product
export async function DELETE(request, { params }) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        
        // Find the product and verify ownership
        const product = await Product.findById(params.id);
        
        if (!product) {
            return NextResponse.json({ 
                success: false, 
                message: "Product not found" 
            }, { status: 404 });
        }

        if (product.userId !== userId) {
            return NextResponse.json({ 
                success: false, 
                message: "Unauthorized to delete this product" 
            }, { status: 403 });
        }

        // Delete the product
        await Product.findByIdAndDelete(params.id);

        return NextResponse.json({ 
            success: true, 
            message: "Product deleted successfully" 
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || "Failed to delete product"
        }, { status: 500 });
    }
} 