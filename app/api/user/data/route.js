import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db.js";
import User from "@/models/User";


export async function GET(req) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // For now, return a basic user object with empty cart
        const user = {
            userId,
            cartItems: {},
            role: req.headers.get('x-user-role') || 'user'
        };

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error("Error fetching user data:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
} 