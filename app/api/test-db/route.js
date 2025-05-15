import { NextResponse } from "next/server";
import connectDB from "@/lib/db";

export async function GET() {
    try {
        console.log("MongoDB URI:", process.env.MONGODB_URI);
        await connectDB();
        return NextResponse.json({ 
            success: true, 
            message: "Database connected successfully" 
        });
    } catch (error) {
        console.error("Connection test error:", {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        return NextResponse.json({ 
            success: false, 
            message: error.message 
        }, { status: 500 });
    }
} 