import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import authSeller from "@/lib/authSeller";

// Create a new order
export async function POST(req) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const { items, totalAmount, shippingAddress, paymentMethod } = await req.json();

        // Validate required fields
        if (!items || items.length === 0) {
            return NextResponse.json({ success: false, message: "No items in order" }, { status: 400 });
        }

        if (!shippingAddress) {
            return NextResponse.json({ success: false, message: "Shipping address is required" }, { status: 400 });
        }

        if (!totalAmount || totalAmount <= 0) {
            return NextResponse.json({ success: false, message: "Invalid total amount" }, { status: 400 });
        }

        if (!paymentMethod || !['cod', 'online'].includes(paymentMethod)) {
            return NextResponse.json({ success: false, message: "Invalid payment method" }, { status: 400 });
        }

        // Validate and fetch all products
        const productIds = items.map(item => item.productId);
        console.log("Attempting to find products with IDs:", productIds);
        
        const products = await Product.find({ _id: { $in: productIds } });
        console.log("Found products:", products.map(p => ({ id: p._id.toString(), name: p.name })));

        if (products.length === 0) {
            console.log("No products found in database");
            return NextResponse.json({ success: false, message: "No products found" }, { status: 404 });
        }

        if (products.length !== productIds.length) {
            const foundIds = products.map(p => p._id.toString());
            const missingIds = productIds.filter(id => !foundIds.includes(id.toString()));
            console.error("Product count mismatch. Found:", products.length, "Expected:", productIds.length);
            console.error("Missing products:", missingIds);
            return NextResponse.json({ success: false, message: "One or more products not found" }, { status: 404 });
        }

        // Group orders by seller
        const ordersBySeller = {};
        
        items.forEach(item => {
            const product = products.find(p => p._id.toString() === item.productId.toString());
            if (!product) return;

            if (!ordersBySeller[product.userId]) {
                ordersBySeller[product.userId] = {
                    items: [],
                    totalAmount: 0
                };
            }

            ordersBySeller[product.userId].items.push({
                productId: product._id,
                quantity: item.quantity,
                price: product.offerPrice || product.price
            });

            ordersBySeller[product.userId].totalAmount += 
                (product.offerPrice || product.price) * item.quantity;
        });

        // Create orders for each seller
        const orders = await Promise.all(
            Object.entries(ordersBySeller).map(([sellerId, orderData]) => {
                return Order.create({
                    userId,
                    sellerId,
                    items: orderData.items,
                    totalAmount: orderData.totalAmount,
                    shippingAddress,
                    paymentMethod,
                    status: 'pending',
                    createdAt: new Date()
                });
            })
        );

        return NextResponse.json({ 
            success: true, 
            message: "Orders created successfully",
            orders 
        });
    } catch (error) {
        console.error("Error creating order:", error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || "Failed to create order" 
        }, { status: 500 });
    }
}

// Get orders for a user
export async function GET(req) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            console.log("Unauthorized request: No userId found");
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        console.log("Connecting to database...");
        await connectDB();
        console.log("Database connected successfully");
        
        // Get the role query parameter
        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role');

        let orders;
        if (role === 'seller') {
            // Verify seller status
            const isSeller = await authSeller(userId);
            if (!isSeller) {
                console.log(`User ${userId} is not authorized as seller`);
                return NextResponse.json({ success: false, message: "Unauthorized: Not a seller" }, { status: 403 });
            }

            console.log(`Fetching orders for seller ${userId}`);
            // If role is seller, get orders where sellerId matches userId
            orders = await Order.find({ sellerId: userId })
                .populate({
                    path: 'items.productId',
                    model: 'Product',
                    select: 'name price offerPrice image'
                })
                .sort({ createdAt: -1 })
                .lean();

            console.log(`Found ${orders.length} orders for seller ${userId}`);
        } else {
            console.log(`Fetching orders for user ${userId}`);
            // Otherwise, get orders for the user
            orders = await Order.find({ userId })
                .populate({
                    path: 'items.productId',
                    model: 'Product',
                    select: 'name price offerPrice image'
                })
                .sort({ createdAt: -1 })
                .lean();

            console.log(`Found ${orders.length} orders for user ${userId}`);
        }

        // Validate and clean up order data
        const validatedOrders = orders.map(order => ({
            ...order,
            items: order.items.map(item => ({
                ...item,
                productId: item.productId || { name: 'Product Removed' }
            })),
            totalAmount: Number(order.totalAmount) || 0,
            status: order.status || 'pending',
            createdAt: order.createdAt || new Date()
        }));

        console.log("Successfully validated all orders");

        return NextResponse.json({ 
            success: true, 
            orders: validatedOrders 
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || "Failed to fetch orders",
            error: error.stack 
        }, { status: 500 });
    }
} 