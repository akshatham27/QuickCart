import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";

// Create a new order
export async function POST(req) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const { items, totalAmount, shippingAddress } = await req.json();

        // Validate items and get seller ID from the first product
        if (!items || items.length === 0) {
            return NextResponse.json({ success: false, message: "No items in order" }, { status: 400 });
        }

        // Get the first product to get the seller ID
        const firstProduct = await Product.findById(items[0].productId);
        if (!firstProduct) {
            return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
        }

        const order = await Order.create({
            userId,
            items,
            totalAmount,
            shippingAddress,
            sellerId: firstProduct.sellerId,
        });

        return NextResponse.json({ success: true, order });
    } catch (error) {
        console.error("Error creating order:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// Get orders for a user
export async function GET(req) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        
        // Get the role query parameter
        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role');

        let orders;
        if (role === 'seller') {
            // If role is seller, get orders where sellerId matches userId
            orders = await Order.find({ sellerId: userId })
                .populate('items.productId')
                .sort({ createdAt: -1 });
        } else {
            // Otherwise, get orders for the user
            orders = await Order.find({ userId })
                .populate('items.productId')
                .sort({ createdAt: -1 });
        }

        return NextResponse.json({ success: true, orders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
} 