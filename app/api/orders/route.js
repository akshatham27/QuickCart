// File: /app/api/orders/route.js or /pages/api/orders/index.js
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import authSeller from "@/lib/authSeller";

// CREATE ORDERS
export async function POST(req) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const { items, totalAmount, shippingAddress, paymentMethod } = await req.json();

        if (!items?.length) return NextResponse.json({ success: false, message: "No items in order" }, { status: 400 });
        if (!shippingAddress) return NextResponse.json({ success: false, message: "Shipping address required" }, { status: 400 });
        if (!totalAmount || totalAmount <= 0) return NextResponse.json({ success: false, message: "Invalid total amount" }, { status: 400 });
        if (!['cod', 'online'].includes(paymentMethod)) return NextResponse.json({ success: false, message: "Invalid payment method" }, { status: 400 });

        const productIds = items.map(item => item.productId);
        const products = await Product.find({ _id: { $in: productIds } });

        if (products.length !== productIds.length) {
            return NextResponse.json({ success: false, message: "Some products not found" }, { status: 404 });
        }

        const ordersBySeller = {};
        items.forEach(item => {
            const product = products.find(p => p._id.toString() === item.productId);
            if (!product) return;

            if (!ordersBySeller[product.userId]) {
                ordersBySeller[product.userId] = { items: [], totalAmount: 0 };
            }

            ordersBySeller[product.userId].items.push({
                productId: product._id,
                quantity: item.quantity,
                price: product.offerPrice || product.price
            });

            ordersBySeller[product.userId].totalAmount += (product.offerPrice || product.price) * item.quantity;
        });

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

        console.log("Orders created successfully for user:", userId);

        return NextResponse.json({ success: true, message: "Orders created", orders });
    } catch (error) {
        console.error("Error creating order:", error);
        return NextResponse.json({ success: false, message: "Failed to create order", error: error.message }, { status: 500 });
    }
}

// GET ORDERS
export async function GET(req) {
    try {
        const { userId } = getAuth(req);
        if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

        await connectDB();

        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role');

        let orders;
        if (role === 'seller') {
            const isSeller = await authSeller(userId);
            if (!isSeller) return NextResponse.json({ success: false, message: "Unauthorized: Not a seller" }, { status: 403 });

            orders = await Order.find({ sellerId: userId })
                .populate({
                    path: 'items.productId',
                    model: 'Product',
                    select: 'name price offerPrice image'
                })
                .sort({ createdAt: -1 })
                .lean();
        } else {
            orders = await Order.find({ userId })
                .populate({
                    path: 'items.productId',
                    model: 'Product',
                    select: 'name price offerPrice image'
                })
                .sort({ createdAt: -1 })
                .lean();
        }

        const validatedOrders = orders.map(order => ({
            ...order,
            items: order.items.map(item => ({
                ...item,
                productId: item.productId || { name: 'Product Removed' }
            })),
            totalAmount: Number(order.totalAmount),
            status: order.status || 'pending'
        }));

        return NextResponse.json({ success: true, orders: validatedOrders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch orders", error: error.message }, { status: 500 });
    }
}
